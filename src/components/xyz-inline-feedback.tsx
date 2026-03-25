"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Wand2, ChevronDown, ChevronRight } from "lucide-react"

export function getXYZScoreColor(score: number) {
    if (score >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
    if (score >= 60) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800"
    if (score >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800"
    if (score >= 20) return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800"
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
}

interface XYZFeedback {
    score: number
    xyz_analysis: string
    improvements: string[]
}

interface XYZInlineFeedbackProps {
    feedback?: XYZFeedback | null
}

export function XYZInlineFeedback({ feedback }: XYZInlineFeedbackProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (!feedback) return null

    return (
        <div className="mt-2 border rounded-lg overflow-hidden bg-muted/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
                type="button"
            >
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Wand2 className="h-3 w-3" />
                    XYZ Formula Analysis
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>

            {isOpen && (
                <div className="p-3 border-t bg-muted/5 space-y-2">
                    <p className="text-xs text-muted-foreground">{feedback.xyz_analysis}</p>
                    {feedback.improvements.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-xs font-medium">Suggestions:</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                                {feedback.improvements.map((imp, i) => (
                                    <li key={i} className="text-xs text-muted-foreground">{imp}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
