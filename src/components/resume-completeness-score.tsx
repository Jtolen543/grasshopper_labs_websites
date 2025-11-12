import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, Globe, Briefcase, Award, Users, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResumeCompletenessScoreProps {
  resume: {
    hasGithub: boolean
    hasLinkedIn: boolean
    hasPortfolio: boolean
    hasProjects: boolean
    hasExperience: boolean
    hasCertifications: boolean
    hasExtracurriculars: boolean
  }
}

export function ResumeCompletenessScore({ resume }: ResumeCompletenessScoreProps) {
  const criteria = [
    { label: "GitHub Profile", icon: Github, value: resume.hasGithub, points: 15 },
    { label: "LinkedIn Profile", icon: Linkedin, value: resume.hasLinkedIn, points: 10 },
    { label: "Portfolio Website", icon: Globe, value: resume.hasPortfolio, points: 15 },
    { label: "Projects", icon: Briefcase, value: resume.hasProjects, points: 20 },
    { label: "Work Experience", icon: Briefcase, value: resume.hasExperience, points: 20 },
    { label: "Certifications", icon: Award, value: resume.hasCertifications, points: 10 },
    { label: "Extracurriculars", icon: Users, value: resume.hasExtracurriculars, points: 10 },
  ]

  const totalScore = criteria.reduce((sum, item) => sum + (item.value ? item.points : 0), 0)
  const percentage = totalScore

  const getStatusInfo = (score: number) => {
    if (score >= 90) return { color: "text-green-600", bg: "bg-green-600", label: "Excellent" }
    if (score >= 75) return { color: "text-blue-600", bg: "bg-blue-600", label: "Very Good" }
    if (score >= 60) return { color: "text-yellow-600", bg: "bg-yellow-600", label: "Good" }
    if (score >= 40) return { color: "text-orange-600", bg: "bg-orange-600", label: "Fair" }
    return { color: "text-red-600", bg: "bg-red-600", label: "Needs Work" }
  }

  const status = getStatusInfo(totalScore)
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Resume Completeness</CardTitle>
            <CardDescription>How complete is your profile?</CardDescription>
          </div>
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted" />
                <circle
                  cx="96" cy="96" r="70" stroke="currentColor" strokeWidth="12" fill="none"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                  className={cn("transition-all duration-1000 ease-out", status.bg)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{totalScore}%</span>
                <span className="text-sm text-muted-foreground">Complete</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {criteria.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                    item.value ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-border bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        item.value ? "bg-green-500 text-white" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.value ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </div>
                    <span className={cn("font-medium text-sm", item.value ? "text-foreground" : "text-muted-foreground")}>
                      {item.label}
                    </span>
                  </div>
                  <Badge variant={item.value ? "default" : "secondary"} className="font-semibold">
                    +{item.points}%
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
