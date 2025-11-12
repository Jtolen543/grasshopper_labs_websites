"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

// CS Course Categories with courses
const coursesByCategory: Record<string, Record<string, number>> = {
  "Core CS": {
    "Data Structures": 90,
    "Algorithms": 85,
    "Operating Systems": 75,
    "Computer Architecture": 70,
  },
  "Software Engineering": {
    "Software Engineering": 85,
    "Web Development": 80,
    "Mobile Development": 65,
    "DevOps": 70,
  },
  "AI & Machine Learning": {
    "Machine Learning": 50,
    "Deep Learning": 40,
    "Natural Language Processing": 45,
    "Computer Vision": 35,
  },
  "Systems & Hardware": {
    "Computer Networks": 60,
    "Embedded Systems": 55,
    "Microprocessors": 30,
    "Digital Logic": 65,
  },
  "Data & Databases": {
    "Database Systems": 75,
    "Data Mining": 60,
    "Big Data": 50,
    "Cloud Computing": 65,
  },
  "Security & Privacy": {
    "Cybersecurity": 55,
    "Cryptography": 45,
    "Network Security": 50,
    "Privacy Engineering": 40,
  },
  "Graphics & Media": {
    "Computer Graphics": 60,
    "XR Development": 40,
    "Game Development": 55,
    "UI/UX Design": 70,
  },
  "Theory & Math": {
    "Theory of Computation": 70,
    "Discrete Math": 85,
    "Linear Algebra": 75,
    "Probability & Statistics": 80,
  },
}

// Calculate category averages for radar chart
const categoryRadarData = Object.entries(coursesByCategory).map(([category, courses]) => {
  const scores = Object.values(courses)
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return { category, average }
})

export function CareerPathCourseworkChart() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Get courses for selected category
  const getCoursesForCategory = (category: string) => {
    return coursesByCategory[category] || {}
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coursework by CS Category</CardTitle>
        <CardDescription>
          Click on a category to see your course completion in that area
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Top: Category buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-lg border-2 transition-all font-medium",
                selectedCategory === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50"
              )}
            >
              All Categories
            </button>
            {Object.keys(coursesByCategory).map((category) => {
              const courses = coursesByCategory[category]
              const scores = Object.values(courses)
              const avgScore = (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(0)
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all font-medium flex items-center gap-2",
                    selectedCategory === category
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  {category}
                  <Badge variant={selectedCategory === category ? "outline" : "secondary"} className={selectedCategory === category ? "bg-primary-foreground text-primary" : ""}>
                    {avgScore}%
                  </Badge>
                </button>
              )
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Radar chart showing all 8 categories */}
            <div className="flex-1 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Category Average"
                    dataKey="average"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.4}
                  />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Course list filtered by category */}
            <div className="flex-1 space-y-3 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-background z-10 pb-2">
                {selectedCategory 
                  ? `${selectedCategory} Courses` 
                  : "All Courses"}
              </h3>
              
              {selectedCategory ? (
                // Show courses for selected category
                <>
                  {Object.entries(getCoursesForCategory(selectedCategory)).map(([course, completion]) => {
                    return (
                      <div
                        key={course}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                          completion >= 70 ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
                        )}
                      >
                        <span className="font-medium">{course}</span>
                        <Badge variant={completion >= 70 ? "default" : "secondary"}>
                          {completion}%
                        </Badge>
                      </div>
                    )
                  })}
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Category average:{" "}
                      <span className="font-bold text-foreground">
                        {categoryRadarData.find(c => c.category === selectedCategory)?.average.toFixed(1)}%
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                // Show all courses grouped by category
                <>
                  {Object.entries(coursesByCategory).map(([category, courses]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h4>
                      <div className="space-y-2">
                        {Object.entries(courses).map(([course, completion]) => (
                          <div
                            key={course}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-lg border transition-all",
                              completion >= 70 ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/10" : "border-orange-400/50 bg-orange-50/50 dark:bg-orange-950/10"
                            )}
                          >
                            <span className="font-medium text-sm">{course}</span>
                            <Badge variant={completion >= 70 ? "default" : "secondary"} className="text-xs">
                              {completion}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
