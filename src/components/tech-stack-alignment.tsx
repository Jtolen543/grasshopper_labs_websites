import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function TechStackAlignment() {
  const stackData = [
    { sector: "Full Stack Dev", match: 8, total: 12, percentage: 67 },
    { sector: "Frontend Dev", match: 10, total: 12, percentage: 83 },
    { sector: "AI/ML", match: 3, total: 10, percentage: 30 },
    { sector: "Cloud Computing", match: 2, total: 10, percentage: 20 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology Stack Alignment</CardTitle>
        <CardDescription>Match between your skills and target tech sectors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {stackData.map((stack) => (
          <div key={stack.sector} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{stack.sector}</p>
                <p className="text-sm text-muted-foreground">
                  {stack.match}/{stack.total} relevant skills ({stack.percentage}%)
                </p>
              </div>
              <Badge
                variant={stack.percentage >= 70 ? "default" : stack.percentage >= 50 ? "secondary" : "outline"}
              >
                {stack.percentage}%
              </Badge>
            </div>
            <div className="relative h-3 w-full rounded-full overflow-hidden bg-muted">
              <div
                className={cn(
                  "h-full transition-all",
                  stack.percentage >= 70 ? "bg-green-500" : stack.percentage >= 50 ? "bg-yellow-500" : "bg-orange-500"
                )}
                style={{ width: `${stack.percentage}%` }}
              />
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Top Skills to Learn:</h4>
          <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>• AWS/Azure basics (for Cloud Computing)</li>
            <li>• TensorFlow or PyTorch (for AI/ML)</li>
            <li>• Docker & Kubernetes (for DevOps)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
