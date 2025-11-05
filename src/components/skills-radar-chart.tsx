"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Cpu, Database, Cloud, Award } from "lucide-react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"

interface SkillsRadarChartProps {
  skills: {
    programmingLanguages: string[]
    frameworks: string[]
    databases: string[]
    devops: string[]
    certifications: string[]
  }
}

export function SkillsRadarChart({ skills }: SkillsRadarChartProps) {
  const radarData = [
    { category: "Languages", count: skills.programmingLanguages.length, fullMark: 8 },
    { category: "Frameworks", count: skills.frameworks.length, fullMark: 8 },
    { category: "Databases", count: skills.databases.length, fullMark: 5 },
    { category: "DevOps", count: skills.devops.length, fullMark: 5 },
    { category: "Certifications", count: skills.certifications.length, fullMark: 5 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Portfolio</CardTitle>
        <CardDescription>Your skill depth across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
              <Radar
                name="Your Skills"
                dataKey="count"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 border rounded-lg">
            <Code className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{skills.programmingLanguages.length}</p>
            <p className="text-sm text-muted-foreground">Languages</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Cpu className="h-5 w-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{skills.frameworks.length}</p>
            <p className="text-sm text-muted-foreground">Frameworks</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Database className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{skills.databases.length}</p>
            <p className="text-sm text-muted-foreground">Databases</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Cloud className="h-5 w-5 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{skills.devops.length}</p>
            <p className="text-sm text-muted-foreground">DevOps</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Award className="h-5 w-5 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{skills.certifications.length}</p>
            <p className="text-sm text-muted-foreground">Certifications</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
