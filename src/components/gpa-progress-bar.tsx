import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target } from "lucide-react"

const INTERNSHIP_AVG_GPA = 3.6

interface GPAProgressBarProps {
  gpa: number
}

export function GPAProgressBar({ gpa }: GPAProgressBarProps) {
  const getGPAZone = (gpa: number) => {
    if (gpa < 3.0) return { color: "bg-red-500", label: "Needs Improvement", textColor: "text-red-700" }
    if (gpa < 3.4) return { color: "bg-orange-500", label: "Fair", textColor: "text-orange-700" }
    if (gpa < 3.7) return { color: "bg-yellow-500", label: "Good", textColor: "text-yellow-700" }
    if (gpa < 3.8) return { color: "bg-green-400", label: "Very Good", textColor: "text-green-600" }
    return { color: "bg-green-600", label: "Excellent", textColor: "text-green-700" }
  }

  const MIN_GPA = 2.5
  const MAX_GPA = 4.0
  const range = MAX_GPA - MIN_GPA

  const percentage = ((gpa - MIN_GPA) / range) * 100
  const benchmarkPercentage = ((INTERNSHIP_AVG_GPA - MIN_GPA) / range) * 100

  const zoneWidths = {
    red: ((3.0 - 2.5) / range) * 100,
    orange: ((3.4 - 3.0) / range) * 100,
    yellow: ((3.7 - 3.4) / range) * 100,
    lightGreen: ((3.8 - 3.7) / range) * 100,
    darkGreen: ((4.0 - 3.8) / range) * 100,
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

        <div className="space-y-2 py-4">
          <div className="relative w-full" style={{ paddingTop: '45px', paddingBottom: '60px' }}>
            <div
              className="absolute top-0 flex flex-col items-center -translate-x-1/2 z-20"
              style={{ left: `${Math.max(0, Math.min(100, percentage))}%` }}
            >
              <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg whitespace-nowrap">
                You: {gpa.toFixed(2)}
              </div>
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary" />
            </div>

            <div className="relative h-8 w-full rounded-full overflow-hidden bg-muted" style={{ marginTop: '37px' }}>
              <div className="absolute inset-0 flex">
                <div className="bg-red-500" style={{ width: `${zoneWidths.red}%` }} />
                <div className="bg-orange-500" style={{ width: `${zoneWidths.orange}%` }} />
                <div className="bg-yellow-500" style={{ width: `${zoneWidths.yellow}%` }} />
                <div className="bg-green-400" style={{ width: `${zoneWidths.lightGreen}%` }} />
                <div className="bg-green-600" style={{ width: `${zoneWidths.darkGreen}%` }} />
              </div>

              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                style={{ left: `${Math.max(0, Math.min(100, percentage))}%` }}
              />

              <div
                className="absolute top-0 bottom-0 w-1 bg-blue-600 z-10 shadow-md"
                style={{ left: `${benchmarkPercentage}%` }}
              />
            </div>

            <div
              className="absolute bottom-0 flex flex-col items-center -translate-x-1/2 z-20"
              style={{ left: `${benchmarkPercentage}%` }}
            >
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-600" />
              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                <Target className="h-4 w-4" />
                Avg Internship: {INTERNSHIP_AVG_GPA.toFixed(1)}
              </div>
            </div>
          </div>

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
