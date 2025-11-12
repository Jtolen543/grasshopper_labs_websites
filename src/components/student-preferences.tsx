"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { CheckCircle } from "lucide-react"

interface StudentPreferencesProps {
  onSubmit: (preferences: StudentPreferences) => void
  onSkip?: () => void
}

export interface StudentPreferences {
  targetRoles: string[]
  targetCompanies: string[]
  technicalInterviewLevel: number
}

const ROLE_OPTIONS = [
  "Software Engineering",
  "Data Science",
  "Data Engineering",
  "Machine Learning Engineering",
  "Frontend Engineering",
  "Backend Engineering",
  "Full Stack Engineering",
  "DevOps/SRE",
  "Security Engineering",
  "Quantitative Research",
  "Quantitative Trading",
  "Software Development",
]

const COMPANY_OPTIONS = [
  // FAANG/Big Tech
  "Google",
  "Meta",
  "Amazon",
  "Apple",
  "Microsoft",
  "Netflix",
  // Other Tech Giants
  "Tesla",
  "NVIDIA",
  "Adobe",
  "Salesforce",
  "Oracle",
  "IBM",
  // Top Startups/Unicorns
  "OpenAI",
  "Stripe",
  "Databricks",
  "Airbnb",
  "Uber",
  "Lyft",
  "Snap",
  "Twitter/X",
  "SpaceX",
  // Quant/Finance
  "Jane Street",
  "Two Sigma",
  "Citadel",
  "Hudson River Trading",
  "Jump Trading",
  "DE Shaw",
  "Bridgewater",
  "Renaissance Technologies",
  "Goldman Sachs",
  "Morgan Stanley",
  "JPMorgan Chase",
  "Bloomberg",
  // Cloud/Infrastructure
  "Snowflake",
  "Cloudflare",
  "MongoDB",
  "Atlassian",
]

export function StudentPreferences({ onSubmit, onSkip }: StudentPreferencesProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [technicalLevel, setTechnicalLevel] = useState<number[]>([5])

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleCompanyToggle = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    )
  }

  const handleSubmit = () => {
    const preferences: StudentPreferences = {
      targetRoles: selectedRoles,
      targetCompanies: selectedCompanies,
      technicalInterviewLevel: technicalLevel[0],
    }
    onSubmit(preferences)
  }

  const isValid = selectedRoles.length > 0 && selectedCompanies.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Student Preferences
        </CardTitle>
        <CardDescription>
          Help us understand your career goals and technical readiness
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Roles Section */}
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-base mb-1">Target Roles</h4>
            <p className="text-sm text-muted-foreground">Select all roles you&apos;re interested in</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 border rounded-lg bg-muted/20">
            {ROLE_OPTIONS.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role}`}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => handleRoleToggle(role)}
                />
                <label
                  htmlFor={`role-${role}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {role}
                </label>
              </div>
            ))}
          </div>
          {selectedRoles.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {selectedRoles.length} role{selectedRoles.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Target Companies Section */}
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-base mb-1">Target Companies</h4>
            <p className="text-sm text-muted-foreground">Select all companies you&apos;re interested in</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 border rounded-lg bg-muted/20">
            {COMPANY_OPTIONS.map((company) => (
              <div key={company} className="flex items-center space-x-2">
                <Checkbox
                  id={`company-${company}`}
                  checked={selectedCompanies.includes(company)}
                  onCheckedChange={() => handleCompanyToggle(company)}
                />
                <label
                  htmlFor={`company-${company}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {company}
                </label>
              </div>
            ))}
          </div>
          {selectedCompanies.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {selectedCompanies.length} compan{selectedCompanies.length !== 1 ? "ies" : "y"}
            </p>
          )}
        </div>

        {/* Technical Interview Comfort Level */}
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-base mb-1">
              Technical Interview Comfort Level
            </h4>
            <p className="text-sm text-muted-foreground">
              Rate your comfort with LeetCode/technical interviews (1 = Beginner, 10 = Expert)
            </p>
          </div>
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <Slider
              min={1}
              max={10}
              step={1}
              value={technicalLevel}
              onValueChange={setTechnicalLevel}
              className="w-full"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Beginner</span>
              <span className="text-2xl font-bold text-primary">{technicalLevel[0]}</span>
              <span className="text-sm text-muted-foreground">Expert</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid}
            className="flex-1"
          >
            Save Preferences
          </Button>
          {onSkip && (
            <Button 
              onClick={onSkip} 
              variant="outline"
              className="flex-1"
            >
              Skip for Now
            </Button>
          )}
        </div>

        {!isValid && (selectedRoles.length === 0 || selectedCompanies.length === 0) && (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Please select at least one role and one company to continue
          </p>
        )}
      </CardContent>
    </Card>
  )
}
