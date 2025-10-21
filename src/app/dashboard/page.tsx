"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowDown, Target, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data - replace with actual resume data later
const mockStudentData = {
  gpa: 3.7, // This would come from parsed resume
  yearInSchool: 3, // 1 = Freshman, 2 = Sophomore, 3 = Junior, 4 = Senior
}

const INTERNSHIP_AVG_GPA = 3.6 // Average GPA of students who got internships

// GPA Component
function GPAProgressBar({ gpa }: { gpa: number }) {
  // Determine color zone and label
  const getGPAZone = (gpa: number) => {
    if (gpa < 3.0) return { color: "bg-red-500", label: "Needs Improvement", textColor: "text-red-700" }
    if (gpa < 3.4) return { color: "bg-orange-500", label: "Fair", textColor: "text-orange-700" }
    if (gpa < 3.7) return { color: "bg-yellow-500", label: "Good", textColor: "text-yellow-700" }
    if (gpa < 3.8) return { color: "bg-green-400", label: "Very Good", textColor: "text-green-600" }
    return { color: "bg-green-600", label: "Excellent", textColor: "text-green-700" }
  }

  const MIN_GPA = 2.5
  const MAX_GPA = 4.0
  const range = MAX_GPA - MIN_GPA // 1.5

  // Calculate percentage within the 2.5-4.0 range
  const percentage = ((gpa - MIN_GPA) / range) * 100
  const benchmarkPercentage = ((INTERNSHIP_AVG_GPA - MIN_GPA) / range) * 100

  // Calculate zone widths based on 2.5-4.0 scale
  const zoneWidths = {
    red: ((3.0 - 2.5) / range) * 100, // 2.5-3.0 = 33.3%
    orange: ((3.4 - 3.0) / range) * 100, // 3.0-3.4 = 26.7%
    yellow: ((3.7 - 3.4) / range) * 100, // 3.4-3.7 = 20%
    lightGreen: ((3.8 - 3.7) / range) * 100, // 3.7-3.8 = 6.7%
    darkGreen: ((4.0 - 3.8) / range) * 100, // 3.8-4.0 = 13.3%
  }

  const zone = getGPAZone(gpa)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>GPA Analysis</CardTitle>
            <CardDescription>Your academic standing and competitiveness</CardDescription>
          </div>
          <Badge variant="outline" className={zone.textColor}>
            {zone.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GPA Display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your GPA</p>
            <p className="text-4xl font-bold">{gpa.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Out of</p>
            <p className="text-2xl font-semibold text-muted-foreground">4.0</p>
          </div>
        </div>

        {/* Progress Bar with Color Zones */}
        <div className="space-y-2 py-4">
          {/* Container for labels and bar - no overflow hidden */}
          <div className="relative w-full" style={{ paddingTop: '45px', paddingBottom: '60px' }}>
            {/* Student's GPA label (above bar) */}
            <div
              className="absolute top-0 flex flex-col items-center -translate-x-1/2 z-20"
              style={{ left: `${Math.max(0, Math.min(100, percentage))}%` }}
            >
              <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg whitespace-nowrap">
                You: {gpa.toFixed(2)}
              </div>
              {/* Large triangle arrow pointing down */}
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary" />
            </div>

            {/* The actual progress bar */}
            <div className="relative h-8 w-full rounded-full overflow-hidden bg-muted" style={{ marginTop: '37px' }}>
              {/* Color zones background */}
              <div className="absolute inset-0 flex">
                <div className="bg-red-500" style={{ width: `${zoneWidths.red}%` }} />
                <div className="bg-orange-500" style={{ width: `${zoneWidths.orange}%` }} />
                <div className="bg-yellow-500" style={{ width: `${zoneWidths.yellow}%` }} />
                <div className="bg-green-400" style={{ width: `${zoneWidths.lightGreen}%` }} />
                <div className="bg-green-600" style={{ width: `${zoneWidths.darkGreen}%` }} />
              </div>

              {/* Student's GPA marker line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                style={{ left: `${Math.max(0, Math.min(100, percentage))}%` }}
              />

              {/* Internship average benchmark line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-blue-600 z-10 shadow-md"
                style={{ left: `${benchmarkPercentage}%` }}
              />
            </div>

            {/* Internship average label (below bar) */}
            <div
              className="absolute bottom-0 flex flex-col items-center -translate-x-1/2 z-20"
              style={{ left: `${benchmarkPercentage}%` }}
            >
              {/* Large triangle arrow pointing up */}
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-600" />
              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                <Target className="h-4 w-4" />
                Avg Internship: {INTERNSHIP_AVG_GPA.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Number line */}
          <div className="relative w-full pt-10 pb-2">
            <div className="relative text-xs text-muted-foreground">
              {[2.5, 3.0, 3.4, 3.7, 3.8, 4.0].map((value) => {
                const position = ((value - MIN_GPA) / range) * 100
                return (
                  <div
                    key={value}
                    className="absolute flex flex-col items-center -translate-x-1/2"
                    style={{ left: `${position}%` }}
                  >
                    <div className="h-2 w-px bg-border mb-1" />
                    <span className="font-medium">{value.toFixed(1)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-red-500" />
              <span>2.5-3.0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-orange-500" />
              <span>3.0-3.4</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-yellow-500" />
              <span>3.4-3.7</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-green-400" />
              <span>3.7-3.8</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-green-600" />
              <span>3.8-4.0</span>
            </div>
          </div>
        </div>

        {/* Contextual Feedback */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm">
            {gpa >= INTERNSHIP_AVG_GPA ? (
              <>
                <span className="font-semibold text-green-600">Great position!</span> Your GPA is{" "}
                {gpa > INTERNSHIP_AVG_GPA ? "above" : "at"} the average for students who secured
                internships ({INTERNSHIP_AVG_GPA.toFixed(1)}). Keep up the excellent work!
              </>
            ) : (
              <>
                <span className="font-semibold text-blue-600">Room for growth.</span> The average GPA for
                students who got internships is {INTERNSHIP_AVG_GPA.toFixed(1)}. Focus on your technical
                projects and experience to strengthen your profile!
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Year in School Component
function YearInSchoolIndicator({ currentYear }: { currentYear: number }) {
  const years = [
    {
      year: 1,
      label: "Freshman",
      title: "Build Your Foundation",
      description: "Focus on fundamentals, join clubs, start building portfolio",
      color: "from-blue-500 to-blue-600",
    },
    {
      year: 2,
      label: "Sophomore",
      title: "Gain Experience",
      description: "Seek first internship, develop technical projects, attend career fairs",
      color: "from-purple-500 to-purple-600",
    },
    {
      year: 3,
      label: "Junior",
      title: "Level Up",
      description: "Target competitive internships, strengthen resume, network actively",
      color: "from-orange-500 to-orange-600",
    },
    {
      year: 4,
      label: "Senior",
      title: "Launch Your Career",
      description: "Apply for full-time roles, leverage experience, finalize portfolio",
      color: "from-green-500 to-green-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Progress</CardTitle>
        <CardDescription>Your current year and recommended focus areas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress stepper */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-muted" />
          <div
            className="absolute top-6 left-0 h-1 bg-gradient-to-r from-primary to-primary transition-all duration-500"
            style={{ width: `${((currentYear - 1) / 3) * 100}%` }}
          />

          {/* Year circles */}
          <div className="relative grid grid-cols-4 gap-4">
            {years.map((yearData) => {
              const isActive = yearData.year === currentYear
              const isCompleted = yearData.year < currentYear
              const isFuture = yearData.year > currentYear

              return (
                <div key={yearData.year} className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-4",
                      isActive && "bg-primary text-primary-foreground border-primary scale-110 shadow-lg",
                      isCompleted && "bg-green-500 text-white border-green-500",
                      isFuture && "bg-muted text-muted-foreground border-muted",
                    )}
                  >
                    {isCompleted ? <Check className="h-6 w-6" /> : yearData.year}
                  </div>

                  {/* Label */}
                  <p
                    className={cn(
                      "mt-2 text-sm font-semibold",
                      isActive && "text-primary",
                      isCompleted && "text-green-600",
                      isFuture && "text-muted-foreground",
                    )}
                  >
                    {yearData.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current year details */}
        <div className="mt-8">
          {years.map((yearData) => {
            if (yearData.year === currentYear) {
              return (
                <div
                  key={yearData.year}
                  className={cn(
                    "p-6 rounded-lg bg-gradient-to-br text-white shadow-lg",
                    yearData.color,
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold">{yearData.title}</h3>
                    <Badge className="bg-white/20 text-white border-white/30">
                      Year {yearData.year}
                    </Badge>
                  </div>
                  <p className="text-white/90 text-lg">{yearData.description}</p>
                </div>
              )
            }
            return null
          })}
        </div>

        {/* All year summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {years.map((yearData) => {
            const isActive = yearData.year === currentYear
            const isCompleted = yearData.year < currentYear

            return (
              <div
                key={yearData.year}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  isActive && "border-primary bg-primary/5",
                  isCompleted && "border-green-500 bg-green-50 dark:bg-green-950/20",
                  !isActive && !isCompleted && "border-border bg-muted/30",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted && "bg-green-500 text-white",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : yearData.year}
                  </div>
                  <h4 className="font-semibold">{yearData.label}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{yearData.description}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Your personalized insights and recommendations</p>
        </div>

        <div className="grid gap-6">
          <GPAProgressBar gpa={mockStudentData.gpa} />
          
          <YearInSchoolIndicator currentYear={mockStudentData.yearInSchool} />

          <Card>
            <CardHeader>
              <CardTitle>More Insights Coming Soon</CardTitle>
              <CardDescription>
                Additional visualizations will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Skills analysis, project portfolio, and more...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
