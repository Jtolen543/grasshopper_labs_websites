import type { Resume } from "./resumeSchema"

// Enhanced regex-based resume parser
export function extractWithRegex(content: string): { details: Resume | null; missing: string[] } {
  const missing: string[] = []

  // Clean up content - normalize whitespace and newlines
  const cleanContent = content.replace(/\r\n/g, "\n").replace(/\t/g, " ")

  // Helper function to extract email
  const extractEmail = (): string => {
    // Match email but not what comes after it
    const emailRegex = /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g
    const matches = cleanContent.match(emailRegex)
    if (!matches || matches.length === 0) {
      missing.push("Email not found")
      return ""
    }
    // Return first valid email, clean it
    const email = matches[0].trim()
    // Remove any trailing characters like | or other symbols
    return email.split(/[|\s]/)[0]
  }

  // Helper function to extract phone
  const extractPhone = (): string => {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
    const match = cleanContent.match(phoneRegex)
    if (!match) missing.push("Phone number not found")
    return match ? match[0].trim() : ""
  }

  // Helper function to extract name (usually first line or near contact info)
  const extractName = (): string => {
    const lines = cleanContent.split("\n").map((l) => l.trim()).filter((l) => l.length > 0)
    // Look for a line that looks like a name (2-4 words, capitalized, no URLs or special chars)
    const nameRegex = /^([A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+){1,3})$/
    for (const line of lines.slice(0, 10)) {
      // Skip lines with URLs or emails
      if (line.includes("@") || line.includes("http") || line.includes(".com")) continue
      if (nameRegex.test(line) && line.split(" ").length <= 4) {
        return line
      }
    }
    // Fallback: first non-empty line
    if (!lines[0]) missing.push("Name not found")
    return lines[0] || ""
  }

  // Helper function to extract LinkedIn
  const extractLinkedIn = (): string => {
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/i
    const match = cleanContent.match(linkedinRegex)
    return match ? match[0] : ""
  }

  // Helper function to extract GitHub
  const extractGitHub = (): string => {
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/?/i
    const match = cleanContent.match(githubRegex)
    return match ? match[0] : ""
  }

  // Helper function to extract portfolio
  const extractPortfolio = (): string => {
    const portfolioRegex = /(?:https?:\/\/)?(?:www\.)?([\w-]+\.(?:com|io|dev|me|net|org))(?:\/[\w-]*)?\b/gi
    const matches = cleanContent.match(portfolioRegex) || []
    // Filter out LinkedIn, GitHub, and common domains
    const portfolio = matches.find(
      (url) => 
        !url.toLowerCase().includes("linkedin") && 
        !url.toLowerCase().includes("github") &&
        !url.toLowerCase().includes("ufl.edu") &&
        !url.toLowerCase().includes("gmail") &&
        !url.toLowerCase().includes("yahoo")
    )
    return portfolio || ""
  }

  // Helper function to extract location
  const extractLocation = (): { city: string; state: string; country: string } => {
    // Look for common location patterns near the top of resume
    const topSection = cleanContent.split("\n").slice(0, 20).join("\n")
    
    // Pattern: "City, ST" or "City, State"
    const locationRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2})\b/
    const match = topSection.match(locationRegex)
    
    if (match) {
      return {
        city: match[1] || "",
        state: match[2] || "",
        country: "USA",
      }
    }
    return { city: "", state: "", country: "" }
  }

  // Helper function to extract GPA
  const extractGPA = (text: string): number => {
    const gpaRegex = /GPA[:\s]*([0-4](?:\.\d{1,2})?)\s*(?:\/\s*([0-4](?:\.\d{1,2})?))?/i
    const match = text.match(gpaRegex)
    if (match) {
      const gpa = parseFloat(match[1])
      const scale = match[2] ? parseFloat(match[2]) : 4.0
      // Normalize to 4.0 scale
      return scale !== 4.0 ? (gpa / scale) * 4.0 : gpa
    }
    return 0
  }

  // Helper function to extract date ranges
  const extractDateRange = (text: string): { start: string; end: string } => {
    // Patterns: "Jan 2020 - Dec 2022", "2020-2022", "Jan 2020 - Present", "Aug 2023 – May 2027"
    const dateRangeRegex = /([A-Za-z]+\s+\d{4}|\d{4})\s*[-–—]\s*([A-Za-z]+\s+\d{4}|\d{4}|Present|Current|Expected)/i
    const match = text.match(dateRangeRegex)
    if (match) {
      return { start: match[1], end: match[2] }
    }
    return { start: "", end: "" }
  }

  // Find section boundaries
  const findSection = (sectionNames: string[]): { start: number; end: number; content: string } => {
    const pattern = new RegExp(`\\n\\s*(${sectionNames.join("|")})\\s*\\n`, "i")
    const match = cleanContent.match(pattern)
    
    if (!match || match.index === undefined) {
      return { start: -1, end: -1, content: "" }
    }
    
    const start = match.index + match[0].length
    
    // Find the next section header (all caps or title case followed by newline)
    const nextSectionRegex = /\n\s*[A-Z][A-Z\s]{3,}\s*\n/g
    nextSectionRegex.lastIndex = start
    const nextMatch = nextSectionRegex.exec(cleanContent)
    
    const end = nextMatch ? nextMatch.index : cleanContent.length
    const content = cleanContent.slice(start, end).trim()
    
    return { start, end, content }
  }

  // Extract Education
  const extractEducation = () => {
    const education: Array<{
      school: string
      degree: string
      field: string
      start_date: string
      end_date: string
      gpa: number
      achievements: string[]
    }> = []

    const eduSection = findSection(["Education", "EDUCATION", "Academic Background"])
    
    if (eduSection.content) {
      // Look for university/college name - should be standalone, not part of other text
      const schoolRegex = /^([A-Z][A-Za-z\s&]+(?:University|College|Institute|School))/m
      const schoolMatch = eduSection.content.match(schoolRegex)
      
      // Look for degree
      const degreeRegex = /(Bachelor|Master|B\.S\.|M\.S\.|B\.A\.|M\.A\.|PhD)(?:\s+of\s+Science)?(?:\s+in)?\s+([A-Za-z\s]+?)(?:\n|,|;|\||–|—|-)/i
      const degreeMatch = eduSection.content.match(degreeRegex)
      
      const dates = extractDateRange(eduSection.content)
      const gpa = extractGPA(eduSection.content)
      
      // Only add if we found at least a school
      if (schoolMatch) {
        education.push({
          school: schoolMatch[1].trim(),
          degree: degreeMatch ? degreeMatch[1].trim() : "",
          field: degreeMatch ? degreeMatch[2].trim() : "",
          start_date: dates.start,
          end_date: dates.end,
          gpa: gpa,
          achievements: [],
        })
      }
    }

    if (education.length === 0) missing.push("Education section")
    return education
  }

  // Extract Skills
  const extractSkills = () => {
    const skills = {
      programming_languages: [] as string[],
      frameworks: [] as string[],
      libraries: [] as string[],
      databases: [] as string[],
      devops_tools: [] as string[],
      cloud_platforms: [] as string[],
      other: [] as string[],
    }

    const skillsSection = findSection(["Skills", "SKILLS", "Technical Skills", "TECHNICAL SKILLS", "Technologies"])

    if (skillsSection.content) {
      const skillsText = skillsSection.content

      // Common programming languages
      const languages = [
        "JavaScript", "TypeScript", "Python", "Java", "C\\+\\+", "C#", "C ", "Ruby", "Go", "Rust", 
        "Swift", "Kotlin", "PHP", "Scala", "R", "MATLAB", "Perl", "Haskell", "Elixir", "Dart"
      ]
      const frameworks = [
        "React", "Angular", "Vue", "Next\\.js", "Node\\.js", "Express", "Django", "Flask", 
        "Spring", "Rails", "Laravel", ".NET", "Svelte", "Nest\\.js", "FastAPI", "Gin"
      ]
      const databases = [
        "MongoDB", "PostgreSQL", "MySQL", "Redis", "DynamoDB", "Oracle", "SQL Server", 
        "Cassandra", "SQLite", "MariaDB", "Firebase", "Supabase"
      ]
      const devops = [
        "Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions", "Terraform", 
        "Ansible", "CircleCI", "Travis CI", "Prometheus", "Grafana"
      ]
      const cloud = [
        "AWS", "Azure", "GCP", "Google Cloud", "Heroku", "Vercel", "Netlify", "DigitalOcean", "Cloudflare"
      ]

      const extractSkillCategory = (keywords: string[], category: keyof typeof skills) => {
        keywords.forEach((keyword) => {
          const regex = new RegExp(`\\b${keyword}\\b`, "gi")
          if (regex.test(skillsText)) {
            const cleanKeyword = keyword.replace(/\\/g, "")
            if (!skills[category].includes(cleanKeyword)) {
              skills[category].push(cleanKeyword)
            }
          }
        })
      }

      extractSkillCategory(languages, "programming_languages")
      extractSkillCategory(frameworks, "frameworks")
      extractSkillCategory(databases, "databases")
      extractSkillCategory(devops, "devops_tools")
      extractSkillCategory(cloud, "cloud_platforms")
    }

    if (Object.values(skills).every((arr) => arr.length === 0)) {
      missing.push("Skills section")
    }
    return skills
  }

  // Extract Experience
  const extractExperience = () => {
    const experience: Array<{
      company: string
      position: string
      start_date: string
      end_date: string
      location: string
      responsibilities: string[]
      achievements: string[]
      technologies: string[]
    }> = []

    const expSection = findSection(["Experience", "EXPERIENCE", "Work Experience", "WORK EXPERIENCE", "Professional Experience"])

    if (expSection.content) {
      // Split by date patterns that indicate new job entries
      // Look for pattern: Company + location on one line, Position + dates on next
      const jobEntryRegex = /([A-Z][A-Za-z\s&]+(?:,\s*[A-Z]{2})?)\n([A-Za-z\s]+(?:Engineer|Developer|Analyst|Intern|Manager|Designer|Scientist)[^\n]*)\n/g
      const matches = [...expSection.content.matchAll(jobEntryRegex)]
      
      if (matches.length > 0) {
        for (const match of matches) {
          const companyLine = match[1].trim()
          const positionLine = match[2].trim()
          
          // Extract company and location from first line
          const locationMatch = companyLine.match(/^(.+?),\s*([A-Z]{2})$/)
          const company = locationMatch ? locationMatch[1].trim() : companyLine
          const location = locationMatch ? `${locationMatch[2]}` : ""
          
          // Extract position and dates from second line
          const dateMatch = positionLine.match(/^(.+?)\s*([A-Za-z]+\s+\d{4}\s*[-–—]\s*[A-Za-z]+\s+\d{4})/)
          const position = dateMatch ? dateMatch[1].trim() : positionLine.split(/\d{4}/)[0].trim()
          const dates = extractDateRange(positionLine)
          
          // Find the section of text for this job (until next job or end)
          const startIndex = expSection.content.indexOf(match[0])
          const nextMatch = matches[matches.indexOf(match) + 1]
          const endIndex = nextMatch ? expSection.content.indexOf(nextMatch[0]) : expSection.content.length
          const jobText = expSection.content.slice(startIndex, endIndex)
          
          // Extract bullet points
          const bulletRegex = /^[•\-\*]\s*(.+)/gm
          const bullets = [...jobText.matchAll(bulletRegex)].map((m) => m[1].trim())

          experience.push({
            company: company,
            position: position,
            start_date: dates.start,
            end_date: dates.end,
            location: location,
            responsibilities: bullets,
            achievements: [],
            technologies: [],
          })
        }
      }
    }

    if (experience.length === 0) missing.push("Work experience")
    return experience
  }

  // Extract Projects
  const extractProjects = () => {
    const projects: Array<{
      name: string
      description: string
      technologies: string[]
      highlights: string[]
      link: string
      github: string
    }> = []

    const projectSection = findSection(["Projects", "PROJECTS", "Personal Projects", "Academic Projects", "Technical Projects"])

    if (projectSection.content) {
      // Projects usually start with a bold/capitalized title, optionally with dates
      // Look for pattern: Project Name | dates or Project Name on its own line
      const projectRegex = /^([A-Z][A-Za-z\s]+?)(?:\s*[|\-–—]\s*[A-Za-z]+\s+\d{4})?$/gm
      const projectMatches = [...projectSection.content.matchAll(projectRegex)]
      
      for (let i = 0; i < projectMatches.length; i++) {
        const match = projectMatches[i]
        const name = match[1].trim()
        
        // Find the content between this project and the next one
        const startIndex = match.index! + match[0].length
        const nextMatch = projectMatches[i + 1]
        const endIndex = nextMatch ? nextMatch.index! : projectSection.content.length
        const projectText = projectSection.content.slice(startIndex, endIndex).trim()
        
        // Extract bullet points as highlights
        const bulletRegex = /^[•\-\*]\s*(.+)/gm
        const highlights = [...projectText.matchAll(bulletRegex)].map((m) => m[1].trim())
        
        // First non-bullet line might be a description
        const lines = projectText.split("\n").map(l => l.trim()).filter(l => l)
        const description = lines.find(l => !l.match(/^[•\-\*]/) && !l.includes("http")) || ""
        
        // Extract GitHub link if present
        const githubMatch = projectText.match(/github\.com\/[\w-\/]+/i)
        
        // Extract link if present
        const linkMatch = projectText.match(/https?:\/\/[^\s]+/i)
        
        if (name && name.length > 2) {
          projects.push({
            name: name,
            description: description || (highlights[0] || ""),
            technologies: [],
            highlights: highlights,
            link: linkMatch ? linkMatch[0] : "",
            github: githubMatch ? githubMatch[0] : "",
          })
        }
      }
    }

    return projects
  }

  // Extract Achievements/Awards
  const extractAchievements = () => {
    const achievements: Array<{
      title: string
      issuer: string
      date: string
      description: string
    }> = []

    const achieveSection = findSection(["Achievements", "ACHIEVEMENTS", "Awards", "AWARDS", "Honors", "HONORS"])

    if (achieveSection.content) {
      const bulletRegex = /^[•\-\*]\s*(.+)/gm
      const bullets = [...achieveSection.content.matchAll(bulletRegex)].map((m) => m[1].trim())

      bullets.forEach((bullet) => {
        achievements.push({
          title: bullet,
          issuer: "",
          date: "",
          description: bullet,
        })
      })
    }

    return achievements
  }

  try {
    const resume: Resume = {
      basics: {
        name: extractName(),
        email: extractEmail(),
        phone: extractPhone(),
        location: extractLocation(),
        linkedin: extractLinkedIn(),
        github: extractGitHub(),
        portfolio: extractPortfolio(),
      },
      education: extractEducation(),
      skills: extractSkills(),
      projects: extractProjects(),
      experience: extractExperience(),
      achievements: extractAchievements(),
      certifications: [],
      publications: [],
      extracurriculars: [],
    }

    return { details: resume, missing }
  } catch (error) {
    console.error("Error in regex parsing:", error)
    return { details: null, missing: ["Failed to parse resume with regex"] }
  }
}
