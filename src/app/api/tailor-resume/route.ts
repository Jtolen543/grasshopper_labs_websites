import { OpenAI } from "openai"
import { z } from "zod"
import { zodTextFormat } from "openai/helpers/zod.mjs"
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getJsonFromS3 } from "@/lib/aws/s3"
import type { Resume } from "@/app/api/parse/resumeSchema"

const MODEL = "gpt-4.1-mini"

const SelectionSchema = z.object({
  selectedExperienceIndices: z
    .array(z.number())
    .describe("0-based indices into the experiences array — pick up to 3 most relevant"),
  selectedProjectIndices: z
    .array(z.number())
    .describe("0-based indices into the projects array — pick up to 4 most relevant"),
  selectionReasoning: z
    .array(z.string())
    .describe("One short sentence per selected item explaining why it was chosen for this role"),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { jobTitle, jobDescription, jobCompany } = await request.json()
    if (!jobDescription?.trim()) {
      return NextResponse.json({ success: false, error: "No job description provided" }, { status: 400 })
    }

    // Master profile is the bank of all experiences; current resume has latest basics/education
    const [masterProfile, currentResume] = await Promise.all([
      getJsonFromS3<Resume>(`uploads/${userId}/master-profile.json`),
      getJsonFromS3<Resume>(`uploads/${userId}/resume-data.json`),
    ])

    const bank = masterProfile || currentResume
    if (!bank) {
      return NextResponse.json({ success: false, error: "No resume data found. Upload a resume first." }, { status: 400 })
    }

    const experiences = bank.experience || []
    const projects = bank.projects || []

    const expList = experiences
      .map((e, i) => {
        const bullets = [...(e.responsibilities || []), ...(e.achievements || [])].slice(0, 3).join("; ")
        return `[${i}] ${e.position} at ${e.company} (${e.start_date || "?"} – ${e.end_date || "Present"})\n    Technologies: ${(e.technologies || []).join(", ") || "n/a"}\n    ${bullets}`
      })
      .join("\n\n")

    const projList = projects
      .map((p, i) => `[${i}] ${p.name} [${(p.technologies || []).join(", ")}]\n    ${p.description || ""}`)
      .join("\n\n")

    const client = new OpenAI()

    const result = await client.responses.parse({
      model: MODEL,
      input: [
        {
          role: "system",
          content: "You are an expert resume tailor. Select the optimal subset of a candidate's experiences and projects that maximally aligns with the given job role.",
        },
        {
          role: "user",
          content: `TARGET ROLE: ${jobTitle || "Software Engineer"} at ${jobCompany || "the company"}
JOB DESCRIPTION:
${jobDescription.slice(0, 1200)}

CANDIDATE EXPERIENCES (all of them):
${expList || "None listed"}

CANDIDATE PROJECTS (all of them):
${projList || "None listed"}

Select up to 3 experiences and up to 4 projects by index. Prefer technical alignment with the job description, recent experience, and demonstrated impact. Return your selections with a brief rationale for each.`,
        },
      ],
      text: { format: zodTextFormat(SelectionSchema, "selection") },
      temperature: 0.3,
    })

    const selection = result.output_parsed
    if (!selection) return NextResponse.json({ success: false, error: "Selection failed" }, { status: 500 })

    // Build tailored resume: master profile items + current basics/education
    const tailoredResume: Resume = {
      ...bank,
      // Use latest resume's basics + education (most current contact info / GPA)
      basics: currentResume?.basics ?? bank.basics,
      education: currentResume?.education ?? bank.education,
      // Only include selected items
      experience: selection.selectedExperienceIndices
        .filter((i) => i >= 0 && i < experiences.length)
        .map((i) => experiences[i]),
      projects: selection.selectedProjectIndices
        .filter((i) => i >= 0 && i < projects.length)
        .map((i) => projects[i]),
    }

    return NextResponse.json({
      success: true,
      data: {
        tailoredResume,
        reasoning: selection.selectionReasoning,
        selected: {
          experiences: selection.selectedExperienceIndices.map((i) => experiences[i]?.company + " – " + experiences[i]?.position).filter(Boolean),
          projects: selection.selectedProjectIndices.map((i) => projects[i]?.name).filter(Boolean),
        },
      },
    })
  } catch (error) {
    console.error("tailor-resume error:", error)
    return NextResponse.json({ success: false, error: "Failed to tailor resume" }, { status: 500 })
  }
}
