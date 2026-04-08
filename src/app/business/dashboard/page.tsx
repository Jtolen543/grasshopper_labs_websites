"use client"

import { useMemo, useState } from "react"
import { calculateMatchScore, CompanyQuery, StudentProfile } from "@/lib/business-matching"
import { BlindSwipeDeck } from "@/components/business/blind-swipe-deck"
import { PipelineKanban, PipelineCandidate } from "@/components/business/pipeline-kanban"
import { FilterSidebar } from "@/components/business/filter-sidebar"
import { Building2, Search, Settings, Users, Activity, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock Data
const MOCK_COMPANY_QUERY: CompanyQuery = {
  requiredSkills: ["React", "TypeScript", "Next.js"],
  preferredSkills: ["Node.js", "Tailwind CSS"],
  targetRoles: ["Frontend Developer", "Full Stack Developer"],
  minGpa: 3.2,
  targetYearsInSchool: [3, 4], // Juniors and Seniors
  industry: "SaaS",
}

const MOCK_STUDENTS: StudentProfile[] = [
  {
    id: "stu_1",
    major: "Computer Engineering",
    gpa: 3.3,
    yearInSchool: 3, // Junior
    skills: {
      programmingLanguages: ["Python", "C++", "Java", "JavaScript", "HTML/CSS", "HTML", "CSS", "MATLAB", "ARM Assembly", "TypeScript"],
      frameworks: ["React", "Next.js", "Pandas", "Seaborn", "MatPlotLib", "SciKit-learn", "TailwindCSS", "Flask"],
      databases: ["Supabase", "SQL", "PostgreSQL"],
      devops: ["GitHub", "Git", "VS Code", "Vercel"],
    },
    projects: [
      { technologies: ["React", "Next.js", "TailwindCSS", "Flask"], roleCategories: ["Web", "Full Stack"] },
      { technologies: ["Python", "Pandas", "Scikit-learn"], roleCategories: ["Data/ML"] }
    ],
    resumeScore: 92,
    lastActiveDaysAgo: 1, // highly active
    resumeUrl: "/demo_resumes/redacted_stu_1.png",
  },
  {
    id: "stu_2",
    major: "Software Engineering",
    gpa: 3.1, // Below minGPA preference
    yearInSchool: 4, // Senior
    skills: {
      programmingLanguages: ["JavaScript", "Java"],
      frameworks: ["React", "Express"],
      databases: ["MongoDB"],
      devops: ["Docker", "Git"],
    },
    projects: [
      { technologies: ["React", "Node.js"], roleCategories: ["Web", "Backend"] },
    ],
    resumeScore: 75,
    lastActiveDaysAgo: 5,
    resumeUrl: "/demo_resumes/redacted_stu_2.png"
  },
  {
    id: "stu_3",
    major: "Information Technology",
    gpa: 3.9,
    yearInSchool: 2, // Sophomore (not target, but good skills)
    skills: {
      programmingLanguages: ["TypeScript", "JavaScript", "HTML"],
      frameworks: ["React", "Next.js", "Vue"],
      databases: [],
      devops: ["Git"],
    },
    projects: [
      { technologies: ["React"], roleCategories: ["Web"] },
      { technologies: ["Vue"], roleCategories: ["Web"] }
    ],
    resumeScore: 88,
    lastActiveDaysAgo: 2,
  },
   {
    id: "stu_4",
    major: "Data Science",
    gpa: 4.0,
    yearInSchool: 3, // Target
    skills: {
      programmingLanguages: ["Python", "SQL", "R"],
      frameworks: ["Pandas", "TensorFlow"],
      databases: ["PostgreSQL"],
      devops: ["AWS"],
    },
    projects: [
      { technologies: ["Python", "Pandas"], roleCategories: ["Data/ML"] },
    ],
    resumeScore: 95,
    lastActiveDaysAgo: 0,
  }
]

export default function BusinessDashboardPage() {
  const [activeTab, setActiveTab] = useState<"discovery" | "pipeline" | "analytics">("discovery")
  // Add column tracking to the saved candidates state
  const [savedCandidates, setSavedCandidates] = useState<(PipelineCandidate & { column: string })[]>([])
  
  // Track the active Match Strategy Query
  const [activeQuery, setActiveQuery] = useState<CompanyQuery>(MOCK_COMPANY_QUERY)

  const candidates = useMemo(() => {
    return MOCK_STUDENTS.map(profile => {
      const match = calculateMatchScore(activeQuery, profile)
      return { profile, match }
    }).sort((a, b) => b.match.score - a.match.score) // Sort highest to lowest
  }, [activeQuery]) // Recalculate anytime the query changes

  const handleCandidateAction = (candidate: { profile: StudentProfile; match: MatchResult }, action: "pass" | "save", tags: string[], note: string) => {
    if (action === "save") {
      setSavedCandidates(prev => [...prev, { ...candidate, feedback: { tags, note }, column: "shortlisted" }])
    }
  }

  // Handle Drag and Drop
  const handleMoveCandidate = (candidateId: string, newColumn: string) => {
    setSavedCandidates(prev => prev.map(c => 
      c.profile.id === candidateId ? { ...c, column: newColumn } : c
    ))
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Top Navbar specifically for Business */}
      <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-10 w-full shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="bg-primary p-2 flex items-center justify-center rounded-lg">
               <Building2 className="text-primary-foreground h-5 w-5" />
             </div>
             <span className="font-bold text-lg tracking-tight">Acme Corp Portal</span>
          </div>

          <nav className="flex items-center gap-6 hidden md:flex h-full">
             <span 
               onClick={() => setActiveTab("discovery")} 
               className={`text-sm font-medium cursor-pointer transition h-full flex items-center border-b-2 ${activeTab === 'discovery' ? 'text-primary border-primary' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
             >
               Talent Discovery
             </span>
             <span 
               onClick={() => setActiveTab("pipeline")} 
               className={`text-sm font-medium cursor-pointer transition h-full flex items-center border-b-2 ${activeTab === 'pipeline' ? 'text-primary border-primary' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
             >
               Pipeline 
               {savedCandidates.length > 0 && (
                 <Badge variant={activeTab === "pipeline" ? "default" : "secondary"} className="ml-2 px-1.5 py-0 text-[10px]">
                   {savedCandidates.length}
                 </Badge>
               )}
             </span>
             <span 
               onClick={() => setActiveTab("analytics")} 
               className={`text-sm font-medium cursor-pointer transition h-full flex items-center border-b-2 ${activeTab === 'analytics' ? 'text-primary border-primary' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
             >
               Analytics
             </span>
          </nav>

          <div className="flex items-center gap-4">
             <button className="text-muted-foreground hover:text-foreground transition"><Search className="h-5 w-5" /></button>
             <button className="text-muted-foreground hover:text-foreground transition"><Settings className="h-5 w-5" /></button>
             <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        
        {activeTab === "discovery" && (
          <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
             <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0">
               <FilterSidebar 
                 initialQuery={activeQuery}
                 onSearch={(newQuery) => setActiveQuery(prev => ({ ...prev, ...newQuery }))} 
               />
             </aside>
             
             <div className="flex-grow min-w-0 flex flex-col">
                <div className="mb-6 flex flex-col items-center lg:items-start text-center lg:text-left slide-in-from-bottom-2 duration-500">
                   <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Smart Match Discovery</h1>
                   <p className="text-muted-foreground">
                     We're showing you candidates securely scrubbed and matched against your active query for <strong className="text-foreground">Frontend Engineer</strong>.
                   </p>
                </div>

                {/* Swipe Deck */}
                <div className="mb-12 zoom-in-95 duration-500 w-full">
                  <BlindSwipeDeck candidates={candidates} onAction={handleCandidateAction} />
                </div>

                {/* Analytics Mini-Dashboard Below */}
                <div className="grid sm:grid-cols-3 gap-4 xl:gap-6 w-full opacity-70 slide-in-from-bottom-4 duration-700">
                   <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border flex flex-col xl:flex-row items-center xl:items-start gap-4 text-center xl:text-left transition-all">
                      <div className="bg-blue-500/10 p-3 rounded-lg"><Users className="text-blue-500 h-6 w-6" /></div>
                      <div>
                         <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Active Pool</p>
                         <p className="text-2xl font-bold mt-1">1,248</p>
                      </div>
                   </div>
                   
                   <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border flex flex-col xl:flex-row items-center xl:items-start gap-4 text-center xl:text-left transition-all">
                      <div className="bg-green-500/10 p-3 rounded-lg"><Activity className="text-green-500 h-6 w-6" /></div>
                      <div>
                         <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">High Matches</p>
                         <p className="text-2xl font-bold mt-1">24</p>
                      </div>
                   </div>

                   <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border flex flex-col xl:flex-row items-center xl:items-start gap-4 text-center xl:text-left transition-all">
                      <div className="bg-violet-500/10 p-3 rounded-lg"><BarChart3 className="text-violet-500 h-6 w-6" /></div>
                      <div>
                         <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Shortlist Conv.</p>
                         <p className="text-2xl font-bold mt-1">18.5%</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === "pipeline" && (
          <div className="flex-grow flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="mb-6 flex flex-col items-start w-full">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Talent Pipeline</h1>
                <p className="text-muted-foreground max-w-2xl">
                  Review your shortlisted candidates, securely track your feedback, and permanently unblind profiles when you're ready to reach out.
                </p>
             </div>
             
             {savedCandidates.length === 0 ? (
               <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/20 pb-20">
                 <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                 <h3 className="text-xl font-bold mb-2 text-foreground">Your Pipeline is Empty</h3>
                 <p className="text-muted-foreground mb-6 max-w-sm text-center">Head over to Talent Discovery to blindly review and shortlist your first set of candidates!</p>
                 <Button onClick={() => setActiveTab("discovery")}>Start Discovering</Button>
               </div>
             ) : (
               <PipelineKanban candidates={savedCandidates} onMoveCandidate={handleMoveCandidate} />
             )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="flex-grow flex flex-col items-center justify-center opacity-50 pb-20 fade-in zoom-in-95 duration-500">
             <BarChart3 className="h-20 w-20 text-muted-foreground mb-6" />
             <h2 className="text-2xl font-bold">Advanced Analytics</h2>
             <p className="text-muted-foreground mt-2">Coming soon in Phase 2.</p>
          </div>
        )}

      </main>
    </div>
  )
}
