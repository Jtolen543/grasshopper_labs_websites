import { OpenAI } from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// --- Output Schemas ---

const ResumeTweakSchema = z.object({
    id: z.string().describe("Unique identifier like 'tweak_1'"),
    insight: z.string().describe("Specific, actionable resume edit. Reference exact content from the resume."),
    priority: z.enum(["high", "medium", "low"]),
    category: z.enum(["projects", "experience", "skills", "links", "gpa", "coursework", "formatting"]),
});

const CareerGoalSchema = z.object({
    id: z.string().describe("Unique identifier like 'goal_1'"),
    insight: z.string().describe("Specific career development action. Be concrete — name specific technologies, clubs, course topics, project ideas."),
    priority: z.enum(["high", "medium", "low"]),
    category: z.enum(["projects", "experience", "skills", "links", "gpa", "coursework", "formatting"]),
    targetYear: z.number().min(1).max(4).describe("Which academic year this goal belongs to (1=Freshman, 2=Sophomore, 3=Junior, 4=Senior)"),
});

const InsightsResultSchema = z.object({
    resumeTweaks: z.array(ResumeTweakSchema).describe("5-10 specific resume edits: rewrite bullet points, add metrics, fix formatting, add missing sections"),
    careerGoals: z.array(CareerGoalSchema).describe("8-15 career development goals distributed across the student's remaining years"),
});

const MODEL = "gpt-4.1-mini";

const YEAR_LABELS: Record<number, string> = {
    1: "Freshman",
    2: "Sophomore",
    3: "Junior",
    4: "Senior",
};

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { resumeData, preferences, yearInSchool } = await request.json();

        if (!resumeData) {
            return NextResponse.json({ error: "No resume data provided" }, { status: 400 });
        }

        const currentYear: number = yearInSchool || 1;
        const currentYearLabel = YEAR_LABELS[currentYear] || "Freshman";
        const client = new OpenAI();

        // Build survey context
        let surveyContext = "The student has NOT completed a career preferences survey.";
        if (preferences) {
            const parts: string[] = [];
            if (preferences.techSectors?.length) parts.push(`Target sectors: ${preferences.techSectors.join(", ")}`);
            if (preferences.roleTypes?.length) parts.push(`Target roles: ${preferences.roleTypes.join(", ")}`);
            if (preferences.technicalSkills?.length) parts.push(`Skills they want to develop: ${preferences.technicalSkills.join(", ")}`);
            if (preferences.workEnvironment?.length) parts.push(`Preferred work environment: ${preferences.workEnvironment.join(", ")}`);
            if (preferences.companySize?.length) parts.push(`Preferred company size: ${preferences.companySize.join(", ")}`);
            if (preferences.location?.length) parts.push(`Location preferences: ${preferences.location.join(", ")}`);
            if (parts.length > 0) {
                surveyContext = `The student completed a career preferences survey:\n${parts.join("\n")}`;
            }
        }

        // Build education context
        const education = resumeData.education?.[0];
        const schoolName = education?.school || "their university";
        const major = education?.field || education?.degree || "Computer Science";
        const gpa = education?.gpa ? `GPA: ${education.gpa}` : "";

        // Build year distribution guide
        const yearGuide: string[] = [];
        for (let y = currentYear; y <= 4; y++) {
            const label = YEAR_LABELS[y];
            if (y === currentYear) {
                yearGuide.push(`Year ${y} (${label} — CURRENT): Focus on foundational steps the student can start NOW outside the classroom`);
            } else if (y === 2) {
                yearGuide.push(`Year ${y} (${label}): Build foundational skills, join clubs, start personal projects, take key courses`);
            } else if (y === 3) {
                yearGuide.push(`Year ${y} (${label}): Pursue internships, contribute to open source, deepen technical skills, take advanced courses`);
            } else if (y === 4) {
                yearGuide.push(`Year ${y} (${label}): Polish portfolio, leadership roles, prepare for full-time job search, get return offers`);
            }
        }

        const prompt = `
You are analyzing a ${currentYearLabel} CS student's resume and career survey to generate two types of recommendations.

=== STUDENT CONTEXT ===
- Current year: ${currentYearLabel} (year ${currentYear} of 4)
- School: ${schoolName}
- Major: ${major}
${gpa ? `- ${gpa}` : ""}

=== CAREER SURVEY ===
${surveyContext}

=== RESUME DATA ===
${JSON.stringify(resumeData, null, 2)}

=== INSTRUCTIONS ===

Generate two groups of recommendations:

## 1. resumeTweaks (5-10 items)
These are SPECIFIC EDITS to make on the resume document itself:
- Rewrite weak bullet points with better action verbs and metrics
- Add quantitative accomplishments to specific projects (reference them by name)
- Fix formatting issues (inconsistent tense, missing periods, etc.)
- Add missing sections (e.g., links, certifications)
- Improve descriptions to better match target roles from the survey
- Reference EXACT project names, job titles, and content from their resume

Example: "In your Club Companion project, change 'worked on features' to 'Developed 3 user-facing features that increased student engagement by 40%'"

## 2. careerGoals (8-15 items, distributed across years ${currentYear}-4)
These are things to do OUTSIDE the classroom to build their career:
- Specific courses to take (based on gaps between their skills and target roles)
- Programming languages/frameworks to learn (based on survey technicalSkills and target sectors)
- Clubs or organizations to join at ${schoolName} (e.g., ACM, hackathon teams, research groups)
- Side projects to build (specific ideas related to their target sectors)
- Internships to pursue (based on target company size and sectors)
- Certifications to get (AWS, Google Cloud, etc. based on target roles)
- Open source contributions, competitions, or hackathons
- Leadership and networking opportunities

Each career goal MUST have a targetYear (${currentYear}-4) indicating when it should be done.
${yearGuide.map(y => `- ${y}`).join("\n")}

BE VERY SPECIFIC. Don't say "learn a new framework" — say "Learn React and Next.js to prepare for Frontend Developer roles at FinTech companies."
Use the survey data to make every suggestion directly relevant to their career goals.
`;

        const result = await client.responses.parse({
            model: MODEL,
            input: [
                {
                    role: "system",
                    content: "You are an expert career advisor for CS students. Generate extremely specific, actionable recommendations. For resume tweaks, reference exact content from the resume. For career goals, use the student's survey preferences to suggest specific courses, technologies, clubs, and projects."
                },
                { role: "user", content: prompt }
            ],
            text: {
                format: zodTextFormat(InsightsResultSchema, "insights")
            },
            temperature: 0.4,
        });

        return NextResponse.json({ success: true, data: result.output_parsed });

    } catch (error) {
        console.error("Error generating insights:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to generate insights"
        }, { status: 500 });
    }
}
