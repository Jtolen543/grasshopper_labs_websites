import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface YearInSchoolIndicatorProps {
  currentYear: number
}

export function YearInSchoolIndicator({ currentYear }: YearInSchoolIndicatorProps) {
  const years = [
    { year: 1, label: "Freshman", title: "Build Your Foundation", description: "Focus on fundamentals, join clubs, start building portfolio", color: "from-blue-500 to-blue-600" },
    { year: 2, label: "Sophomore", title: "Gain Experience", description: "Seek first internship, develop technical projects, attend career fairs", color: "from-purple-500 to-purple-600" },
    { year: 3, label: "Junior", title: "Level Up", description: "Target competitive internships, strengthen resume, network actively", color: "from-orange-500 to-orange-600" },
    { year: 4, label: "Senior", title: "Launch Your Career", description: "Apply for full-time roles, leverage experience, finalize portfolio", color: "from-green-500 to-green-600" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Progress</CardTitle>
        <CardDescription>Your current year and recommended focus areas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <div className="absolute top-6 left-0 right-0 h-1 bg-muted" />
          <div
            className="absolute top-6 left-0 h-1 bg-gradient-to-r from-primary to-primary transition-all duration-500"
            style={{ width: `${((currentYear - 1) / 3) * 100}%` }}
          />

          <div className="relative grid grid-cols-4 gap-4">
            {years.map((yearData) => {
              const isActive = yearData.year === currentYear
              const isCompleted = yearData.year < currentYear
              const isFuture = yearData.year > currentYear

              return (
                <div key={yearData.year} className="flex flex-col items-center">
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
      </CardContent>
    </Card>
  )
}
