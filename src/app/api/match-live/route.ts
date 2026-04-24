import { OpenAI } from "openai"
import { z } from "zod"
import { zodTextFormat } from "openai/helpers/zod.mjs"
import { type NextResponse as NR, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getJsonFromS3, putJsonToS3 } from "@/lib/aws/s3"
import { generateEmbedding } from "@/lib/embeddings"
import { searchSimilarDocuments } from "@/lib/vectorSearch"
import { checkAndIncrementLimit } from "@/lib/usageLimits"
import type { Resume } from "@/app/api/parse/resumeSchema"

const MODEL = "gpt-4.1-mini"
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface AdzunaJob {
  id: string
  title: string
  company: { display_name: string }
  location: { display_name: string }
  description: string
  salary_min?: number
  salary_max?: number
  redirect_url: string
  contract_type?: string
  created: string
}

const CompareResultSchema = z.object({
  overallMatch: z.number().describe("0-100 overall alignment score"),
  breakdown: z.object({
    skillsMatch: z.number().describe("0-100 skills alignment"),
    experienceMatch: z.number().describe("0-100 experience alignment"),
    educationMatch: z.number().describe("0-100 education alignment"),
  }),
  strengths: z.array(z.string()).describe("3-5 specific strengths the candidate brings to this role"),
  gaps: z.array(z.string()).describe("2-4 specific gaps between resume and job requirements"),
  recommendations: z.array(z.string()).describe("3-5 actionable steps to improve alignment"),
})

export interface LiveJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  salaryMin?: number
  salaryMax?: number
  applyUrl: string
  contractType?: string
  created: string
  matchScore: number
  analysis: {
    breakdown: { skillsMatch: number; experienceMatch: number; educationMatch: number }
    strengths: string[]
    gaps: string[]
    recommendations: string[]
  }
}

interface CachedLiveJobs {
  jobs: LiveJob[]
  cachedAt: number
}

const LOCATION_TO_COUNTRY: Record<string, string> = {
  "United States": "us",
  "Canada": "ca",
  "United Kingdom": "gb",
  "Europe": "de",
  "Asia Pacific": "au",
  "Latin America": "br",
  "Remote (Anywhere)": "us",
}

function buildResumeSummary(resume: Resume): string {
  const skills = resume.skills
    ? Object.entries(resume.skills)
        .map(([cat, items]) => `${cat}: ${Array.isArray(items) ? items.join(", ") : ""}`)
        .join("; ")
    : ""
  const projects = (resume.projects || [])
    .map(p => `${p.name} [${(p.technologies || []).join(", ")}]: ${p.description || ""}`)
    .join(". ")
  const experience = (resume.experience || [])
    .map(e => {
      const bullets = [...(e.responsibilities || []), ...(e.achievements || [])].slice(0, 2).join("; ")
      return `${e.position} at ${e.company}: ${bullets}`
    })
    .join(". ")
  const education = (resume.education || [])
    .map(e => `${e.degree} in ${e.field} at ${e.school}${e.gpa ? ` GPA ${e.gpa}` : ""}`)
    .join("; ")
  return `SKILLS: ${skills}\n\nPROJECTS: ${projects}\n\nEXPERIENCE: ${experience}\n\nEDUCATION: ${education}`.trim()
}

async function analyzeJobFit(
  client: OpenAI,
  resumeSummary: string,
  job: AdzunaJob,
  degreeLevel: string[] = []
): Promise<z.infer<typeof CompareResultSchema>> {
  const degreeLine = degreeLevel.length && !degreeLevel.includes("No Preference")
    ? `\nCANDIDATE DEGREE LEVEL: ${degreeLevel.join(", ")} — factor this into the education alignment score.`
    : ""
  const result = await client.responses.parse({
    model: MODEL,
    input: [
      {
        role: "system",
        content: `You are a strict, honest technical recruiter. Score how well this candidate matches the job.${degreeLine}

SCORING CALIBRATION — do not inflate scores:
- 80-100: Near-perfect fit. Candidate has nearly all required skills AND relevant experience.
- 65-79: Good fit. Most hard requirements met, only minor gaps.
- 50-64: Moderate fit. Core skills present but notable gaps in key requirements.
- 35-49: Partial fit. Some relevant skills but missing several important requirements.
- Below 35: Poor fit. Most critical requirements are missing.

Most candidates score 40-65. A score above 75 is rare and must be fully justified.
Always identify at least 2 concrete gaps even for strong candidates. Be specific — name exact missing tools, frameworks, or experience types.`,
      },
      {
        role: "user",
        content: `Evaluate this candidate for the job below.

=== CANDIDATE RESUME ===
${resumeSummary}

=== JOB POSTING ===
Title: ${job.title}
Company: ${job.company.display_name}
${job.description.slice(0, 900)}`,
      },
    ],
    text: { format: zodTextFormat(CompareResultSchema, "job_match") },
    temperature: 0.2,
  })
  return result.output_parsed!
}

async function adzunaSearch(
  appId: string,
  appKey: string,
  what: string,
  country: string,
  extra: Record<string, string> = {}
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({ app_id: appId, app_key: appKey, results_per_page: "50", what, ...extra })
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results as AdzunaJob[]) || []
  } catch {
    return []
  }
}

// ─── The Muse (free, no auth) ────────────────────────────────────────────────

interface MuseJob {
  id: number
  name: string
  company: { name: string }
  locations: Array<{ name: string }>
  contents: string
  refs: { landing_page: string }
}

const ROLE_TO_MUSE_CATEGORY: Record<string, string> = {
  "software": "Software Engineering",
  "frontend": "Software Engineering",
  "backend": "Software Engineering",
  "full-stack": "Software Engineering",
  "fullstack": "Software Engineering",
  "mobile": "Software Engineering",
  "ios": "Software Engineering",
  "android": "Software Engineering",
  "devops": "Software Engineering",
  "data science": "Data Science",
  "data analyst": "Data & Analytics",
  "machine learning": "Data Science",
  "product manager": "Product",
  "ux": "Design & UX",
  "ui": "Design & UX",
  "cybersecurity": "IT",
  "cloud": "Software Engineering",
}

function roleToMuseCategory(role: string): string {
  const lower = (role || "").toLowerCase()
  for (const [key, cat] of Object.entries(ROLE_TO_MUSE_CATEGORY)) {
    if (lower.includes(key)) return cat
  }
  return "Software Engineering"
}

async function fetchMuseJobs(roleTypes: string[], isRemote: boolean): Promise<AdzunaJob[]> {
  const categories = [...new Set(roleTypes.slice(0, 3).map(roleToMuseCategory))]
  const searches = categories.map(async (cat): Promise<AdzunaJob[]> => {
    try {
      const params = new URLSearchParams({ category: cat, page: "0", descending: "true" })
      if (isRemote) params.set("location", "Flexible / Remote")
      const res = await fetch(`https://www.themuse.com/api/public/jobs?${params}`, { cache: "no-store" })
      if (!res.ok) return []
      const data = await res.json()
      return ((data.results || []) as MuseJob[]).map(j => ({
        id: `muse_${j.id}`,
        title: j.name,
        company: { display_name: j.company.name },
        location: { display_name: j.locations[0]?.name || "Remote" },
        description: j.contents.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        redirect_url: j.refs.landing_page,
        created: new Date().toISOString(),
      }))
    } catch {
      return []
    }
  })
  const results = await Promise.all(searches)
  return results.flat()
}

function dedupeJobs(jobs: AdzunaJob[]): AdzunaJob[] {
  const seenIds = new Set<string>()
  const seenTitleCompany = new Set<string>()
  return jobs.filter(j => {
    if (seenIds.has(j.id)) return false
    seenIds.add(j.id)
    const key = `${(j.title || "").toLowerCase().replace(/\s+/g, " ").trim()}|${(j.company?.display_name || "").toLowerCase().trim()}`
    if (seenTitleCompany.has(key)) return false
    seenTitleCompany.add(key)
    return true
  })
}

async function fetchAdzunaJobs(prefs: Record<string, string[]>): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) {
    throw new Error("Adzuna API credentials not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to your .env.")
  }

  const roleTypes: string[] = prefs.roleTypes || []
  const location: string[] = prefs.location || []
  const jobType: string[] = prefs.jobType || []
  const workEnvironment: string[] = prefs.workEnvironment || []
  const degreeLevel: string[] = prefs.degreeLevel || []

  const wantsInternship = jobType.includes("Internship") && !jobType.includes("Full-Time")
  const wantsFullTime = jobType.includes("Full-Time") && !jobType.includes("Internship")
  const isRemote = workEnvironment.some(e => (e || "").toLowerCase().includes("remote")) || location.includes("Remote (Anywhere)")

  // Degree-level search tag appended to queries for signal (soft filter via LLM scoring)
  const degreeTags: string[] = []
  if (degreeLevel.includes("Undergraduate / Associate") && !degreeLevel.includes("PhD / Doctorate")) degreeTags.push("entry level")
  if (degreeLevel.includes("Master's Degree")) degreeTags.push("masters")
  if (degreeLevel.includes("PhD / Doctorate")) degreeTags.push("phd research scientist")

  const nonRemoteLocation = location.find(l => !l.includes("Remote")) || location[0] || "United States"
  const primaryCountry = LOCATION_TO_COUNTRY[nonRemoteLocation] || "us"
  const remoteTag = isRemote ? " remote" : ""

  // Derive the exact set of countries from the user's location preferences — no cross-contamination
  const selectedCountries = [...new Set(
    location.map(l => LOCATION_TO_COUNTRY[l]).filter((c): c is string => Boolean(c))
  )]
  const countries = selectedCountries.length > 0 ? selectedCountries : ["us"]

  const role0 = roleTypes[0] || "software"
  const role1 = roleTypes[1] || ""

  if (wantsInternship) {
    // Fan out multiple query variations across ONLY the user's selected countries
    const searches: Promise<AdzunaJob[]>[] = []
    for (const country of countries) {
      searches.push(adzunaSearch(appId, appKey, `intern ${role0}${remoteTag}`, country))
      searches.push(adzunaSearch(appId, appKey, `internship ${role0}${remoteTag}`, country))
      if (role1) searches.push(adzunaSearch(appId, appKey, `intern ${role1}${remoteTag}`, country))
    }
    // Extra query variations only on primary country for depth
    searches.push(adzunaSearch(appId, appKey, `summer intern ${role0}`, countries[0]))
    searches.push(adzunaSearch(appId, appKey, `graduate intern ${role0}`, countries[0]))
    if (role1) searches.push(adzunaSearch(appId, appKey, `summer intern ${role1}`, countries[0]))
    const results = await Promise.all(searches)
    return dedupeJobs(results.flat())
  }

  // Standard full-time / either — fan out one query per role type × country (OR behavior)
  const extra: Record<string, string> = {}
  if (wantsFullTime) extra.full_time = "1"

  const degreeTag = degreeTags[0] ? ` ${degreeTags[0]}` : ""
  const searches: Promise<AdzunaJob[]>[] = []
  for (const country of countries) {
    for (const role of roleTypes.slice(0, 3)) {
      const q = isRemote ? `${role} remote${degreeTag}` : `${role}${degreeTag}`
      searches.push(adzunaSearch(appId, appKey, q, country, extra))
      // Also search without the degree tag for broader coverage
      if (degreeTag) searches.push(adzunaSearch(appId, appKey, isRemote ? `${role} remote` : role, country, extra))
    }
  }
  const results = await Promise.all(searches)
  return dedupeJobs(results.flat())
}

export async function GET(): Promise<NR> {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const cached = await getJsonFromS3<CachedLiveJobs>(`uploads/${userId}/live-job-matches.json`)
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, data: cached })
    }
    return NextResponse.json({ success: false, data: null })
  } catch {
    return NextResponse.json({ success: false, data: null })
  }
}

export async function POST(): Promise<NR> {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { allowed } = await checkAndIncrementLimit(userId, "analyzeMatch")
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Daily analyze match limit reached (10/day). Try again tomorrow." },
        { status: 429 }
      )
    }

    const resume = await getJsonFromS3<Resume>(`uploads/${userId}/resume-data.json`)
    if (!resume) {
      return NextResponse.json({ success: false, error: "No resume found. Upload a resume first." }, { status: 400 })
    }

    const prefs = await getJsonFromS3<Record<string, string[]>>(`uploads/${userId}/preferences.json`)
    if (!prefs?.roleTypes?.length) {
      return NextResponse.json(
        { success: false, error: "No preferences found. Complete the questionnaire first." },
        { status: 400 }
      )
    }

    const isRemote = (prefs.workEnvironment || []).some(e => (e || "").toLowerCase().includes("remote")) ||
      (prefs.location || []).includes("Remote (Anywhere)")

    const [adzunaJobs, museJobs] = await Promise.all([
      fetchAdzunaJobs(prefs),
      fetchMuseJobs(prefs.roleTypes || [], isRemote),
    ])
    const allJobs = dedupeJobs([...adzunaJobs, ...museJobs])
    if (allJobs.length === 0) {
      return NextResponse.json(
        { success: false, error: "No listings found for your preferences. Try adjusting your questionnaire." },
        { status: 404 }
      )
    }

    const resumeSummary = buildResumeSummary(resume)
    const client = new OpenAI()

    // Stage 1: batch embed all jobs + resume, cosine-rank to get top 10
    const resumeVector = await generateEmbedding(resumeSummary)
    const jobTexts = allJobs.map(j =>
      `${j.title} at ${j.company.display_name}. ${j.description.slice(0, 600)}`.replace(/\n/g, " ")
    )
    const embeddingRes = await client.embeddings.create({ model: "text-embedding-3-small", input: jobTexts })
    const jobDocs = allJobs.map((job, i) => ({ id: job.id, vector: embeddingRes.data[i].embedding, job }))
    const topMatches = searchSimilarDocuments(resumeVector, jobDocs, 10)

    // Stage 2: run LLM analysis on top 10 in parallel — strengths/gaps inform the final score
    const analysisResults = await Promise.allSettled(
      topMatches.map(m => analyzeJobFit(client, resumeSummary, m.job, prefs.degreeLevel || []))
    )

    const liveJobs: LiveJob[] = topMatches.map((match, i) => {
      const ar = analysisResults[i]
      const analysis =
        ar.status === "fulfilled" && ar.value
          ? ar.value
          : {
              overallMatch: Math.round(match.similarity * 100),
              breakdown: { skillsMatch: 0, experienceMatch: 0, educationMatch: 0 },
              strengths: [],
              gaps: [],
              recommendations: [],
            }
      return {
        id: match.job.id,
        title: match.job.title,
        company: match.job.company.display_name,
        location: match.job.location.display_name,
        description: match.job.description.slice(0, 500),
        salaryMin: match.job.salary_min,
        salaryMax: match.job.salary_max,
        applyUrl: match.job.redirect_url,
        contractType: match.job.contract_type,
        created: match.job.created,
        matchScore: analysis.overallMatch,
        analysis: {
          breakdown: analysis.breakdown,
          strengths: analysis.strengths,
          gaps: analysis.gaps,
          recommendations: analysis.recommendations,
        },
      }
    })

    // Sort by matchScore (LLM score) descending
    liveJobs.sort((a, b) => b.matchScore - a.matchScore)

    const result: CachedLiveJobs = { jobs: liveJobs, cachedAt: Date.now() }
    await putJsonToS3(`uploads/${userId}/live-job-matches.json`, result)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("match-live error:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch live jobs"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
