"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StudentProfile, MatchResult } from "@/lib/business-matching"
import { UserCircle2, Mail, ExternalLink, Calendar, MoreHorizontal, GraduationCap, Check } from "lucide-react"

export interface PipelineCandidate {
  profile: StudentProfile
  match: MatchResult
  feedback: {
    tags: string[]
    note: string
  }
  column?: string
}

interface PipelineKanbanProps {
  candidates: PipelineCandidate[]
  onMoveCandidate: (candidateId: string, newColumn: string) => void
}

export function PipelineKanban({ candidates, onMoveCandidate }: PipelineKanbanProps) {
  // Mock request states across cards
  const [requestStatus, setRequestStatus] = useState<Record<string, "requested" | "accepted">>({})

  const handleRequestReveal = (id: string) => {
    setRequestStatus(prev => ({ ...prev, [id]: "requested" }))
    
    // For Demo Purposes: Automatically accept the request after 2.5 seconds to show the unblinding flow
    setTimeout(() => {
      setRequestStatus(prev => ({ ...prev, [id]: "accepted" }))
    }, 2500)
  }

  // Handle Drag Events
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("candidateId", id)
    setTimeout(() => {
      ;(e.target as HTMLElement).classList.add("opacity-50")
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    ;(e.target as HTMLElement).classList.remove("opacity-50")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("candidateId")
    if (id) {
      onMoveCandidate(id, columnId)
    }
  }

  const columns = [
    { id: "shortlisted", title: "Shortlisted", color: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400" },
    { id: "connected", title: "Connected", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" },
    { id: "interviewing", title: "Interviewing", color: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" },
    { id: "offered", title: "Offered", color: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" },
  ]

  return (
    <div className="w-full flex gap-6 overflow-x-auto pb-8 h-[calc(100vh-250px)] min-h-[600px] snap-x">
      {columns.map(col => {
        const colCandidates = candidates.filter(c => (c.column || "shortlisted") === col.id)

        return (
          <div 
            key={col.id} 
            className="flex-1 min-w-[350px] max-w-[450px] flex flex-col bg-muted/30 rounded-xl border p-4 transition-colors hover:bg-muted/50 snap-center"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                {col.title}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.color}`}>
                  {colCandidates.length}
                </span>
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>

            {/* Cards Area */}
            <div className="flex flex-col gap-4 overflow-y-auto flex-grow px-1 pb-4">
              {colCandidates.map((c, i) => {
                const status = requestStatus[c.profile.id]
                const isRequested = status === "requested"
                const isAccepted = status === "accepted"
                // Drag is ONLY enabled if the student has accepted.
                const canDrag = isAccepted

                return (
                  <Card 
                    key={c.profile.id} 
                    className={`transition bg-background border-border shadow-sm overflow-hidden group 
                      ${canDrag ? "hover:shadow-md cursor-grab active:cursor-grabbing border-l-4 border-l-indigo-500" : "opacity-80 border-l-4 border-l-zinc-300"}`}
                    draggable={canDrag}
                    onDragStart={(e) => handleDragStart(e, c.profile.id)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Top Bar with Match Score */}
                    <div className="bg-muted p-3 border-b flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-inner">
                           {c.match.score}% Match
                         </div>
                         <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                           {c.profile.id}
                         </Badge>
                      </div>
                      
                      {isAccepted ? (
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-sm border border-green-500/20 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Connection Open
                        </span>
                      ) : isRequested ? (
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20 flex items-center gap-1">
                          Pending Response
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-sm border border-red-500/20">
                          Profile Blinded
                        </span>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Candidate Identity */}
                      <div className="mb-4">
                        {isAccepted ? (
                          // Unlocked Profile
                          <div className="flex items-start gap-4 p-3 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                            <UserCircle2 className="h-10 w-10 text-primary stroke-[1.5]" />
                            <div>
                              <h4 className="font-bold text-lg leading-tight text-foreground">Wyatt Harris</h4>
                              <div className="font-semibold text-xs text-muted-foreground">{c.profile.major}</div>
                              <div className="flex gap-3 text-xs text-primary mt-2">
                                <span className="flex items-center cursor-pointer hover:underline"><Mail className="h-3 w-3 mr-1" /> Contacted</span>
                                <span className="flex items-center cursor-pointer hover:underline"><ExternalLink className="h-3 w-3 mr-1" /> Original Resume</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Locked Profile
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex-grow">
                                <div className="font-bold text-lg">{c.profile.major}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><GraduationCap className="h-3.5 w-3.5" /> GPA: {c.profile.gpa} • Year {c.profile.yearInSchool}</div>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                              {isRequested ? (
                                <Button size="sm" variant="secondary" disabled className="w-full h-9 flex items-center gap-2 animate-pulse">
                                  Awaiting Student Approval...
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleRequestReveal(c.profile.id)} className="w-full h-9 font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
                                  Request Profile Access
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Recruiter Feedback Data */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Saved Tags</span>
                          <div className="flex flex-wrap gap-1.5">
                            {c.feedback.tags.length > 0 ? (
                              c.feedback.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[10px] font-medium bg-secondary/50">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">No tags added</span>
                            )}
                          </div>
                        </div>

                        {c.feedback.note && (
                          <div className="bg-muted/50 p-2.5 rounded-md border text-xs text-foreground italic border-l-2 border-l-primary/50 relative">
                            <span className="opacity-80">"{c.feedback.note}"</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Added 2 mins ago</div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              
              {colCandidates.length === 0 && (
                <div className="h-24 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground text-sm font-medium opacity-50 pointer-events-none">
                  Drop candidates here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
