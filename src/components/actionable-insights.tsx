"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Lightbulb, Save, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ActionableInsight {
    id: string
    category: string
    insight: string
    priority: "high" | "low"
    checked: boolean
}

interface ActionableInsightsProps {
    insights: ActionableInsight[]
    onInsightsChange?: (insights: ActionableInsight[]) => void
}

export function ActionableInsights({ insights: initialInsights, onInsightsChange }: ActionableInsightsProps) {
    const [insights, setInsights] = useState<ActionableInsight[]>(initialInsights)
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

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
        } catch (error) {
            toast.error("Failed to save progress", {
                description: "Please try again",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const completedCount = insights.filter(i => i.checked).length
    const totalCount = insights.length
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    const highPriority = insights.filter(i => i.priority === "high")
    const lowPriority = insights.filter(i => i.priority === "low")

    const renderInsightItem = (insight: ActionableInsight) => {
        return (
            <div
                key={insight.id}
                className={cn(
                    "flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
                    insight.checked
                        ? "bg-muted/20 opacity-50"
                        : "bg-muted/30 hover:bg-muted/50"
                )}
            >
                <Checkbox
                    id={insight.id}
                    checked={insight.checked}
                    onCheckedChange={() => handleToggle(insight.id)}
                    className="mt-0.5"
                />
                <label
                    htmlFor={insight.id}
                    className={cn(
                        "text-sm cursor-pointer block flex-1 leading-relaxed",
                        insight.checked && "line-through text-muted-foreground"
                    )}
                >
                    {insight.insight}
                </label>
            </div>
        )
    }

    if (insights.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Insights
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
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Insights
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

                {/* Gradient progress bar */}
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-3">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progressPercent}%`,
                            background: "linear-gradient(90deg, oklch(0.55 0.22 264), oklch(0.60 0.24 303), oklch(0.65 0.22 330))",
                        }}
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {highPriority.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            High Priority · {highPriority.filter(i => !i.checked).length} remaining
                        </h4>
                        <div className="space-y-1.5">
                            {highPriority.map(renderInsightItem)}
                        </div>
                    </div>
                )}

                {lowPriority.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Lightbulb className="h-3 w-3 text-green-500" />
                            Nice to Have · {lowPriority.filter(i => !i.checked).length} remaining
                        </h4>
                        <div className="space-y-1.5">
                            {lowPriority.map(renderInsightItem)}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
