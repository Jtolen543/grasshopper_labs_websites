"use client"

import { useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X, Heart, ShieldAlert, GraduationCap, Briefcase, Code, Check, FileText, FileSearch, Maximize2 } from "lucide-react"
import { RecruiterFeedbackModal } from "./recruiter-feedback-modal"
import { StudentProfile, MatchResult } from "@/lib/business-matching"

interface SwipeDeckProps {
  candidates: { profile: StudentProfile; match: MatchResult }[]
  onAction?: (candidate: { profile: StudentProfile; match: MatchResult }, action: "pass" | "save", tags: string[], note: string) => void
}

// Reusable component so we can render it in the Tab and in the Fullscreen Modal
function RedactedImageViewer({ url, isFullscreen = false }: { url: string, isFullscreen?: boolean }) {
  return (
    <div className={`w-full relative shadow-inner isolate bg-zinc-200/50 flex flex-col ${isFullscreen ? 'h-full' : 'h-[600px]'}`}>
      <div className="flex-grow overflow-y-auto w-full flex justify-center p-4">
        <div className={`relative bg-white shadow-xl ${isFullscreen ? 'w-full max-w-4xl' : 'w-full'} aspect-[8.5/11]`}>
          
          {/* Security Indicator */}
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <Badge variant="destructive" className="animate-pulse shadow-xl shadow-red-500/20 opacity-90 font-bold tracking-wider uppercase">Backend PII Scrubbed</Badge>
          </div>

          <img 
            src={url}
            alt="Anonymized Resume"
            className="w-full h-full object-contain absolute inset-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}

export function BlindSwipeDeck({ candidates, onAction }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<"pass" | "save" | null>(null)

  if (currentIndex >= candidates.length) {
    return (
      <Card className="w-full max-w-4xl mx-auto h-[400px] flex flex-col items-center justify-center text-center p-8 shadow-xl border-primary/20">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl mb-2">You're All Caught Up!</CardTitle>
        <p className="text-muted-foreground max-w-md">
          We've run out of new candidates matching your query right now. Check back later or adjust your filters.
        </p>
        <div className="mt-8">
          <Button variant="outline" onClick={() => setCurrentIndex(0)}>Start Over</Button>
        </div>
      </Card>
    )
  }

  const currentCandidate = candidates[currentIndex]

  const handleActionClick = (action: "pass" | "save") => {
    setCurrentAction(action)
    setModalOpen(true)
  }

  const handleFeedbackSubmit = (tags: string[], note: string) => {
    if (onAction && currentAction) {
      onAction(currentCandidate, currentAction, tags, note)
    }
    setModalOpen(false)
    setCurrentIndex(prev => prev + 1)
  }

  const getYearLabel = (year: number) => {
    const labels = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]
    return labels[year - 1] || "Student"
  }

  return (
    <div className="w-full max-w-6xl mx-auto relative min-h-[750px] flex">
      <Card className="flex flex-col md:flex-row w-full overflow-hidden shadow-2xl border-border dark:bg-zinc-950">
        
        {/* Left Column: Quick Stats & Actions */}
        <div className="w-full md:w-1/3 border-r bg-muted/20 flex flex-col relative shrink-0">
          
          {/* Top Info */}
          <div className="p-6 border-b bg-background/50">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded-sm">
                <ShieldAlert className="h-3.5 w-3.5" /> Blind Mode
              </span>
              <Badge variant="outline" className="border-primary/50 text-foreground">Id: {currentCandidate.profile.id.toUpperCase()}</Badge>
            </div>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-primary/10 border-2 border-primary text-primary px-6 py-4 rounded-3xl font-bold text-5xl shadow-sm mb-6 w-full flex flex-col justify-center items-center">
                {currentCandidate.match.score}% 
                <span className="text-[10px] text-primary/80 mt-2 uppercase tracking-widest font-bold">Match Score</span>
              </div>
              
              <div className="h-8 w-full max-w-[180px] bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse relative overflow-hidden group mb-4">
                 <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                   Name Redacted
                 </div>
              </div>

              <div className="flex flex-col gap-2 text-sm text-foreground font-medium items-center w-full">
                <div className="flex items-center gap-2 bg-background w-full justify-center py-2.5 rounded-md border shadow-sm"><GraduationCap className="h-4 w-4 text-primary" /> {getYearLabel(currentCandidate.profile.yearInSchool)}</div>
                <div className="flex items-center gap-2 bg-background w-full justify-center py-2.5 rounded-md border shadow-sm"><Briefcase className="h-4 w-4 text-primary" /> {currentCandidate.profile.major}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-grow flex flex-col justify-end p-6 bg-background/30 gap-4">
             <Button 
               variant="outline" 
               size="lg" 
               className="h-14 w-full rounded-xl border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
               onClick={() => handleActionClick("pass")}
             >
               <X className="h-5 w-5 mr-2" />
               Pass Candidate
             </Button>

             <Button 
               size="lg" 
               className="h-16 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20 transition-all border-0 text-lg"
               onClick={() => handleActionClick("save")}
             >
               <Heart className="h-6 w-6 mr-2 fill-white/20" />
               Shortlist
             </Button>
          </div>
        </div>

        {/* Right Column: Evidence & Details Tabs */}
        <div className="w-full md:w-2/3 flex flex-col overflow-hidden bg-background">
          <Tabs defaultValue="parsed" className="h-full flex flex-col">
            
            <div className="px-8 pt-6 border-b pb-4 mb-0 flex items-center justify-between">
               <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                 <FileText className="h-6 w-6 text-primary" /> Candidate File
               </h2>
               <TabsList className="grid w-64 grid-cols-2 shadow-sm">
                 <TabsTrigger value="parsed" className="flex gap-2 text-xs font-semibold uppercase tracking-wider"><FileText className="h-3.5 w-3.5" /> Overview</TabsTrigger>
                 <TabsTrigger value="resume" className="flex gap-2 text-xs font-semibold uppercase tracking-wider"><FileSearch className="h-3.5 w-3.5" /> Document</TabsTrigger>
               </TabsList>
            </div>

            <div className="flex-grow overflow-y-auto w-full h-[600px] md:h-auto">
              
              {/* Parsed Overview Tab */}
              <TabsContent value="parsed" className="p-8 space-y-8 m-0 outline-none h-full overflow-y-auto">
                {/* Match Highlight */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex gap-5 items-start">
                   <div className="bg-green-500 rounded-full p-2 min-w-fit shadow-sm">
                      <Check className="h-5 w-5 text-white" />
                   </div>
                   <div>
                     <h4 className="font-semibold text-green-700 dark:text-green-500 text-lg mb-2">Why they're a {currentCandidate.match.score > 90 ? "top " : ""}match:</h4>
                     <p className="text-green-800/80 dark:text-green-400/90 leading-relaxed">
                       Strong alignment in <span className="font-semibold text-green-900 dark:text-green-300">{currentCandidate.match.topMatchingSkills.join(", ")}</span>. 
                       Their academic background aligns with your requirements, and their project portfolio is highly relevant ({currentCandidate.profile.projects.length} relevant projects).
                     </p>
                   </div>
                </div>

                {/* Skills grid */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-lg border-b pb-3 text-foreground">
                    <Code className="h-5 w-5 text-primary" /> Validated Skills
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8 pt-3">
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mb-4 block">Languages</span>
                      <div className="flex flex-wrap gap-2.5">
                        {currentCandidate.profile.skills.programmingLanguages.map(s => (
                          <Badge key={s} variant={currentCandidate.match.topMatchingSkills.includes(s) ? "default" : "secondary"} className="px-3 py-1.5 text-xs shadow-sm">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mb-4 block">Frameworks</span>
                      <div className="flex flex-wrap gap-2.5">
                        {currentCandidate.profile.skills.frameworks.map(s => (
                          <Badge key={s} variant={currentCandidate.match.topMatchingSkills.includes(s) ? "default" : "secondary"} className="px-3 py-1.5 text-xs shadow-sm">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projects */}
                <div className="space-y-4 pt-6">
                   <h3 className="font-semibold text-lg border-b pb-3 text-foreground">Projects Snapshot</h3>
                   <div className="grid md:grid-cols-2 gap-5 pt-3">
                     {currentCandidate.profile.projects.map((p, i) => (
                       <div key={i} className="bg-muted/30 p-5 rounded-xl border flex flex-col justify-between shadow-sm">
                         <div>
                           <div className="font-bold text-md mb-1 text-foreground">Project {i + 1}</div>
                           <div className="text-primary/80 text-[10px] font-bold uppercase tracking-widest mb-4">
                             {p.roleCategories.join(", ")}
                           </div>
                         </div>
                         <div className="flex gap-2 flex-wrap">
                           {p.technologies.map(t => (
                             <span key={t} className="bg-background px-2.5 py-1.5 rounded-md border text-xs font-semibold text-foreground shadow-sm">{t}</span>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </TabsContent>

              {/* Original Document Tab with Rendered Image Layer */}
              <TabsContent value="resume" className="h-full m-0 outline-none flex flex-col relative">
                {currentCandidate.profile.resumeUrl ? (
                  <>
                    <div className="bg-muted p-2 flex justify-end border-b">
                       <Button variant="outline" size="sm" onClick={() => setFullscreenOpen(true)} className="h-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">
                         <Maximize2 className="h-4 w-4 mr-2 text-primary" /> Full Screen
                       </Button>
                    </div>
                    <RedactedImageViewer url={currentCandidate.profile.resumeUrl} />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-10 m-8 max-w-sm mx-auto self-center">
                     <p>No original document available for this candidate.</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 flex flex-col overflow-hidden bg-muted/20 border-border">
           <div className="p-4 border-b bg-background flex items-center justify-between shadow-sm pr-12">
             <div className="flex items-center gap-3">
                <FileSearch className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-lg">Candidate Document Explorer</h2>
                <Badge variant="outline" className="ml-2 uppercase tracking-widest text-[10px] bg-red-500/10 text-red-500 border-red-500/20">Name Scrubbed</Badge>
             </div>
           </div>
           
           <div className="flex-grow overflow-hidden relative">
              {currentCandidate.profile.resumeUrl && <RedactedImageViewer url={currentCandidate.profile.resumeUrl} isFullscreen={true} />}
           </div>
        </DialogContent>
      </Dialog>

      <RecruiterFeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        studentId={currentCandidate.profile.id}
        action={currentAction}
      />
    </div>
  )
}
