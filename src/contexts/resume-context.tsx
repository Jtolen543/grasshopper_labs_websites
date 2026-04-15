"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Resume } from "@/app/api/parse/resumeSchema"

interface ResumeSubmission {
  id: string
  fileName: string
  s3Key: string
  uploadedAt: string
  score: number
  isStarred?: boolean
}

interface XYZFeedbackItem {
  score: number
  xyz_analysis: string
  improvements: string[]
}

interface XYZFeedbackData {
  projects: Record<number, XYZFeedbackItem>
  experience: Record<number, XYZFeedbackItem>
  actionableInsights?: ActionableInsight[]
}

interface ActionableInsight {
  id: string
  category: string
  insight: string
  priority: "high" | "medium" | "low"
  checked: boolean
  type?: "tweak" | "goal"
  targetYear?: number
}

interface ResumeContextType {
  resumeData: Resume | null
  setResumeData: (data: Resume | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  refreshResumeData: () => Promise<void>
  currentFileName: string | null
  setCurrentFileName: (name: string | null) => void
  xyzFeedback: XYZFeedbackData | null
  actionableInsights: ActionableInsight[]
  showFeedback: boolean
  toggleFeedback: () => void
  addXp: (amount: number) => void
  setCharacterClass: (c: string) => void
  debugSetLevel: (level: number) => void
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

function calculateYearsRemaining(endDate?: string, startDate?: string): number {
  const now = new Date()

  if (!endDate) {
    // No end date — assume 4 years remaining
    if (startDate) {
      const start = new Date(startDate)
      const monthsSinceStart = (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth())
      return Math.max(1, 4 - Math.floor(monthsSinceStart / 12))
    }
    return 4
  }

  const gradDate = new Date(endDate)

  // Already graduated
  if (gradDate < now) return 1

  // Calculate years remaining from now to graduation
  const msRemaining = gradDate.getTime() - now.getTime()
  const yearsRemaining = Math.ceil(msRemaining / (365.25 * 24 * 60 * 60 * 1000))

  return Math.max(1, yearsRemaining) // at least 1
}

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<Resume | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)
  const [xyzFeedback, setXyzFeedback] = useState<XYZFeedbackData | null>(null)
  const [actionableInsights, setActionableInsights] = useState<ActionableInsight[]>([])
  const [showFeedback, setShowFeedback] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("showAiFeedback")
      return stored !== null ? stored === "true" : true // default to true
    }
    return true
  })

  const toggleFeedback = () => {
    setShowFeedback(prev => {
      const next = !prev
      if (typeof window !== "undefined") {
        localStorage.setItem("showAiFeedback", String(next))
      }
      return next
    })
  }

  // Load resume data from JSON file on mount
  const loadResumeData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/resume")
      if (response.status === 401) {
        setResumeData(null)
        return
      }
      const result = await response.json()

      if (result.success && result.data) {
        setResumeData(result.data)
        console.log("Resume data loaded from cloud storage:", result.data)
      } else {
        setResumeData(null)
        console.log("No resume data found for this user")
      }

      // Also fetch the most recent submission to get filename
      const submissionsResponse = await fetch("/api/resume-submissions")
      if (submissionsResponse.ok) {
        const submissionsResult = await submissionsResponse.json()
        if (submissionsResult.success && submissionsResult.data?.length > 0) {
          // Get the most recent submission (first one since sorted by date desc)
          setCurrentFileName(submissionsResult.data[0].fileName)
        }
      }

      // Load cached XYZ feedback
      try {
        const feedbackResponse = await fetch("/api/analyze/xyz-batch")
        if (feedbackResponse.ok) {
          const feedbackResult = await feedbackResponse.json()
          if (feedbackResult.success && feedbackResult.data) {
            setXyzFeedback(feedbackResult.data)
            if (feedbackResult.data.actionableInsights) {
              setActionableInsights(feedbackResult.data.actionableInsights)
            } else {
              setActionableInsights([])
            }
          } else {
            setXyzFeedback(null)
            setActionableInsights([])
            if (result.success && result.data) {
              generateXyzFeedback(result.data)
            }
          }
        } else {
          setXyzFeedback(null)
          setActionableInsights([])
          if (result.success && result.data) {
            generateXyzFeedback(result.data)
          }
        }
      } catch {
        // No cached feedback found — auto-generate if resume data exists
        setXyzFeedback(null)
        setActionableInsights([])
        if (result.success && result.data) {
          generateXyzFeedback(result.data)
        }
      }
    } catch (error) {
      console.error("Error loading resume data:", error)
      setResumeData(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-generate XYZ feedback when none is cached
  const generateXyzFeedback = async (data: Resume) => {
    try {
      // Compute yearInSchool from the resume education data
      const yearsRemaining = calculateYearsRemaining(
        data.education?.[0]?.end_date,
        data.education?.[0]?.start_date
      )

      // Fetch survey/questionnaire preferences
      let preferences = null
      try {
        const prefResponse = await fetch("/api/preferences")
        if (prefResponse.ok) {
          const prefResult = await prefResponse.json()
          if (prefResult.success && prefResult.data) {
            preferences = prefResult.data
          }
        }
      } catch {
        // Preferences not available — insights will still generate without them
      }

      const response = await fetch("/api/analyze/xyz-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: data, yearInSchool: yearsRemaining, preferences }),
      })
      const result = await response.json()
      if (result.success && result.data) {
        setXyzFeedback(result.data)
        if (result.data.actionableInsights) {
          setActionableInsights(result.data.actionableInsights)
        }
      }
    } catch (error) {
      console.error("Error generating XYZ feedback:", error)
    }
  }

  // Load on mount
  useEffect(() => {
    loadResumeData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        isLoading,
        setIsLoading,
        refreshResumeData: loadResumeData,
        currentFileName,
        setCurrentFileName,
        xyzFeedback,
        actionableInsights,
        showFeedback,
        toggleFeedback,
        addXp: () => {},
        setCharacterClass: () => {},
        debugSetLevel: () => {},
      }}
    >
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const context = useContext(ResumeContext)
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider")
  }
  return context
}
