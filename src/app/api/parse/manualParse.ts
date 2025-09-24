
interface KeywordsInterface {
  skills: string[]
  experience: string[]
  education: string[]
  certifications: string[]
  languages: string[]
}

function extractKeywords(text: string): KeywordsInterface {
  const lowerText = text.toLowerCase()

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

export const extractWithProgramming = (content: string) => {
  const keywords = extractKeywords(content)

  const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length
  const hasContactInfo = /\b[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/.test(content)
  const hasPhoneNumber = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(content)

  let gpas = []
  let match;
  const regex = /[gG][pP][aA]\s*[:\-]?\s*([0-4](?:\.\d{1,2})?)(?:\s*\/\s*([0-4](?:\.\d{1,2})?))?/g;
  while ((match = regex.exec(content)) !== null) {
    const numerator = match[1]
    const denominator = match[2]

    const current = parseFloat(numerator)
    const scale = denominator ? parseFloat(denominator) : 4.0
    gpas.push(`${current}/${scale}`);
  }

  return {
      success: true,
      analysis: {
        wordCount,
        hasContactInfo,
        hasPhoneNumber,
        keywords,
        hasGPA: gpas.length > 0 ? true : false,
        summary: {
          totalSkills: keywords.skills.length,
          totalExperience: keywords.experience.length,
          totalEducation: keywords.education.length,
          gpas,
          totalCertifications: keywords.certifications.length,
          totalLanguages: keywords.languages.length,
        },
      },
    }
}