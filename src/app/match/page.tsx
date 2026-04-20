"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  ChevronLeft, ChevronRight, Briefcase, FileText, Send, CheckCircle2,
  XCircle, TrendingUp, Loader2, RefreshCw, ExternalLink, MapPin, Building2,
  Download, Bookmark, BookmarkCheck, Settings2, Target, Trash2, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useResume } from "@/contexts/resume-context"
import Link from "next/link"
import { toast } from "sonner"
import type { LiveJob } from "@/app/api/match-live/route"
import type { SavedJob, JobBucket } from "@/app/api/job-board/route"
import { questionnaireOptions } from "@/app/questionnaire/data"
import type { QuestionnaireData } from "@/app/questionnaire/data"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMatchColor(score: number) {
  if (score >= 80) return "text-green-500"
  if (score >= 60) return "text-yellow-500"
  if (score >= 40) return "text-orange-500"
  return "text-red-500"
}
function getMatchBg(score: number) {
  if (score >= 80) return "bg-green-500"
  if (score >= 60) return "bg-yellow-500"
  if (score >= 40) return "bg-orange-500"
  return "bg-red-500"
}
function getMatchLabel(score: number) {
  if (score >= 80) return "Strong Fit"
  if (score >= 60) return "Good Fit"
  if (score >= 40) return "Partial Fit"
  return "Low Fit"
}
function formatSalary(min?: number, max?: number) {
  if (!min && !max) return null
  const f = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`)
  if (min && max) return `${f(min)} – ${f(max)}`
  return min ? `${f(min)}+` : `up to ${f(max!)}`
}
function formatContract(ct?: string, title?: string) {
  const ti = (title || "").toLowerCase()
  if (ti.includes("intern")) return "Internship"
  const c = (ct || "").toLowerCase()
  if (c === "permanent" || c === "full_time") return "Full-Time"
  if (c === "contract") return "Contract"
  if (c === "part_time") return "Part-Time"
  return null
}
function timeAgo(d?: string) {
  if (!d) return null
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "1d ago"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

const BUCKET_META: Record<JobBucket, { label: string; color: string; ring: string; next?: JobBucket }> = {
  interested:   { label: "Interested",   color: "text-blue-500",   ring: "ring-blue-500/30",   next: "applied" },
  applied:      { label: "Applied",      color: "text-yellow-500", ring: "ring-yellow-500/30", next: "interviewing" },
  interviewing: { label: "Interviewing", color: "text-violet-500", ring: "ring-violet-500/30", next: "offer" },
  offer:        { label: "Offer",        color: "text-green-500",  ring: "ring-green-500/30" },
  rejected:     { label: "Rejected",     color: "text-red-400",    ring: "ring-red-400/30" },
}
const BUCKETS = Object.keys(BUCKET_META) as JobBucket[]

// ─── Score Ring ──────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = size * 0.36
  const circ = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={size * 0.075} stroke="currentColor" fill="none" className="text-muted/30" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={size * 0.075} stroke="currentColor" fill="none"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round" className={cn("transition-all duration-700", getMatchColor(score))} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold tabular-nums leading-none", size >= 72 ? "text-xl" : "text-sm", getMatchColor(score))}>{score}</span>
        {size >= 72 && <span className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">/ 100</span>}
      </div>
    </div>
  )
}

// ─── Preferences Modal ───────────────────────────────────────────────────────

interface PrefsModalProps {
  open: boolean
  onClose: () => void
  currentPrefs: Partial<QuestionnaireData>
  onSaved: (newPrefs: QuestionnaireData) => void
}

function PrefsModal({ open, onClose, currentPrefs, onSaved }: PrefsModalProps) {
  const [jobType, setJobType] = useState<string[]>(currentPrefs.jobType || [])
  const [roleTypes, setRoleTypes] = useState<string[]>(currentPrefs.roleTypes || [])
  const [location, setLocation] = useState<string[]>(currentPrefs.location || [])
  const [degreeLevel, setDegreeLevel] = useState<string[]>(currentPrefs.degreeLevel || [])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setJobType(currentPrefs.jobType || [])
      setRoleTypes(currentPrefs.roleTypes || [])
      setLocation(currentPrefs.location || [])
      setDegreeLevel(currentPrefs.degreeLevel || [])
    }
  }, [open, currentPrefs])

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const handleSave = async () => {
    if (!roleTypes.length || !location.length) {
      toast.error("Please select at least one role type and location.")
      return
    }
    setSaving(true)
    try {
      const merged: QuestionnaireData = {
        techSectors: currentPrefs.techSectors || ["Web Development"],
        roleTypes,
        workEnvironment: currentPrefs.workEnvironment || ["Flexible / Your Choice"],
        companySize: currentPrefs.companySize || ["Medium (201-1000 employees)"],
        experienceLevel: currentPrefs.experienceLevel || ["Entry Level (0-2 years)"],
        workSchedule: currentPrefs.workSchedule || ["Flexible Hours"],
        technicalSkills: currentPrefs.technicalSkills || ["JavaScript / TypeScript"],
        location,
        salaryExpectations: currentPrefs.salaryExpectations || ["$75k - $100k"],
        jobType,
        degreeLevel,
      }
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Preferences saved — refreshing jobs…")
      onSaved(merged)
      onClose()
    } catch {
      toast.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Preferences</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Degree Level */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Degree Requirement</p>
            <div className="flex flex-wrap gap-2">
              {questionnaireOptions.degreeLevel.map(opt => (
                <button key={opt} onClick={() => toggle(degreeLevel, opt, setDegreeLevel)}
                  className={cn("px-3 py-1.5 rounded-full text-xs border transition-all",
                    degreeLevel.includes(opt)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {/* Job Type */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Job Type</p>
            <div className="flex flex-wrap gap-2">
              {questionnaireOptions.jobType.map(opt => (
                <button key={opt} onClick={() => toggle(jobType, opt, setJobType)}
                  className={cn("px-3 py-1.5 rounded-full text-xs border transition-all",
                    jobType.includes(opt)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {/* Role Types */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Role Types</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {questionnaireOptions.roleTypes.map(opt => (
                <div key={opt} className="flex items-center gap-2 cursor-pointer" onClick={() => toggle(roleTypes, opt, setRoleTypes)}>
                  <Checkbox checked={roleTypes.includes(opt)} onCheckedChange={() => toggle(roleTypes, opt, setRoleTypes)} />
                  <Label className="text-xs cursor-pointer leading-tight">{opt}</Label>
                </div>
              ))}
            </div>
          </div>
          {/* Location */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Location</p>
            <div className="flex flex-wrap gap-2">
              {questionnaireOptions.location.map(opt => (
                <button key={opt} onClick={() => toggle(location, opt, setLocation)}
                  className={cn("px-3 py-1.5 rounded-full text-xs border transition-all",
                    location.includes(opt)
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save & Refresh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Saved Job Card (sidebar) ─────────────────────────────────────────────────

function SavedJobCard({ job, onBucket, onRemove }: { job: SavedJob; onBucket: (b: JobBucket) => void; onRemove: () => void }) {
  const meta = BUCKET_META[job.bucket]
  const nextBucket = meta.next as JobBucket | undefined
  return (
    <div className={cn("rounded-lg border p-3 space-y-2 ring-1", meta.ring)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-snug truncate">{job.title}</p>
          <p className="text-[11px] text-muted-foreground truncate">{job.company}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={cn("text-xs font-bold tabular-nums", getMatchColor(job.matchScore))}>{job.matchScore}%</span>
          <button onClick={onRemove} className="p-0.5 text-muted-foreground/40 hover:text-destructive transition-colors">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", meta.color)}>{meta.label}</span>
        <div className="flex gap-1">
          {nextBucket && (
            <button onClick={() => onBucket(nextBucket)}
              className="text-[10px] px-2 py-0.5 rounded-full border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all">
              → {BUCKET_META[nextBucket].label}
            </button>
          )}
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
            className="text-[10px] px-2 py-0.5 rounded-full border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all">
            Apply ↗
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Analysis Section ─────────────────────────────────────────────────────────

type AnalysisTab = "strengths" | "gaps" | "steps"

const ANALYSIS_TABS: { key: AnalysisTab; icon: React.ComponentType<{ className?: string }>; label: string; color: string; activeBg: string; dot: string }[] = [
  { key: "strengths", icon: CheckCircle2, label: "Strengths",  color: "text-green-500",  activeBg: "bg-green-500/10 border-green-500/30",  dot: "text-green-500" },
  { key: "gaps",      icon: XCircle,      label: "Gaps",       color: "text-orange-500", activeBg: "bg-orange-500/10 border-orange-500/30", dot: "text-orange-400" },
  { key: "steps",     icon: TrendingUp,   label: "Next Steps", color: "text-primary",    activeBg: "bg-primary/10 border-primary/30",       dot: "text-primary" },
]

function AnalysisSection({ analysis }: { analysis: LiveJob["analysis"] }) {
  const [tab, setTab] = useState<AnalysisTab>("strengths")

  const content: Record<AnalysisTab, string[]> = {
    strengths: analysis.strengths,
    gaps:      analysis.gaps,
    steps:     analysis.recommendations,
  }
  const active = ANALYSIS_TABS.find(t => t.key === tab)!

  return (
    <div className="border-t border-border/30 pt-4 space-y-3">
      {/* Breakdown bars */}
      <div className="space-y-1.5">
        {[
          { label: "Skills",      val: analysis.breakdown.skillsMatch },
          { label: "Experience",  val: analysis.breakdown.experienceMatch },
          { label: "Education",   val: analysis.breakdown.educationMatch },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground w-16 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
                className={cn("h-full rounded-full", getMatchBg(val))} />
            </div>
            <span className={cn("text-[11px] font-bold w-6 text-right tabular-nums", getMatchColor(val))}>{val}</span>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-3 gap-1.5">
        {ANALYSIS_TABS.map(({ key, icon: Icon, label, color, activeBg }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              "rounded-lg border px-2 py-2 text-center transition-all text-[10px] font-semibold uppercase tracking-wide flex flex-col items-center gap-1",
              tab === key ? cn(activeBg, color) : "border-border text-muted-foreground hover:border-border/80"
            )}>
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className={cn("text-base font-bold -mt-0.5 leading-none", tab === key ? color : "text-foreground")}>
              {content[key].length}
            </span>
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className={cn("rounded-xl border p-3 min-h-[72px] transition-colors", active.activeBg)}>
        {content[tab].length > 0 ? (
          <ul className="space-y-1.5">
            {content[tab].map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className={cn("shrink-0 font-semibold mt-px", active.dot)}>
                  {tab === "steps" ? `${i + 1}.` : "▸"}
                </span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic text-center pt-3">None identified</p>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MatchPage() {
  const { resumeData, isLoading: isResumeLoading } = useResume()

  const [liveJobs, setLiveJobs] = useState<LiveJob[] | null>(null)
  const [isLiveLoading, setIsLiveLoading] = useState(false)
  const [currentJobIdx, setCurrentJobIdx] = useState(0)
  const [tailoringAction, setTailoringAction] = useState<{ idx: number; action: "overleaf" | "download" } | null>(null)
  const [tailoringAnalyzer, setTailoringAnalyzer] = useState<"overleaf" | "download" | null>(null)
  const overleafFormRef = useRef<HTMLFormElement>(null)
  const overleafInputRef = useRef<HTMLInputElement>(null)

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [expandedBucket, setExpandedBucket] = useState<JobBucket | null>("interested")

  const [prefs, setPrefs] = useState<Partial<QuestionnaireData>>({})
  const [showPrefs, setShowPrefs] = useState(false)

  const [jobDescription, setJobDescription] = useState("")
  const [compareResult, setCompareResult] = useState<{ overallMatch: number; breakdown: { skillsMatch: number; experienceMatch: number; educationMatch: number }; strengths: string[]; gaps: string[]; recommendations: string[] } | null>(null)
  const [isCompareLoading, setIsCompareLoading] = useState(false)

  const fetchLiveJobs = useCallback(async () => {
    setIsLiveLoading(true)
    try {
      const res = await fetch("/api/match-live", { method: "POST" })
      const result = await res.json()
      if (result.success && result.data?.jobs?.length) {
        setLiveJobs(result.data.jobs)
        setCurrentJobIdx(0)
        toast.success(`Found ${result.data.jobs.length} matches with full analysis`)
      } else {
        toast.error(result.error || "No jobs found")
      }
    } catch {
      toast.error("Failed to fetch jobs")
    } finally {
      setIsLiveLoading(false)
    }
  }, [])

  // Always fetch fresh on mount
  useEffect(() => {
    if (!resumeData) return
    fetchLiveJobs()
    fetch("/api/job-board").then(r => r.json()).then(r => { if (r.success) setSavedJobs(r.data) }).catch(() => {})
    fetch("/api/preferences").then(r => r.json()).then(r => { if (r.success && r.data) setPrefs(r.data) }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData])

  const saveJob = async (job: LiveJob) => {
    const payload: Omit<SavedJob, "savedAt"> = {
      id: job.id, title: job.title, company: job.company,
      location: job.location, applyUrl: job.applyUrl,
      matchScore: job.matchScore, contractType: job.contractType, bucket: "interested",
    }
    const res = await fetch("/api/job-board", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    const result = await res.json()
    if (result.success) { setSavedJobs(result.data); setExpandedBucket("interested"); toast.success("Job saved to board") }
  }

  const moveBucket = async (id: string, bucket: JobBucket) => {
    const res = await fetch("/api/job-board", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, bucket }) })
    const result = await res.json()
    if (result.success) setSavedJobs(result.data)
  }

  const removeJob = async (id: string) => {
    const res = await fetch(`/api/job-board?id=${id}`, { method: "DELETE" })
    const result = await res.json()
    if (result.success) setSavedJobs(result.data)
  }

  const generateTailoredLatex = async (
    jobTitle: string, jobDescription: string, jobCompany: string, action: "overleaf" | "download"
  ) => {
    const tailorRes = await fetch("/api/tailor-resume", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobTitle, jobDescription, jobCompany }),
    })
    const tailorResult = await tailorRes.json()
    if (!tailorResult.success) throw new Error(tailorResult.error)
    toast.info("Generating tailored LaTeX…")

    if (action === "overleaf") {
      const latexRes = await fetch("/api/export/latex?mode=overleaf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: tailorResult.data.tailoredResume }),
      })
      if (!latexRes.ok) throw new Error("LaTeX generation failed")
      const { latex } = await latexRes.json()
      const encoded = `data:application/x-tex;base64,${btoa(unescape(encodeURIComponent(latex)))}`
      if (overleafInputRef.current) overleafInputRef.current.value = encoded
      if (overleafFormRef.current) overleafFormRef.current.submit()
      toast.success("Opening in Overleaf…")
    } else {
      const latexRes = await fetch("/api/export/latex", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: tailorResult.data.tailoredResume }),
      })
      if (!latexRes.ok) throw new Error("LaTeX generation failed")
      const blob = await latexRes.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `resume-${jobCompany.toLowerCase().replace(/[^a-z0-9]/g, "-") || "tailored"}.tex`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
      toast.success("Tailored resume downloaded!")
    }
  }

  const tailorResume = async (job: LiveJob, action: "overleaf" | "download") => {
    setTailoringAction({ idx: currentJobIdx, action })
    try {
      await generateTailoredLatex(job.title, job.description, job.company, action)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate resume")
    } finally {
      setTailoringAction(null)
    }
  }

  const tailorFromAnalyzer = async (action: "overleaf" | "download") => {
    setTailoringAnalyzer(action)
    try {
      await generateTailoredLatex("", jobDescription, "", action)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate resume")
    } finally {
      setTailoringAnalyzer(null)
    }
  }

  const analyzeCustomJob = async () => {
    if (jobDescription.trim().length < 20) { toast.error("Please paste a longer job description."); return }
    setIsCompareLoading(true); setCompareResult(null)
    try {
      const res = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "compare", jobDescription }) })
      const result = await res.json()
      if (result.success && result.data) setCompareResult(result.data)
      else toast.error(result.error || "Analysis failed")
    } catch { toast.error("Something went wrong.") } finally { setIsCompareLoading(false) }
  }

  const currentJob = liveJobs?.[currentJobIdx]
  const isJobSaved = currentJob ? savedJobs.some(j => j.id === currentJob.id) : false
  const savedByBucket = BUCKETS.reduce((acc, b) => { acc[b] = savedJobs.filter(j => j.bucket === b); return acc }, {} as Record<JobBucket, SavedJob[]>)
  const totalSaved = savedJobs.length

  if (isResumeLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="skeleton-loader h-12 w-64" />
          <div className="grid xl:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6"><div className="skeleton-loader h-[500px]" /><div className="skeleton-loader h-64" /></div>
            <div className="skeleton-loader h-[400px]" />
          </div>
        </div>
      </div>
    )
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-center py-28">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-500/10 flex items-center justify-center mb-6 ring-1 ring-primary/20">
            <Target className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Resume Found</h2>
          <p className="text-muted-foreground text-sm mb-8 text-center max-w-sm">Upload your resume to start discovering live job matches powered by AI.</p>
          <Button asChild size="lg" className="rounded-xl px-10"><Link href="/">Upload Resume</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PrefsModal open={showPrefs} onClose={() => setShowPrefs(false)} currentPrefs={prefs}
        onSaved={(newPrefs) => { setPrefs(newPrefs); fetchLiveJobs() }} />
      <form ref={overleafFormRef} action="https://www.overleaf.com/docs" method="POST" target="_blank" className="hidden">
        <input ref={overleafInputRef} type="hidden" name="snip_uri" defaultValue="" />
      </form>

      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ── Gradient Header ─────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Career Match
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {totalSaved > 0 && (
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{totalSaved}</span> jobs tracked
                  </span>
                )}
                {liveJobs && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3 text-primary" />
                    <span className="font-semibold text-foreground">{liveJobs.length}</span> live matches
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" className="rounded-lg shrink-0 gap-1.5" onClick={() => setShowPrefs(true)}>
              <Settings2 className="h-3.5 w-3.5" /> Preferences
            </Button>
          </motion.div>

          {/* ── Main Grid ───────────────────────────────────────────── */}
          <div className="grid xl:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ── Left: Live Jobs + Analyzer ───────────────────────── */}
            <div className="space-y-6 min-w-0">

              {/* Live Job Matches */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        Live Job Matches
                      </CardTitle>
                      <Button onClick={fetchLiveJobs} disabled={isLiveLoading} size="sm" variant="outline" className="rounded-lg">
                        {isLiveLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {isLiveLoading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative mb-6">
                          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-primary/50" />
                          </div>
                        </div>
                        <p className="text-sm font-semibold">Analyzing live job matches…</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Embedding + ranking + AI analysis · ~20s</p>
                      </div>
                    ) : liveJobs && liveJobs.length > 0 ? (
                      <div className="space-y-4">
                        {/* Nav row */}
                        <div className="flex items-center justify-between">
                          <button onClick={() => setCurrentJobIdx(Math.max(0, currentJobIdx - 1))} disabled={currentJobIdx === 0}
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-25 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-medium text-muted-foreground">{currentJobIdx + 1} / {liveJobs.length}</span>
                            <div className="flex gap-1">
                              {liveJobs.map((_, i) => (
                                <button key={i} onClick={() => setCurrentJobIdx(i)}
                                  className={cn("h-1.5 rounded-full transition-all", i === currentJobIdx ? "bg-primary w-5" : "w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40")} />
                              ))}
                            </div>
                          </div>
                          <button onClick={() => setCurrentJobIdx(Math.min(liveJobs.length - 1, currentJobIdx + 1))} disabled={currentJobIdx === liveJobs.length - 1}
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-25 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Job card with animation */}
                        <AnimatePresence mode="wait">
                          {currentJob && (
                            <motion.div key={currentJobIdx}
                              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="rounded-xl border border-border/50 bg-gradient-to-b from-muted/5 to-transparent p-5 space-y-4">

                              {/* Header */}
                              <div className="flex items-start gap-3 justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="font-bold text-base leading-tight">{currentJob.title}</h2>
                                    {(() => { const l = formatContract(currentJob.contractType, currentJob.title); return l ? (
                                      <Badge variant="secondary" className={cn("text-[10px] rounded-full px-2",
                                        l === "Internship" && "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300")}>
                                        {l}
                                      </Badge>
                                    ) : null })()}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Building2 className="h-3 w-3" />{currentJob.company}
                                    </span>
                                    <span className="text-muted-foreground/30">·</span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3" />{currentJob.location}
                                    </span>
                                    {timeAgo(currentJob.created) && (
                                      <><span className="text-muted-foreground/30">·</span>
                                      <span className="text-[11px] text-muted-foreground/50">{timeAgo(currentJob.created)}</span></>
                                    )}
                                  </div>
                                </div>
                                {/* Score ring */}
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                  <ScoreRing score={currentJob.matchScore} size={64} />
                                  <span className={cn("text-[10px] font-semibold", getMatchColor(currentJob.matchScore))}>
                                    {getMatchLabel(currentJob.matchScore)}
                                  </span>
                                </div>
                              </div>

                              {/* Salary + breakdown mini */}
                              {formatSalary(currentJob.salaryMin, currentJob.salaryMax) && (
                                <p className="text-xs font-medium">
                                  {formatSalary(currentJob.salaryMin, currentJob.salaryMax)}
                                  <span className="text-muted-foreground font-normal">/yr</span>
                                </p>
                              )}

                              {/* Description */}
                              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{currentJob.description}</p>

                              {/* Actions */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button asChild size="sm" className="rounded-lg text-xs gap-1.5 flex-1 sm:flex-none">
                                  <a href={currentJob.applyUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3.5 w-3.5" />Apply Now
                                  </a>
                                </Button>
                                <Button size="sm" variant={isJobSaved ? "secondary" : "outline"} className="rounded-lg text-xs gap-1.5 flex-1 sm:flex-none"
                                  onClick={() => isJobSaved ? undefined : saveJob(currentJob)} disabled={isJobSaved}>
                                  {isJobSaved ? <><BookmarkCheck className="h-3.5 w-3.5" />Saved</> : <><Bookmark className="h-3.5 w-3.5" />Save Job</>}
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="rounded-lg text-xs gap-1.5 flex-1 sm:flex-none"
                                      disabled={tailoringAction?.idx === currentJobIdx}>
                                      {tailoringAction?.idx === currentJobIdx
                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Tailoring…</>
                                        : <><FileText className="h-3.5 w-3.5" />Tailor Resume</>}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => tailorResume(currentJob, "overleaf")} className="gap-2 text-xs">
                                      <ExternalLink className="h-3.5 w-3.5" />View in Overleaf
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => tailorResume(currentJob, "download")} className="gap-2 text-xs">
                                      <Download className="h-3.5 w-3.5" />Download .tex
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {/* Analysis (always shown — comes pre-loaded) */}
                              <AnalysisSection analysis={currentJob.analysis} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                          <Briefcase className="h-8 w-8 opacity-30" />
                        </div>
                        <p className="font-semibold text-sm mb-1">No jobs loaded yet</p>
                        <p className="text-xs text-center max-w-xs mb-5">Complete the questionnaire to set your job preferences, then come back here.</p>
                        <Button asChild size="sm" variant="outline" className="rounded-lg text-xs">
                          <Link href="/questionnaire">Set Preferences →</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Job Analyzer */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      Job Match Analyzer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                      placeholder="Paste any job description here to get a full fit breakdown…"
                      className="w-full min-h-[110px] max-h-[220px] p-3 rounded-xl bg-muted/20 border border-border/50 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all placeholder:text-muted-foreground/35" />
                    <Button onClick={analyzeCustomJob} disabled={isCompareLoading || jobDescription.trim().length < 20} className="w-full rounded-xl">
                      {isCompareLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing…</> : <><Send className="h-4 w-4 mr-2" />Analyze Match</>}
                    </Button>

                    {compareResult && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2 space-y-5">
                        {/* Score + breakdown */}
                        <div className="flex items-center gap-5 p-4 rounded-xl bg-muted/15 border border-border/40">
                          <ScoreRing score={compareResult.overallMatch} size={80} />
                          <div className="flex-1 min-w-0 space-y-2.5">
                            <div>
                              <p className="text-sm font-bold">{getMatchLabel(compareResult.overallMatch)}</p>
                              <p className="text-xs text-muted-foreground">Overall match for this role</p>
                            </div>
                            {[
                              { label: "Skills", val: compareResult.breakdown.skillsMatch },
                              { label: "Experience", val: compareResult.breakdown.experienceMatch },
                              { label: "Education", val: compareResult.breakdown.educationMatch },
                            ].map(({ label, val }) => (
                              <div key={label} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={cn("h-full rounded-full", getMatchBg(val))} />
                                </div>
                                <span className={cn("text-xs font-bold w-6 text-right tabular-nums", getMatchColor(val))}>{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3-col detail grid */}
                        <div className="grid gap-3 sm:grid-cols-3">
                          {[
                            { key: "strengths", icon: CheckCircle2, label: "Strengths", items: compareResult.strengths, color: "text-green-500", bg: "bg-green-500/5 border-green-500/15", dot: "text-green-400" },
                            { key: "gaps", icon: XCircle, label: "What's Missing", items: compareResult.gaps, color: "text-orange-500", bg: "bg-orange-500/5 border-orange-500/15", dot: "text-orange-400" },
                            { key: "steps", icon: TrendingUp, label: "Next Steps", items: compareResult.recommendations, color: "text-primary", bg: "bg-primary/5 border-primary/15", dot: "text-primary" },
                          ].map(({ key, icon: Icon, label, items, color, bg, dot }) => (
                            <div key={key} className={cn("rounded-xl border p-3.5 space-y-2", bg)}>
                              <p className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest", color)}>
                                <Icon className="h-3.5 w-3.5" />{label}
                              </p>
                              <ul className="space-y-1.5">
                                {items.map((item, i) => (
                                  <li key={i} className="flex gap-1.5 text-xs text-muted-foreground leading-relaxed">
                                    <span className={cn("shrink-0 mt-px", dot)}>▸</span>{item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Tailor resume for this pasted description */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5" disabled={!!tailoringAnalyzer}>
                              {tailoringAnalyzer
                                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Tailoring…</>
                                : <><FileText className="h-3.5 w-3.5" />Tailor Resume for This Role</>}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-48">
                            <DropdownMenuItem onClick={() => tailorFromAnalyzer("overleaf")} className="gap-2 text-xs">
                              <ExternalLink className="h-3.5 w-3.5" />View in Overleaf
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => tailorFromAnalyzer("download")} className="gap-2 text-xs">
                              <Download className="h-3.5 w-3.5" />Download .tex
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ── Right Sidebar: Job Board + Preferences ──────────── */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-4 xl:sticky xl:top-6">

              {/* Job Board */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2.5 text-sm">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <BookmarkCheck className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      Job Board
                    </CardTitle>
                    {totalSaved > 0 && (
                      <Badge variant="secondary" className="text-xs rounded-full">{totalSaved}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-2 max-h-[520px] overflow-y-auto">
                  {totalSaved === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-25" />
                      <p className="text-xs">Save jobs from the carousel to track them here</p>
                    </div>
                  ) : (
                    BUCKETS.map(bucket => {
                      const jobs = savedByBucket[bucket]
                      if (jobs.length === 0) return null
                      const meta = BUCKET_META[bucket]
                      return (
                        <div key={bucket}>
                          <button onClick={() => setExpandedBucket(expandedBucket === bucket ? null : bucket)}
                            className="w-full flex items-center justify-between px-1 py-1.5 text-left group">
                            <span className={cn("text-[11px] font-bold uppercase tracking-wider", meta.color)}>
                              {meta.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={cn("text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-current/10", meta.color)}>{jobs.length}</span>
                              <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", expandedBucket === bucket && "rotate-180")} />
                            </div>
                          </button>
                          {expandedBucket === bucket && (
                            <div className="space-y-2 pb-2">
                              {jobs.map(j => (
                                <SavedJobCard key={j.id} job={j}
                                  onBucket={b => moveBucket(j.id, b)}
                                  onRemove={() => removeJob(j.id)} />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>

              {/* Search Preferences preview */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                        <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      Search Preferences
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg" onClick={() => setShowPrefs(true)}>Edit</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  {prefs.roleTypes?.length ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Roles</p>
                      <div className="flex flex-wrap gap-1">
                        {prefs.roleTypes.slice(0, 4).map(r => (
                          <Badge key={r} variant="secondary" className="text-[10px] rounded-full px-2">{r}</Badge>
                        ))}
                        {prefs.roleTypes.length > 4 && <Badge variant="outline" className="text-[10px] rounded-full px-2">+{prefs.roleTypes.length - 4}</Badge>}
                      </div>
                    </div>
                  ) : null}
                  {prefs.jobType?.length ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Type</p>
                      <div className="flex flex-wrap gap-1">
                        {prefs.jobType.map(t => <Badge key={t} variant="secondary" className="text-[10px] rounded-full px-2">{t}</Badge>)}
                      </div>
                    </div>
                  ) : null}
                  {prefs.degreeLevel?.length ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Degree</p>
                      <div className="flex flex-wrap gap-1">
                        {prefs.degreeLevel.map(d => <Badge key={d} variant="outline" className="text-[10px] rounded-full px-2">{d}</Badge>)}
                      </div>
                    </div>
                  ) : null}
                  {prefs.location?.length ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                      <div className="flex flex-wrap gap-1">
                        {prefs.location.map(l => <Badge key={l} variant="outline" className="text-[10px] rounded-full px-2">{l}</Badge>)}
                      </div>
                    </div>
                  ) : null}
                  {!prefs.roleTypes?.length && (
                    <p className="text-xs text-muted-foreground text-center py-2">No preferences set yet</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  )
}
