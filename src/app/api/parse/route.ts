import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// Simple keyword extraction function
function extractKeywords(text: string): {
  skills: string[]
  experience: string[]
  education: string[]
  certifications: string[]
  languages: string[]
} {
  const lowerText = text.toLowerCase()

  // Common technical skills
  const skillKeywords = [
    "javascript",
    "typescript",
    "python",
    "java",
    "react",
    "node.js",
    "angular",
    "vue",
    "html",
    "css",
    "sql",
    "mongodb",
    "postgresql",
    "mysql",
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "git",
    "agile",
    "scrum",
    "rest api",
    "graphql",
    "microservices",
    "machine learning",
    "ai",
    "data analysis",
    "excel",
    "powerbi",
    "tableau",
    "photoshop",
    "illustrator",
    "figma",
    "sketch",
    "ui/ux",
    "design",
    "marketing",
    "project management",
    "leadership",
    "communication",
    "problem solving",
  ]

  // Experience indicators
  const experienceKeywords = [
    "years of experience",
    "senior",
    "lead",
    "manager",
    "director",
    "architect",
    "developed",
    "implemented",
    "managed",
    "led",
    "created",
    "designed",
    "collaborated",
    "coordinated",
    "supervised",
    "mentored",
  ]

  // Education keywords
  const educationKeywords = [
    "bachelor",
    "master",
    "phd",
    "degree",
    "university",
    "college",
    "computer science",
    "engineering",
    "business",
    "marketing",
    "design",
    "mathematics",
    "statistics",
  ]

  // Certification keywords
  const certificationKeywords = [
    "certified",
    "certification",
    "aws certified",
    "microsoft certified",
    "google certified",
    "pmp",
    "scrum master",
    "cissp",
    "comptia",
    "cisco",
    "oracle certified",
  ]

  // Language keywords
  const languageKeywords = [
    "english",
    "spanish",
    "french",
    "german",
    "chinese",
    "japanese",
    "korean",
    "portuguese",
    "italian",
    "russian",
    "arabic",
    "hindi",
    "native",
    "fluent",
    "conversational",
  ]

  const extractFromKeywords = (keywords: string[]) => {
    return keywords.filter((keyword) => lowerText.includes(keyword))
  }

  return {
    skills: extractFromKeywords(skillKeywords),
    experience: extractFromKeywords(experienceKeywords),
    education: extractFromKeywords(educationKeywords),
    certifications: extractFromKeywords(certificationKeywords),
    languages: extractFromKeywords(languageKeywords),
  }
}

// Parse different file types
async function parseFileContent(filepath: string, fileType: string): Promise<string> {
  try {
    if (fileType === "text/plain") {
      return await readFile(filepath, "utf-8")
    }

    if (fileType === "application/pdf") {
      const buffer = await readFile(filepath)
      return buffer.toString("utf-8").replace(/[^\x20-\x7E]/g, " ")
    }

    if (fileType.includes("word") || fileType.includes("document")) {

      const buffer = await readFile(filepath)
      return buffer.toString("utf-8").replace(/[^\x20-\x7E]/g, " ")
    }

    return ""
  } catch (error) {
    console.error("Error parsing file:", error)
    return ""
  }
}

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 })
    }

    const filepath = join(process.cwd(), "uploads", filename)

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const extension = filename.split(".").pop()?.toLowerCase()
    let fileType = "text/plain"

    if (extension === "pdf") {
      fileType = "application/pdf"
    } else if (extension === "doc") {
      fileType = "application/msword"
    } else if (extension === "docx") {
      fileType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }

    const content = await parseFileContent(filepath, fileType)

    const keywords = extractKeywords(content)

    const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length
    const hasContactInfo = /\b[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/.test(content)
    const hasPhoneNumber = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(content)

    return NextResponse.json({
      success: true,
      filename,
      analysis: {
        wordCount,
        hasContactInfo,
        hasPhoneNumber,
        keywords,
        summary: {
          totalSkills: keywords.skills.length,
          totalExperience: keywords.experience.length,
          totalEducation: keywords.education.length,
          totalCertifications: keywords.certifications.length,
          totalLanguages: keywords.languages.length,
        },
      },
    })
  } catch (error) {
    console.error("Error parsing resume:", error)
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}
