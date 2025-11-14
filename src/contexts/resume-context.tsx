"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Resume } from "@/app/api/parse/resumeSchema"

interface ResumeContextType {
  resumeData: Resume | null
  setResumeData: (data: Resume | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  refreshResumeData: () => Promise<void>
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<Resume | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    } catch (error) {
      console.error("Error loading resume data:", error)
      setResumeData(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Load on mount
  useEffect(() => {
    loadResumeData()
  }, [])

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        isLoading,
        setIsLoading,
        refreshResumeData: loadResumeData,
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
