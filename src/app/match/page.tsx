"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Target, ChevronLeft, ChevronRight, Sparkles, FileText, Send,
  CheckCircle2, XCircle, TrendingUp, Loader2, RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useResume } from "@/contexts/resume-context"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { toast } from "sonner"

// --- Types ---

interface RoleSuggestion {
  title: string
  matchScore: number
  reasoning: string
  matchingSkills: string[]
  missingSkills: string[]
  growthAreas: string[]
}

interface CompareResult {
  overallMatch: number
  breakdown: {
    skillsMatch: number
    experienceMatch: number
    educationMatch: number
  }
  strengths: string[]
  gaps: string[]
  recommendations: string[]
}

// --- Score Color Helper ---

function getMatchColor(score: number) {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  if (score >= 40) return "text-orange-600"
  return "text-red-600"
}

function getMatchBg(score: number) {
  if (score >= 80) return "bg-green-500"
  if (score >= 60) return "bg-yellow-500"
  if (score >= 40) return "bg-orange-500"
  return "bg-red-500"
}

// --- Main Page ---

export default function MatchPage() {
  const { resumeData, isLoading: isResumeLoading } = useResume()
  const { user } = useUser()

  // Suggestions state
  const [suggestions, setSuggestions] = useState<RoleSuggestion[] | null>(null)
  const [isSuggestLoading, setIsSuggestLoading] = useState(false)
  const [currentSuggestionIdx, setCurrentSuggestionIdx] = useState(0)

  // Compare state
  const [jobDescription, setJobDescription] = useState("")
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null)
  const [isCompareLoading, setIsCompareLoading] = useState(false)

  // Load cached suggestions on mount
  useEffect(() => {
    if (!resumeData) return
    loadCachedSuggestions()
  }, [resumeData])

  const loadCachedSuggestions = async () => {
    try {
      const res = await fetch("/api/match")
      const result = await res.json()
      if (result.success && result.data?.suggestions) {
        setSuggestions(result.data.suggestions)
      }
    } catch { /* no cache */ }
  }

  const generateSuggestions = async () => {
    setIsSuggestLoading(true)
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "suggest" }),
      })
      const result = await res.json()
      if (result.success && result.data?.suggestions) {
        setSuggestions(result.data.suggestions)
        setCurrentSuggestionIdx(0)
        toast.success("Role suggestions generated!")
      } else {
        toast.error(result.error || "Failed to generate suggestions")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSuggestLoading(false)
    }
  }

  const analyzeJobMatch = async () => {
    if (jobDescription.trim().length < 20) {
      toast.error("Please paste a longer job description (at least 20 characters).")
      return
    }
    setIsCompareLoading(true)
    setCompareResult(null)
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "compare", jobDescription }),
      })
      const result = await res.json()
      if (result.success && result.data) {
        setCompareResult(result.data)
        toast.success("Match analysis complete!")
      } else {
        toast.error(result.error || "Failed to analyze match")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsCompareLoading(false)
    }
  }

  // --- Loading State ---
  if (isResumeLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <div className="skeleton-loader h-10 w-56 mb-3" />
            <div className="skeleton-loader h-4 w-40" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="skeleton-loader h-72" />
            <div className="skeleton-loader h-72" />
          </div>
        </div>
      </div>
    )
  }

  // --- No Resume State ---
  if (!resumeData) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight">Match</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <Target className="h-10 w-10 text-primary animate-pulse-subtle" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Resume Yet</h2>
            <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">Upload your resume to discover roles that match your profile and compare against job descriptions.</p>
            <Button asChild size="lg" className="rounded-xl px-8">
              <Link href="/">Upload Resume</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // --- Main Content ---
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Match</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover your best-fit roles and compare against job postings</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* --- Section 1: Role Suggestions --- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Top Roles For You
                </CardTitle>
                <Button
                  onClick={generateSuggestions}
                  disabled={isSuggestLoading}
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                >
                  {isSuggestLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  {suggestions ? "Refresh" : "Generate"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isSuggestLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">Analyzing your profile...</p>
                </div>
              ) : suggestions && suggestions.length > 0 ? (
                <div>
                  {/* Carousel nav */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setCurrentSuggestionIdx(Math.max(0, currentSuggestionIdx - 1))}
                      disabled={currentSuggestionIdx === 0}
                      className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-muted-foreground font-medium">
                      {currentSuggestionIdx + 1} of {suggestions.length}
                    </span>
                    <button
                      onClick={() => setCurrentSuggestionIdx(Math.min(suggestions.length - 1, currentSuggestionIdx + 1))}
                      disabled={currentSuggestionIdx === suggestions.length - 1}
                      className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Current suggestion card */}
                  {(() => {
                    const s = suggestions[currentSuggestionIdx]
                    return (
                      <div key={currentSuggestionIdx} className="p-4 rounded-xl bg-muted/20 border-l-[3px] border-l-primary/40 space-y-3 animate-carousel-in">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-sm leading-snug">{s.title}</h3>
                          <div className={cn("text-lg font-bold tabular-nums shrink-0", getMatchColor(s.matchScore))}>
                            {s.matchScore}%
                          </div>
                        </div>

                        {/* Match bar */}
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", getMatchBg(s.matchScore))}
                            style={{ width: `${s.matchScore}%` }}
                          />
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">{s.reasoning}</p>

                        {/* Matching skills */}
                        {s.matchingSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" /> Your strengths
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {s.matchingSkills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs rounded-full">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing skills */}
                        {s.missingSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-orange-500" /> Skills to develop
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {s.missingSkills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs rounded-full opacity-70">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Growth areas */}
                        {s.growthAreas.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-primary" /> Growth path
                            </p>
                            <ul className="space-y-1">
                              {s.growthAreas.map((area, i) => (
                                <li key={i} className="text-xs text-muted-foreground leading-relaxed">• {area}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Dot indicators */}
                  {suggestions.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                      {suggestions.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setCurrentSuggestionIdx(dotIdx)}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all",
                            dotIdx === currentSuggestionIdx ? "bg-primary w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium text-sm">No suggestions yet</p>
                  <p className="text-xs mt-1">Click "Generate" to discover your best-fit roles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- Section 2: Job Description Matcher --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Match Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste a job description here..."
                className="w-full min-h-[160px] max-h-[300px] p-3 rounded-xl bg-muted/30 border border-border/60 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50"
              />
              <Button
                onClick={analyzeJobMatch}
                disabled={isCompareLoading || jobDescription.trim().length < 20}
                className="w-full rounded-xl"
              >
                {isCompareLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>

              {/* Compare Results */}
              {compareResult && (
                <div className="animate-carousel-in space-y-4 pt-2">
                  {/* Overall score */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20">
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" fill="none" className="text-muted/50" />
                        <circle
                          cx="32" cy="32" r="26"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 26}
                          strokeDashoffset={2 * Math.PI * 26 - (compareResult.overallMatch / 100) * 2 * Math.PI * 26}
                          strokeLinecap="round"
                          className={getMatchColor(compareResult.overallMatch)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn("text-lg font-bold", getMatchColor(compareResult.overallMatch))}>
                          {compareResult.overallMatch}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Overall Match</p>
                      <p className="text-xs text-muted-foreground">Based on skills, experience, and education</p>
                    </div>
                  </div>

                  {/* Breakdown bars */}
                  <div className="space-y-2">
                    {[
                      { label: "Skills", value: compareResult.breakdown.skillsMatch },
                      { label: "Experience", value: compareResult.breakdown.experienceMatch },
                      { label: "Education", value: compareResult.breakdown.educationMatch },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-20">{item.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", getMatchBg(item.value))}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                        <span className={cn("text-xs font-bold w-8 text-right tabular-nums", getMatchColor(item.value))}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Strengths */}
                  {compareResult.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Strengths
                      </p>
                      <ul className="space-y-1">
                        {compareResult.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-muted-foreground leading-relaxed">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gaps */}
                  {compareResult.gaps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-orange-500" /> Gaps
                      </p>
                      <ul className="space-y-1">
                        {compareResult.gaps.map((g, i) => (
                          <li key={i} className="text-xs text-muted-foreground leading-relaxed">• {g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {compareResult.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-primary" /> Recommendations
                      </p>
                      <ul className="space-y-1">
                        {compareResult.recommendations.map((r, i) => (
                          <li key={i} className="text-xs text-muted-foreground leading-relaxed">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
