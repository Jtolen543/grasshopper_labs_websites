import { OpenAI } from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3";
import type { Resume } from "@/app/api/parse/resumeSchema";
import { calculateResumeScoreDetailed } from "@/lib/resumeScoring";

// GET — serve cached XYZ feedback + insights
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
        }

        const data = await getJsonFromS3(`uploads/${userId}/xyz-feedback.json`);
        if (!data) {
            return NextResponse.json({ success: false, data: null });
        }
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, data: null });
    }
}

const FeedbackItemSchema = z.object({
    score: z.number().describe("Score from 0-100 based on usage of XYZ formula and quantitative metrics"),
    xyz_analysis: z.string().describe("Brief explanation of how well the description follows 'Accomplished [X] as measured by [Y], by doing [Z]'"),
    improvements: z.array(z.string()).describe("2-3 specific rewritten versions improving the description using the XYZ formula"),
});

const InsightSchema = z.object({
    id: z.string().describe("Unique ID like 'tweak_1', 'goal_1', etc."),
    category: z.enum(["projects", "experience", "skills", "gpa", "coursework", "links", "formatting"]),
    insight: z.string().describe("A specific, actionable recommendation"),
    priority: z.enum(["high", "medium", "low"]),
    type: z.enum(["tweak", "goal"]).describe("tweak = specific resume edit, goal = career development action"),
    targetYear: z.union([z.number(), z.null()]).describe("For goals: which relative year (1 = this year, 2 = next year, etc.). Set to null for tweaks."),
});

const BatchResultSchema = z.object({
    projects: z.array(z.object({
        index: z.number(),
        feedback: FeedbackItemSchema,
    })).describe("XYZ analysis for each project, by index"),
    experience: z.array(z.object({
        index: z.number(),
        feedback: FeedbackItemSchema,
    })).describe("XYZ analysis for each experience entry, by index"),
    actionableInsights: z.array(InsightSchema).describe("Actionable insights: 5-8 resume tweaks + 8-12 career goals distributed across remaining academic years"),
});

const MODEL = "gpt-4.1-mini";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { resumeData, graduationYear, currentYear, preferences } = await request.json() as { resumeData: Resume; graduationYear?: number; currentYear?: number; preferences?: Record<string, any> };

        if (!resumeData) {
            return NextResponse.json({ error: "No resume data provided" }, { status: 400 });
        }

        const client = new OpenAI();

        // Build a concise summary of all items to analyze
        const projectItems = (resumeData.projects || []).map((p, i) => {
            const text = [p.description, ...(p.highlights || [])].filter(Boolean).join("\n");
            return `PROJECT ${i}: "${p.name}"\n${text}`;
        });

        const experienceItems = (resumeData.experience || []).map((e, i) => {
            const text = [...(e.responsibilities || []), ...(e.achievements || [])].filter(Boolean).join("\n");
            return `EXPERIENCE ${i}: "${e.position}" at "${e.company}"\n${text}`;
        });

        // Build a resume overview for insights context
        const allSkills = resumeData.skills
            ? Object.values(resumeData.skills).flat().filter(Boolean)
            : [];
        const education = resumeData.education?.[0];
        const schoolName = education?.school || "their university";
        const major = education?.field || education?.degree || "Computer Science";
        const resumeOverview = [
            allSkills.length ? `Skills: ${allSkills.join(", ")}` : null,
            resumeData.education?.length ? `Education: ${resumeData.education.map(e => `${e.degree} in ${e.field} at ${e.school}${e.gpa ? ` (GPA: ${e.gpa})` : ""}`).join("; ")}` : null,
            resumeData.basics ? `Links: ${[resumeData.basics.linkedin, resumeData.basics.github, resumeData.basics.portfolio].filter(Boolean).join(", ")}` : null,
        ].filter(Boolean).join("\n");

        const actualCurrentYear = currentYear || new Date().getFullYear();
        const actualGradYear = graduationYear || actualCurrentYear + 3;

        // Build relative year labels: 2025 (Freshman), 2026 (Sophomore), etc. backward from graduation
        function getYearLabel(year: number, grad: number): string {
            const diff = grad - year;
            if (diff === 0) return `${year} (Senior Year / Graduation)`;
            if (diff === 1) return `${year} (Junior Year)`;
            if (diff === 2) return `${year} (Sophomore Year)`;
            if (diff === 3) return `${year} (Freshman Year)`;
            return `${year}`;
        }

        let surveyContext = "";
        if (preferences) {
            const parts: string[] = [];
            if (preferences.techSectors?.length) parts.push(`Target sectors: ${preferences.techSectors.join(", ")}`);
            if (preferences.roleTypes?.length) parts.push(`Target roles: ${preferences.roleTypes.join(", ")}`);
            if (preferences.technicalSkills?.length) parts.push(`Skills they want to develop: ${preferences.technicalSkills.join(", ")}`);
            if (preferences.workEnvironment?.length) parts.push(`Preferred work environment: ${preferences.workEnvironment.join(", ")}`);
            if (preferences.companySize?.length) parts.push(`Preferred company size: ${preferences.companySize.join(", ")}`);
            if (parts.length > 0) {
                surveyContext = `\n=== CAREER SURVEY ===\n${parts.join("\n")}`;
            }
        }

        // Build year distribution guide based on current and graduation years. Cap at max 5 years
        const maxYears = Math.min((actualGradYear - actualCurrentYear) + 1, 5);
        const yearGuide: string[] = [];
        for (let i = 0; i < maxYears; i++) {
            const y = actualCurrentYear + i;
            const label = getYearLabel(y, actualGradYear);
            if (i === 0) yearGuide.push(`targetYear=${y} (${label}): things to start doing NOW outside the classroom`);
            else if (y >= actualGradYear) yearGuide.push(`targetYear=${y} (${label}): final year — polish portfolio, leadership, full-time job prep`);
            else yearGuide.push(`targetYear=${y} (${label}): build skills, pursue internships, take courses`);
        }

        if (projectItems.length === 0 && experienceItems.length === 0) {
            const emptyResult = { projects: {}, experience: {}, actionableInsights: [] };
            await putJsonToS3(`uploads/${userId}/xyz-feedback.json`, emptyResult);
            
            const metadataKey = `uploads/${userId}/submissions-metadata.json`;
            const metadata = await getJsonFromS3<{submissions: any[]}>(metadataKey);
            if (metadata && metadata.submissions.length > 0) {
                await putJsonToS3(`uploads/${userId}/xyz-feedback-${metadata.submissions[0].id}.json`, emptyResult);
            }

            return NextResponse.json({ success: true, data: emptyResult });
        }

        const prompt = `
Analyze this CS student's resume and provide:

1. XYZ Formula Analysis for each project and experience item:
   - Score (0-100) based on "Accomplished [X] as measured by [Y], by doing [Z]"
   - Brief analysis of adherence
   - 2-3 rewritten versions that improve it

2. Actionable Insights (two types):

   a) RESUME TWEAKS (type="tweak", 5-8 items, set targetYear to null):
      Specific edits to make on the resume RIGHT NOW. Rewrite bullet points, add metrics,
      fix formatting, add missing sections. Reference EXACT content from the resume.
      Example: "In your Club Companion project, change 'worked on features' to 'Developed 3 user-facing features increasing engagement by 40%'"

   b) CAREER GOALS (type="goal", 8-12 items, MUST set targetYear to a calendar year like ${actualCurrentYear}, ${actualCurrentYear+1}):
      Things to do OUTSIDE the classroom to build their career:
      - Courses to take (based on skill gaps for target roles)
      - Languages/frameworks to learn (based on survey preferences)
      - Clubs to join at ${schoolName} (ACM, hackathon teams, research groups)
      - Side projects to build (specific ideas matching target sectors)
      - Internships to target (based on preferred company size and sectors)
      - Certifications (AWS, Google Cloud, etc.)
      - Open source, competitions, networking

      Year distribution: ${yearGuide.join("; ")}

      BE VERY SPECIFIC. Don't say "learn a new framework" — say "Learn React and Next.js to prepare for Frontend Developer roles."

=== STUDENT CONTEXT ===
Graduation Year: ${actualGradYear}
Current Year: ${actualCurrentYear}
School: ${schoolName}
Major: ${major}

=== RESUME OVERVIEW ===
${resumeOverview}
${surveyContext}

${projectItems.length > 0 ? "=== PROJECTS ===\n" + projectItems.join("\n\n") : ""}

${experienceItems.length > 0 ? "=== EXPERIENCE ===\n" + experienceItems.join("\n\n") : ""}
`;

        const result = await client.responses.parse({
            model: MODEL,
            input: [
                { role: "system", content: "You are an expert resume consultant. Analyze each item for XYZ formula adherence, then synthesize findings into actionable insights. Be specific — reference actual content from the resume." },
                { role: "user", content: prompt }
            ],
            text: {
                format: zodTextFormat(BatchResultSchema, "batch_feedback")
            },
            temperature: 0.3,
        });

        const feedbackData = result.output_parsed;

        // Transform to index-keyed maps for easy lookup
        const indexed = {
            projects: Object.fromEntries(
                (feedbackData?.projects || []).map(p => [p.index, p.feedback])
            ),
            experience: Object.fromEntries(
                (feedbackData?.experience || []).map(e => [e.index, e.feedback])
            ),
            actionableInsights: (feedbackData?.actionableInsights || []).map((i, idx) => ({
                ...i,
                // AI often generates colliding IDs like "goal_1", "goal_1". Create a truely unique ID
                id: `${i.id}_${idx}_${Date.now()}`,
                checked: false,
            })),
        };

        // Cache to S3
        await putJsonToS3(`uploads/${userId}/xyz-feedback.json`, indexed);

        const metadataKey = `uploads/${userId}/submissions-metadata.json`;
        const metadata = await getJsonFromS3<{submissions: any[]}>(metadataKey);
        if (metadata && metadata.submissions.length > 0) {
            await putJsonToS3(`uploads/${userId}/xyz-feedback-${metadata.submissions[0].id}.json`, indexed);
            
            // Re-calculate score with the new feedback
            const resumeData = await getJsonFromS3<Resume>(`uploads/${userId}/resume-data.json`);
            if (resumeData) {
                const newScore = calculateResumeScoreDetailed(resumeData, indexed).totalScore;
                metadata.submissions[0].score = newScore;
                await putJsonToS3(metadataKey, metadata);
            }
        }

        return NextResponse.json({ success: true, data: indexed });

    } catch (error) {
        console.error("Error in batch XYZ analysis:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to generate batch analysis"
        }, { status: 500 });
    }
}
