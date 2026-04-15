"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Lightbulb, Save, CheckCircle2, FileEdit, Download,
  GraduationCap, Briefcase, Rocket, Zap, Compass
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Resume } from "@/app/api/parse/resumeSchema"

interface ActionableInsight {
  id: string
  category: string
  insight: string
  priority: "high" | "medium" | "low"
  checked: boolean
  type?: "tweak" | "goal"
  targetYear?: number
}

interface ActionableInsightsProps {
  insights: ActionableInsight[]
  currentYear: number
  graduationYear: number
  resumeData?: Resume | null
  xyzFeedback?: Record<string, any> | null
  onInsightsChange?: (insights: ActionableInsight[]) => void
}

function getYearLabel(year: number, grad: number): string {
  const diff = grad - year;
  if (diff === 0) return `${year} (Senior)`
  if (diff === 1) return `${year} (Junior)`
  if (diff === 2) return `${year} (Sophomore)`
  if (diff === 3) return `${year} (Freshman)`
  return `${year}`
}

const YEAR_ICONS_BY_POS: Record<number, typeof GraduationCap> = {
  1: Zap,          // This year — action
  2: Briefcase,    // Next year
  3: Rocket,       // Further out
  4: GraduationCap,
  5: GraduationCap,
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
}

const CATEGORY_COLORS: Record<string, string> = {
  projects: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  experience: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  skills: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  formatting: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  links: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  gpa: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  coursework: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
}

export function ActionableInsights({ insights: initialInsights, currentYear, graduationYear, resumeData, xyzFeedback, onInsightsChange }: ActionableInsightsProps) {
  const [insights, setInsights] = useState<ActionableInsight[]>(initialInsights)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeYear, setActiveYear] = useState(currentYear)

  useEffect(() => {
    setInsights(initialInsights)
  }, [initialInsights])

  const handleToggle = (id: string) => {
    const updated = insights.map(insight =>
      insight.id === id ? { ...insight, checked: !insight.checked } : insight
    )
    setInsights(updated)
    setHasChanges(true)
    onInsightsChange?.(updated)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insights,
          generatedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast.success("Progress saved!", {
        description: `${insights.filter(i => i.checked).length} items marked as done`,
      })
      setHasChanges(false)
    } catch {
      toast.error("Failed to save progress", {
        description: "Please try again",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Compute available year tabs (from currentYear up to graduationYear, capped at max 5 years)
  const maxYears = Math.min((graduationYear - currentYear) + 1, 5)
  const maxPossibleYear = currentYear + maxYears - 1

  // Split insights and clamp goal targetYears so no goals are invisible
  const tweaks = insights.filter(i => i.type === "tweak" || (!i.type && !i.targetYear))
  const goals = insights.filter(i => i.type === "goal" || (i.targetYear && i.targetYear > 0)).map(g => ({
    ...g,
    targetYear: g.targetYear ? Math.max(currentYear, Math.min(g.targetYear, maxPossibleYear)) : currentYear
  }))

  const yearTabs: number[] = []
  for (let i = 0; i < maxYears; i++) {
    yearTabs.push(currentYear + i)
  }

  // Goals for the currently selected year tab
  const goalsForYear = goals.filter(g => g.targetYear === activeYear)

  // Stats
  const completedCount = insights.filter(i => i.checked).length
  const totalCount = insights.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const tweaksRemaining = tweaks.filter(i => !i.checked).length
  const goalsForYearRemaining = goalsForYear.filter(i => !i.checked).length

  // Sort: unchecked first, then by priority
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sortItems = (a: ActionableInsight, b: ActionableInsight) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
  }

  const renderItem = (item: ActionableInsight) => (
    <div
      key={item.id}
      className={cn(
        "group flex items-start gap-2.5 p-3 rounded-lg border transition-all duration-200 cursor-pointer",
        item.checked
          ? "bg-muted/30 border-muted/50 opacity-50"
          : "bg-background hover:shadow-sm hover:border-border/80 dark:bg-card"
      )}
      onClick={() => handleToggle(item.id)}
    >
      <Checkbox
        id={item.id}
        checked={item.checked}
        onCheckedChange={() => handleToggle(item.id)}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5 mb-1.5">
          <span className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 mt-1.5",
            PRIORITY_DOT[item.priority] || PRIORITY_DOT.low
          )} />
          <div
            className={cn(
              "text-xs block leading-relaxed",
              item.checked && "line-through text-muted-foreground"
            )}
          >
            {item.insight}
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] px-1.5 py-0 h-4 capitalize ml-3",
            CATEGORY_COLORS[item.category] || "bg-muted text-muted-foreground"
          )}
        >
          {item.category}
        </Badge>
      </div>
    </div>
  )

  // Empty state
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Career Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-sm">Looking good!</p>
            <p className="text-xs mt-1">No improvements suggested right now.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Career Roadmap
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold leading-none">{completedCount}/{totalCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{progressPercent}% done</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              size="sm"
              className="rounded-lg"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-3">
          <div
            className="h-full rounded-full transition-all duration-500 bg-green-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>

      {/* Two-panel layout */}
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border min-h-[320px]">

          {/* LEFT PANEL — Resume Tweaks */}
          <div className="lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col">
            {/* Panel header */}
            <div className="px-4 py-3 border-b bg-orange-500/5 dark:bg-orange-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold">Resume Tweaks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {tweaksRemaining > 0 ? `${tweaksRemaining} left` : "✓ Done"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs gap-1"
                    disabled={isExporting || !resumeData}
                    onClick={async () => {
                      setIsExporting(true)
                      try {
                        const response = await fetch("/api/export/latex", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            resumeData,
                            tweaks: tweaks.map(t => ({ insight: t.insight, category: t.category })),
                            xyzImprovements: xyzFeedback ? { projects: xyzFeedback.projects, experience: xyzFeedback.experience } : null,
                          }),
                        })
                        if (!response.ok) throw new Error("Export failed")
                        const blob = await response.blob()
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = "resume.tex"
                        a.click()
                        URL.revokeObjectURL(url)
                        toast.success("LaTeX resume downloaded!", { description: "Open it in Overleaf to compile" })
                      } catch {
                        toast.error("Failed to export", { description: "Please try again" })
                      } finally {
                        setIsExporting(false)
                      }
                    }}
                  >
                    <Download className="h-3 w-3" />
                    {isExporting ? "Exporting..." : "LaTeX"}
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Specific edits to make on your resume
              </p>
            </div>

            {/* Tweaks list */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[500px] lg:max-h-none">
              {tweaks.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground/40 py-8">
                  <p className="text-xs">No resume tweaks</p>
                </div>
              ) : (
                tweaks.sort(sortItems).map(renderItem)
              )}
            </div>
          </div>

          {/* RIGHT PANEL — Career Goals (Tabbed) */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Year Tabs */}
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-1 overflow-x-auto">
              {yearTabs.map((year, index) => {
                const YearIcon = YEAR_ICONS_BY_POS[index + 1] || GraduationCap
                const isActive = activeYear === year
                const yearGoals = goals.filter(g => g.targetYear === year)
                const yearRemaining = yearGoals.filter(g => !g.checked).length
                const label = getYearLabel(year, graduationYear)

                return (
                  <button
                    key={year}
                    onClick={() => setActiveYear(year)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <YearIcon className="h-3.5 w-3.5" />
                    {label}
                    {yearRemaining > 0 && (
                      <span className={cn(
                        "text-[9px] px-1 py-0 rounded-full min-w-[16px] text-center",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted-foreground/10 text-muted-foreground"
                      )}>
                        {yearRemaining}
                      </span>
                    )}
                    {year === currentYear && !isActive && (
                      <span className="text-[8px] px-1 py-0 rounded bg-primary/10 text-primary font-semibold">
                        NOW
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Active year subtitle */}
            <div className="px-4 py-2 border-b bg-primary/[0.03] dark:bg-primary/[0.06]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  {activeYear === currentYear
                    ? "Things you can start doing now outside the classroom"
                    : `Goals to work toward in ${getYearLabel(activeYear, graduationYear)}`}
                </p>
                <span className="text-xs text-muted-foreground font-mono">
                  {goalsForYearRemaining > 0 ? `${goalsForYearRemaining} left` : "✓ Done"}
                </span>
              </div>
            </div>

            {/* Goals list for selected year */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[500px] lg:max-h-none">
              {goalsForYear.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 py-8">
                  <CheckCircle2 className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No goals for {getYearLabel(activeYear, graduationYear)}</p>
                </div>
              ) : (
                goalsForYear.sort(sortItems).map(renderItem)
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
