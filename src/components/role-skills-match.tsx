"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export function RoleSkillsMatch() {
  const roleData = [
    { role: "Full Stack Dev", match: 70, skills: "7/10 skills", color: "#10b981" },
    { role: "Frontend Dev", match: 85, skills: "9/10 skills", color: "#3b82f6" },
    { role: "Backend Dev", match: 60, skills: "6/10 skills", color: "#f59e0b" },
  ]

  const COLORS = roleData.map(r => r.color)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role-Relevant Skills Match</CardTitle>
        <CardDescription>Based on your target roles from the questionnaire</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="match"
                  label={(entry) => `${entry.match}%`}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {roleData.map((role, index) => (
              <div key={role.role} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="font-semibold">{role.role}</span>
                  </div>
                  <Badge>{role.match}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground pl-5">{role.skills}</p>
                <div className="relative h-2 w-full rounded-full overflow-hidden bg-muted pl-5">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${role.match}%`, backgroundColor: COLORS[index] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
