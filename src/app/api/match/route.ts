import { OpenAI } from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3";
import type { Resume } from "@/app/api/parse/resumeSchema";

const MODEL = "gpt-4.1-mini";

// --- Schemas ---

const RoleSuggestionSchema = z.object({
    title: z.string().describe("Job title, e.g. 'Frontend Engineer', 'ML Research Intern'"),
    matchScore: z.number().describe("0-100 how well the resume aligns with this role"),
    reasoning: z.string().describe("2-3 sentence explanation of why this is a good match"),
    matchingSkills: z.array(z.string()).describe("Skills from the resume that align with this role"),
    missingSkills: z.array(z.string()).describe("Important skills for this role that the resume lacks"),
    growthAreas: z.array(z.string()).describe("1-3 suggestions for how to grow toward this role"),
});

const SuggestResultSchema = z.object({
    suggestions: z.array(RoleSuggestionSchema).describe("Top 5 role suggestions sorted by match score descending"),
});

const CompareBreakdownSchema = z.object({
    skillsMatch: z.number().describe("0-100 how well resume skills match the job requirements"),
    experienceMatch: z.number().describe("0-100 how well resume experience matches the job"),
    educationMatch: z.number().describe("0-100 how well education/coursework matches"),
});

const CompareResultSchema = z.object({
    overallMatch: z.number().describe("0-100 overall alignment score"),
    breakdown: CompareBreakdownSchema,
    strengths: z.array(z.string()).describe("3-5 specific strengths the candidate brings"),
    gaps: z.array(z.string()).describe("2-4 specific gaps between the resume and job description"),
    recommendations: z.array(z.string()).describe("3-5 actionable recommendations to improve alignment"),
});

// --- Helpers ---

function buildResumeSummary(resume: Resume): string {
    const skills = resume.skills
        ? Object.entries(resume.skills).map(([cat, items]) => `${cat}: ${items.join(", ")}`).join("\n")
        : "None listed";

    const projects = (resume.projects || [])
        .map(p => `• ${p.name}: ${p.description || ""} [${p.technologies.join(", ")}]`)
        .join("\n");

    const experience = (resume.experience || [])
        .map(e => `• ${e.position} at ${e.company} — ${[...e.responsibilities, ...e.achievements].slice(0, 3).join("; ")}`)
        .join("\n");

    const education = (resume.education || [])
        .map(e => `${e.degree} in ${e.field} at ${e.school}${e.gpa ? ` (GPA: ${e.gpa})` : ""}`)
        .join("; ");

    return `
SKILLS:
${skills}

PROJECTS:
${projects || "None"}

EXPERIENCE:
${experience || "None"}

EDUCATION:
${education || "Not specified"}
`.trim();
}

// --- GET: serve cached suggestions ---

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const cached = await getJsonFromS3(`uploads/${userId}/match-suggestions.json`);
        if (cached) {
            return NextResponse.json({ success: true, data: cached });
        }
        return NextResponse.json({ success: false, data: null });
    } catch {
        return NextResponse.json({ success: false, data: null });
    }
}

// --- POST: suggest or compare ---

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { mode } = body as { mode: "suggest" | "compare" };

        // Load resume
        const resume = await getJsonFromS3<Resume>(`uploads/${userId}/resume-data.json`);
        if (!resume) {
            return NextResponse.json({ error: "No resume found. Upload a resume first." }, { status: 400 });
        }

        // Load preferences if available
        let preferencesText = "";
        try {
            const prefs = await getJsonFromS3<Record<string, any>>(`uploads/${userId}/preferences.json`);
            if (prefs) {
                const parts: string[] = [];
                if (prefs.techSectors?.length) parts.push(`Preferred sectors: ${prefs.techSectors.join(", ")}`);
                if (prefs.roleTypes?.length) parts.push(`Preferred roles: ${prefs.roleTypes.join(", ")}`);
                if (prefs.location?.length) parts.push(`Preferred locations: ${prefs.location.join(", ")}`);
                if (prefs.workEnvironment?.length) parts.push(`Work environment: ${prefs.workEnvironment.join(", ")}`);
                preferencesText = parts.join("\n");
            }
        } catch { /* no preferences, that's fine */ }

        const resumeSummary = buildResumeSummary(resume);
        const client = new OpenAI();

        if (mode === "suggest") {
            const prompt = `
Based on this resume and preferences, suggest the top 5 job roles that best match the candidate's profile.
Consider their skills, project work, experience, education, and stated preferences.
Rank by match score. Be specific with role titles (e.g. "Junior Frontend Engineer at a Fintech Startup" not just "Frontend Developer").

=== RESUME ===
${resumeSummary}

${preferencesText ? `=== PREFERENCES ===\n${preferencesText}` : ""}
`;

            const result = await client.responses.parse({
                model: MODEL,
                input: [
                    { role: "system", content: "You are a career advisor. Suggest the most realistic and well-matched job roles for this candidate. Be specific and practical." },
                    { role: "user", content: prompt }
                ],
                text: { format: zodTextFormat(SuggestResultSchema, "role_suggestions") },
                temperature: 0.4,
            });

            const data = result.output_parsed;

            // Cache
            await putJsonToS3(`uploads/${userId}/match-suggestions.json`, data);

            return NextResponse.json({ success: true, data });

        } else if (mode === "compare") {
            const { jobDescription } = body as { mode: "compare"; jobDescription: string };

            if (!jobDescription || jobDescription.trim().length < 20) {
                return NextResponse.json({ error: "Please provide a job description (at least 20 characters)." }, { status: 400 });
            }

            const prompt = `
Compare this resume against the following job description. Score the alignment and provide actionable feedback.

=== RESUME ===
${resumeSummary}

=== JOB DESCRIPTION ===
${jobDescription}
`;

            const result = await client.responses.parse({
                model: MODEL,
                input: [
                    { role: "system", content: "You are an expert recruiter. Objectively score how well this candidate matches the job description. Be honest about gaps but also highlight genuine strengths." },
                    { role: "user", content: prompt }
                ],
                text: { format: zodTextFormat(CompareResultSchema, "job_match") },
                temperature: 0.3,
            });

            return NextResponse.json({ success: true, data: result.output_parsed });

        } else {
            return NextResponse.json({ error: "Invalid mode. Use 'suggest' or 'compare'." }, { status: 400 });
        }

    } catch (error) {
        console.error("Error in match API:", error);
        return NextResponse.json({ success: false, error: "Failed to process match request" }, { status: 500 });
    }
}
