import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface InternshipCounterProps {
  internshipCount: number
}

export function InternshipCounter({ internshipCount }: InternshipCounterProps) {
  const getInternshipStatus = (count: number) => {
    if (count === 0) return {
      message: "No worries! Everyone starts somewhere. We'll help you land your first opportunity!",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-900",
      icon: Briefcase
    }
    if (count === 1) return {
      message: "Great start! Previous experience makes future opportunities easier to secure.",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-900",
      icon: Briefcase
    }
    return {
      message: "Excellent position! You're highly competitive for top roles.",
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-900",
      icon: Star
    }
  }

  const status = getInternshipStatus(internshipCount)
  const Icon = status.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internship Experience</CardTitle>
        <CardDescription>Your previous internship count</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
              <Icon className="h-16 w-16 text-primary" />
            </div>
            <p className="text-6xl font-bold">{internshipCount}</p>
            <p className="text-muted-foreground">
              {internshipCount === 1 ? "Internship" : "Internships"}
            </p>
          </div>
        </div>

        <div className={cn("p-4 rounded-lg border", status.bgColor, status.borderColor)}>
          <p className={cn("text-sm font-medium", status.color)}>{status.message}</p>
        </div>

        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.max(internshipCount, 3) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                i < internshipCount ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <Briefcase className="h-6 w-6" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
