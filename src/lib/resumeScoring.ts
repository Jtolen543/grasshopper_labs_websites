import type { Resume } from "@/app/api/parse/resumeSchema"
import {
  analyzeProjectQuality,
  analyzeExperienceQuality,
  analyzeSkillsQuality,
  analyzeLinksQuality,
  analyzeGPAQuality,
  analyzeCourseworkQuality,
  generateAllInsights,
  type ActionableInsight
} from "./qualityAnalysis"

/**
 * Calculate the overall resume score based on parsed resume data.
 * 
 * NEW Scoring System (Quality + Quantity):
 * 
 * Weights:
 * - Projects: 25% (combines quality + quantity)
 * - Experience: 25% (internships + research + TA + jobs)
 * - Skills: 15%
 * - Links + Contact: 10%
 * - GPA: 10% (threshold-based)
 * - Coursework: 15%
 */

export interface ScoreBreakdown {
  category: string
  qualityScore: number
  quantityScore: number
  combinedScore: number
  weight: number
  contribution: number
}

export interface ResumeScoreResult {
  totalScore: number
  breakdown: ScoreBreakdown[]
  insights: ActionableInsight[]
  analysis: {
    projects: ReturnType<typeof analyzeProjectQuality>
    experience: ReturnType<typeof analyzeExperienceQuality>
    skills: ReturnType<typeof analyzeSkillsQuality>
    links: ReturnType<typeof analyzeLinksQuality>
    gpa: ReturnType<typeof analyzeGPAQuality>
    coursework: ReturnType<typeof analyzeCourseworkQuality>
  }
}

export const WEIGHTS = {
  projects: 25,
  experience: 25,
  skills: 15,
  links: 10,
  gpa: 10,
  coursework: 15,
}

/**
 * Calculate combined score from quality and quantity
 * Quality is weighted slightly higher to encourage impact-focused content
 */
function combineScores(qualityScore: number, quantityScore: number): number {
  return Math.round(qualityScore * 0.6 + quantityScore * 0.4)
}

/**
 * Calculate quantity score based on ideal count with diminishing returns
 */
function quantityScore(count: number, ideal: number): number {
  if (count === 0) return 0
  if (count >= ideal) return 100
  return Math.round((count / ideal) * 100)
}

interface XYZFeedbackItem {
  score: number
  xyz_analysis: string
  improvements: string[]
}

interface XYZFeedbackData {
  projects: Record<number, XYZFeedbackItem>
  experience: Record<number, XYZFeedbackItem>
}

/**
 * Calculate comprehensive resume score with quality + quantity breakdown
 */
export function calculateResumeScoreDetailed(
  resume: Resume,
  xyzFeedback?: XYZFeedbackData | null
): ResumeScoreResult {
  // Analyze each category
  const projectAnalysis = analyzeProjectQuality(resume.projects)
  const experienceAnalysis = analyzeExperienceQuality(resume.experience)
  const skillsAnalysis = analyzeSkillsQuality(resume.skills)
  const linksAnalysis = analyzeLinksQuality(resume.basics)
  const gpaEntry = resume.education?.find(e => e.gpa != null && e.gpa !== "" && e.gpa !== 0)
  const rawGpa = gpaEntry?.gpa ?? null
  const numGpa = rawGpa == null ? 0 : (typeof rawGpa === 'string' ? parseFloat(rawGpa) || 0 : Number(rawGpa) || 0);
  const gpaAnalysis = analyzeGPAQuality(numGpa)
  const courseworkAnalysis = analyzeCourseworkQuality(resume.education)

  // Calculate AI-enhanced quality scores if XYZ feedback is available
  let projectQuality = projectAnalysis.qualityScore
  let experienceQuality = experienceAnalysis.qualityScore

  if (xyzFeedback) {
    // Average AI scores for projects
    const projectScores = Object.values(xyzFeedback.projects || {})
    if (projectScores.length > 0) {
      const avgProjectAI = projectScores.reduce((sum, p) => sum + p.score, 0) / projectScores.length
      // Blend: 50% heuristic + 50% AI
      projectQuality = Math.round(projectAnalysis.qualityScore * 0.5 + avgProjectAI * 0.5)
    }

    // Average AI scores for experience
    const expScores = Object.values(xyzFeedback.experience || {})
    if (expScores.length > 0) {
      const avgExpAI = expScores.reduce((sum, e) => sum + e.score, 0) / expScores.length
      // Blend: 50% heuristic + 50% AI
      experienceQuality = Math.round(experienceAnalysis.qualityScore * 0.5 + avgExpAI * 0.5)
    }
  }

  // Quantity scoring: ideal 3 projects, 2 experiences
  const projectQuantity = quantityScore(resume.projects?.length || 0, 3)
  const experienceQuantity = quantityScore(resume.experience?.length || 0, 2)

  // Calculate combined scores
  const projectsCombined = combineScores(projectQuality, projectQuantity)
  const experienceCombined = combineScores(experienceQuality, experienceQuantity)
  const skillsCombined = combineScores(skillsAnalysis.qualityScore, skillsAnalysis.quantityScore)
  const linksCombined = linksAnalysis.qualityScore // Links only have quality (presence check)
  const gpaCombined = gpaAnalysis.score // GPA is threshold-based
  const courseworkCombined = combineScores(courseworkAnalysis.qualityScore, courseworkAnalysis.quantityScore)

  // Determine if UF
  const schoolName = resume.education?.[0]?.school?.toLowerCase() || ""
  const isUF = schoolName.includes("university of florida") || schoolName === "uf"

  // Dynamically adjust weights based on university
  const currentWeights = isUF ? WEIGHTS : {
    projects: 30,
    experience: 30,
    skills: 20,
    links: 10,
    gpa: 10,
    coursework: 0
  }

  // Build breakdown
  const breakdown: ScoreBreakdown[] = [
    {
      category: 'Projects',
      qualityScore: projectQuality,
      quantityScore: projectQuantity,
      combinedScore: projectsCombined,
      weight: currentWeights.projects,
      contribution: Math.round(projectsCombined * currentWeights.projects / 100)
    },
    {
      category: 'Experience',
      qualityScore: experienceQuality,
      quantityScore: experienceQuantity,
      combinedScore: experienceCombined,
      weight: currentWeights.experience,
      contribution: Math.round(experienceCombined * currentWeights.experience / 100)
    },
    {
      category: 'Skills',
      qualityScore: skillsAnalysis.qualityScore,
      quantityScore: skillsAnalysis.quantityScore,
      combinedScore: skillsCombined,
      weight: currentWeights.skills,
      contribution: Math.round(skillsCombined * currentWeights.skills / 100)
    },
    {
      category: 'Links + Contact',
      qualityScore: linksCombined,
      quantityScore: linksCombined, // Same as quality for links
      combinedScore: linksCombined,
      weight: currentWeights.links,
      contribution: Math.round(linksCombined * currentWeights.links / 100)
    },
    {
      category: 'GPA',
      qualityScore: gpaCombined,
      quantityScore: gpaCombined, // Same as quality for GPA
      combinedScore: gpaCombined,
      weight: currentWeights.gpa,
      contribution: Math.round(gpaCombined * currentWeights.gpa / 100)
    }
  ]

  // Only add coursework if it's UF or if currentWeights has coursework > 0
  if (currentWeights.coursework > 0) {
    breakdown.push({
      category: 'Coursework',
      qualityScore: courseworkAnalysis.qualityScore,
      quantityScore: courseworkAnalysis.quantityScore,
      combinedScore: courseworkCombined,
      weight: currentWeights.coursework,
      contribution: Math.round(courseworkCombined * currentWeights.coursework / 100)
    })
  }

  // Calculate total score
  const totalScore = breakdown.reduce((sum, item) => sum + item.contribution, 0)

  // Generate insights
  const insights = generateAllInsights(resume)

  return {
    totalScore,
    breakdown,
    insights,
    analysis: {
      projects: projectAnalysis,
      experience: experienceAnalysis,
      skills: skillsAnalysis,
      links: linksAnalysis,
      gpa: gpaAnalysis,
      coursework: courseworkAnalysis
    }
  }
}

/**
 * Calculate the overall resume score (simple version for backward compatibility)
 */
export function calculateResumeScore(resume: Resume): number {
  return calculateResumeScoreDetailed(resume).totalScore
}

/**
 * Get detailed score breakdown for display purposes
 */
export function getScoreBreakdown(resume: Resume) {
  const linksAnalysis = analyzeLinksQuality(resume.basics)

  return {
    hasGithub: linksAnalysis.hasGithub,
    hasLinkedIn: linksAnalysis.hasLinkedIn,
    hasPortfolio: linksAnalysis.hasPortfolio,
    hasProjects: Boolean(resume.projects && resume.projects.length > 0),
    hasExperience: Boolean(resume.experience && resume.experience.length > 0),
    hasCertifications: Boolean(resume.certifications && resume.certifications.length > 0),
    hasExtracurriculars: Boolean(resume.extracurriculars && resume.extracurriculars.length > 0),
  }
}

/**
 * Get score status label and styling
 */
export function getScoreStatus(score: number): {
  label: string
  color: string
  bgColor: string
} {
  if (score >= 80) return { label: "Excellent", color: "text-green-600", bgColor: "bg-green-600" }
  if (score >= 65) return { label: "Very Good", color: "text-green-500", bgColor: "bg-green-500" }
  if (score >= 50) return { label: "Good", color: "text-yellow-600", bgColor: "bg-yellow-500" }
  if (score >= 35) return { label: "Fair", color: "text-orange-600", bgColor: "bg-orange-500" }
  return { label: "Needs Work", color: "text-red-600", bgColor: "bg-red-500" }
}

/**
 * Generate improvement recommendation based on score
 */
export function getImprovementMessage(score: number, breakdown: ScoreBreakdown[]): string {
  // Find the lowest scoring categories
  const sorted = [...breakdown].sort((a, b) => a.combinedScore - b.combinedScore)
  const weakest = sorted.slice(0, 2).map(b => b.category.toLowerCase())

  if (score < 50) {
    return `Focus on improving your ${weakest[0]} and ${weakest[1]}. Adding quantifiable achievements will significantly boost your score.`
  }
  if (score < 70) {
    return `You're making great progress! Consider strengthening your ${weakest[0]} section with more specific metrics and achievements.`
  }
  return "Excellent resume! Keep it updated and consider tailoring it for specific roles you're applying to."
}
