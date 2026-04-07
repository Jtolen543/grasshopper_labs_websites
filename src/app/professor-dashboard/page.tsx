"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, BarChart3, BookOpen, BrainCircuit, Briefcase, GraduationCap, LineChart, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock Data
const courses = [
  { id: "COP3502", name: "Programming Fundamentals 1", students: 185 },
  { id: "COP3530", name: "Data Structures and Algorithms", students: 110 },
  { id: "CEN3031", name: "Software Engineering", students: 47 },
]

const skillGaps = [
  { skill: "Cloud Platforms (AWS/Azure)", industryDemand: 82, studentProficiency: 14, criticality: "high" },
  { skill: "CI/CD Deployment", industryDemand: 75, studentProficiency: 18, criticality: "high" },
  { skill: "System Design", industryDemand: 68, studentProficiency: 22, criticality: "high" },
  { skill: "React.js / Next.js", industryDemand: 60, studentProficiency: 35, criticality: "medium" },
  { skill: "Python", industryDemand: 85, studentProficiency: 78, criticality: "low" },
  { skill: "Java / C++", industryDemand: 70, studentProficiency: 82, criticality: "low" },
]

const careerTargets = [
  { role: "Software Engineer", percentage: 65 },
  { role: "Data Scientist / ML", percentage: 20 },
  { role: "Product Manager", percentage: 8 },
  { role: "Cybersecurity Analyst", percentage: 5 },
  { role: "Other", percentage: 2 },
]

export default function ProfessorDashboard() {
  const [activeCourse, setActiveCourse] = useState(courses[0].id)

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                <BrainCircuit className="h-3 w-3 mr-1" /> AI Intel Verified
              </Badge>
              <Badge variant="outline" className="border-border">
                Fall 2026 Cohort
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-mono tracking-tight flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              Faculty Insights
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Real-time telemetry on student preparedness based on AI resume parsing compared against live industry demands.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-card border rounded-lg p-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              AK
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Dr. Amanpreet Kapoor</p>
              <p className="text-xs text-muted-foreground mt-1">CISE Department</p>
            </div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students Tracked</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last semester</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Industry Readiness</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">41%</div>
              <p className="text-xs text-muted-foreground mt-1 text-emerald-500">Avg. Match Score to Target</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-destructive/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Critical Skill Gap</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">Cloud (AWS/Azure)</div>
              <p className="text-xs text-muted-foreground mt-1 text-destructive/80">82% Demand vs 14% Proficiency</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Target Role</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Software Engineer</div>
              <p className="text-xs text-muted-foreground mt-1">65% of cohort</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px] mb-8">
            <TabsTrigger value="courses">Your Courses</TabsTrigger>
            <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
            <TabsTrigger value="market">Market Targets</TabsTrigger>
          </TabsList>

          {/* Courses Content */}
          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Curriculum Active
                </h3>
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setActiveCourse(course.id)}
                    className={cn(
                      "w-full text-left px-4 py-4 rounded-xl border transition-all text-sm",
                      activeCourse === course.id 
                        ? "bg-primary/10 border-primary/50 text-foreground font-medium shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)] ring-1 ring-primary/20" 
                        : "bg-card border-border/50 text-muted-foreground hover:bg-muted/50 hover:border-border"
                    )}
                  >
                    <div className={cn("font-bold font-mono mb-1", activeCourse === course.id ? "text-primary" : "")}>{course.id}</div>
                    <div className="line-clamp-1">{course.name}</div>
                    <div className="text-xs mt-3 bg-background/50 px-2 py-1 rounded inline-flex items-center gap-1.5 opacity-80 border">
                      <Users className="h-3 w-3" /> {course.students} Resumes Analyzed
                    </div>
                  </button>
                ))}
              </div>
              <div>
                <Card className="border-border/50 h-full shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Course Specific Recommendations: {activeCourse}
                    </CardTitle>
                    <CardDescription className="text-base">
                      Suggested curriculum tweaks based on the semantic resume scans of {courses.find(c => c.id === activeCourse)?.students} students actively enrolled in this class.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-2">
                    <div className="grid gap-4">
                      <div className="p-5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                        <h4 className="font-semibold text-emerald-500 mb-2 flex items-center gap-2 text-lg">
                          <TrendingUp className="h-5 w-5" /> Curriculum Success
                        </h4>
                        <p className="text-sm text-foreground/80 leading-relaxed md:text-base">
                          Students in this course demonstrated a <b>40% increase</b> in algorithmic problem-solving terminology (e.g. "time-complexity", "Big-O", "optimization") compared to their pre-course baseline. They are highly competitive for algorithmic interview rounds.
                        </p>
                      </div>

                      <div className="p-5 rounded-lg bg-gradient-to-r from-destructive/10 to-transparent border border-destructive/20">
                        <h4 className="font-semibold text-destructive mb-3 flex items-center gap-2 text-lg">
                          <AlertCircle className="h-5 w-5" /> Recommended Module Adjustments
                        </h4>
                        <ul className="list-disc pl-5 space-y-3 text-sm md:text-base text-foreground/80 marker:text-destructive">
                          <li><strong className="text-foreground">Incorporate Git Workflows:</strong> 60% of students in {activeCourse} do not mention version control on their resumes, which is required by 95% of SWE internships. <em>Recommendation: Make assignment submissions via GitHub pull requests mandatory.</em></li>
                          <li><strong className="text-foreground">Cloud Context:</strong> Add a brief 1-week module on deploying code to a lightweight cloud provider (e.g., Vercel, Heroku, AWS EC2) as 82% of target jobs demand deployment basics. Currently, students list 0% proficiency here.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Skill Gaps Content */}
          <TabsContent value="gaps" className="space-y-4">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Cohort Aggregate Skill Gap Analysis
                </CardTitle>
                <CardDescription>
                  Comparing what current internship descriptions require vs. what all your students have successfully demonstrated on their parsed resumes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-10">
                  {skillGaps.map((gap, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold flex items-center gap-2 text-base">
                          {gap.skill}
                          {gap.criticality === "high" && <Badge variant="destructive" className="h-5 text-[10px] uppercase px-2">Critical Gap</Badge>}
                          {gap.criticality === "medium" && <Badge variant="outline" className="border-amber-500/50 text-amber-500 h-5 text-[10px] uppercase px-2 bg-amber-500/10">Warning</Badge>}
                        </span>
                        <span className="text-muted-foreground text-xs font-mono">DELTA: {gap.industryDemand - gap.studentProficiency}%</span>
                      </div>
                      
                      <div className="grid grid-cols-[130px_1fr] md:grid-cols-[180px_1fr] gap-4 items-center">
                        <span className="text-xs text-muted-foreground">Industry Demand ({gap.industryDemand}%)</span>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/40 transition-all" style={{ width: `${gap.industryDemand}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-[130px_1fr] md:grid-cols-[180px_1fr] gap-4 items-center">
                        <span className="text-xs text-muted-foreground">Student Mastery ({gap.studentProficiency}%)</span>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all",
                              gap.criticality === "high" ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                              gap.criticality === "medium" ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-emerald-500"
                            )} 
                            style={{ width: `${gap.studentProficiency}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Targets */}
          <TabsContent value="market">
             <Card className="border-border/50 shadow-lg max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Cohort Target Careers
                </CardTitle>
                <CardDescription>
                  Distribution of intended career outcomes based on resume objectives and semantic analysis of uploaded data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 pt-2">
                  {careerTargets.map((target, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-base">{target.role}</span>
                        <span className="text-muted-foreground font-mono">{target.percentage}%</span>
                      </div>
                      <Progress value={target.percentage} className="h-3 bg-muted" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}
