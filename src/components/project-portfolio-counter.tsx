import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectPortfolioCounterProps {
  projectCount: number
}

export function ProjectPortfolioCounter({ projectCount }: ProjectPortfolioCounterProps) {
  const getProjectStatus = (count: number) => {
    if (count <= 1) return { 
      status: "Build More", 
      message: "Build more projects to showcase your skills!", 
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-900"
    }
    if (count <= 3) return { 
      status: "Good Portfolio", 
      message: "Good portfolio! Consider adding 1-2 more diverse projects.", 
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-900"
    }
    return { 
      status: "Impressive!", 
      message: "Impressive portfolio! Great demonstration of hands-on experience.", 
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      borderColor: "border-emerald-200 dark:border-emerald-900"
    }
  }

  const status = getProjectStatus(projectCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Portfolio</CardTitle>
        <CardDescription>Your project count and quality indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
              <FolderKanban className="h-16 w-16 text-primary" />
            </div>
            <p className="text-6xl font-bold">{projectCount}</p>
            <p className="text-muted-foreground">Total Projects</p>
          </div>
        </div>

        <div className={cn("p-4 rounded-lg border", status.bgColor, status.borderColor)}>
          <div className="flex items-start gap-3">
            <Star className={cn("h-5 w-5 mt-0.5", status.color)} />
            <div>
              <h4 className={cn("font-semibold", status.color)}>{status.status}</h4>
              <p className="text-sm text-muted-foreground mt-1">{status.message}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: Math.min(projectCount, 8) }).map((_, i) => (
            <div key={i} className="aspect-square bg-primary/20 rounded-lg flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
          ))}
          {projectCount > 8 && (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">+{projectCount - 8}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
