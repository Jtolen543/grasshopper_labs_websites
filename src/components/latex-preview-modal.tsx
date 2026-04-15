"use client"

import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  ExternalLink,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

export interface BulletDiff {
  section: string
  heading: string
  original: string
  improved: string
}

interface LaTeXPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  latex: string
  diffs: BulletDiff[]
  isLoading?: boolean
  onRegenerate?: (instructions: string) => void
}

/** Strip LaTeX markup for plain-text display */
function stripLatex(s: string): string {
  return s
    .replace(/\\textbf\{([^}]*)\}/g, "$1")
    .replace(/\\textit\{([^}]*)\}/g, "$1")
    .replace(/\\emph\{([^}]*)\}/g, "$1")
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
    .replace(/\$([^$]*)\$/g, "$1")
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1")
    .replace(/[\\{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Group diffs by section+heading */
function groupDiffs(diffs: BulletDiff[]): Map<string, BulletDiff[]> {
  const map = new Map<string, BulletDiff[]>()
  for (const d of diffs) {
    const key = `${d.section}|||${d.heading}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(d)
  }
  return map
}

export function LaTeXPreviewModal({
  open,
  onOpenChange,
  latex,
  diffs,
  isLoading,
  onRegenerate,
}: LaTeXPreviewModalProps) {
  const overleafFormRef = useRef<HTMLFormElement>(null)
  const [instructions, setInstructions] = useState("")

  const grouped = groupDiffs(diffs)

  const handleDownload = () => {
    const blob = new Blob([latex], { type: "application/x-latex" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resume.tex"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded resume.tex")
  }

  const handleOpenOverleaf = () => {
    if (overleafFormRef.current) {
      overleafFormRef.current.submit()
      toast.success("Opening in Overleaf...", {
        description: "A new tab should open with your project",
      })
    }
  }

  // Encode the LaTeX as a base64 data URI for Overleaf's snip_uri
  const encodedLatex =
    typeof window !== "undefined"
      ? `data:application/x-tex;base64,${btoa(unescape(encodeURIComponent(latex)))}`
      : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Resume Export Preview
          </DialogTitle>
          <DialogDescription className="text-sm">
            Review the AI-suggested changes before exporting your resume to LaTeX.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex flex-col flex-1 overflow-hidden pointer-events-auto">
          <div className="px-6 border-b shrink-0 bg-muted/20">
            <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6 rounded-none">
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 font-medium h-12"
              >
                Suggested Changes
              </TabsTrigger>
              <TabsTrigger 
                value="instructions" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 font-medium h-12"
              >
                Custom Instructions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="flex flex-col m-0 overflow-hidden flex-1 data-[state=active]:flex">

        {/* Body — Diff view */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
          <div className="px-6 py-5 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Generating your improved resume...
                </p>
              </div>
            ) : diffs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Sparkles className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground text-center">
                  No bullet point changes detected — the LaTeX output matches
                  your current resume content.
                </p>
                <p className="text-xs text-muted-foreground/60 text-center max-w-md">
                  You can still download or open it in Overleaf to get your
                  resume in Jake Gutierrez&apos;s template format.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  >
                    {diffs.length} change{diffs.length !== 1 && "s"}
                  </Badge>
                  <span>
                    The following bullet points have been improved by AI
                  </span>
                </div>

                {Array.from(grouped.entries()).map(([key, items]) => {
                  const [section, heading] = key.split("|||")
                  return (
                    <div key={key} className="space-y-3">
                      {/* Section + heading label */}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase tracking-wider font-semibold"
                        >
                          {section}
                        </Badge>
                        <span className="text-sm font-medium truncate">
                          {heading}
                        </span>
                      </div>

                      {/* Diff cards */}
                      {items.map((diff, i) => (
                        <div
                          key={i}
                          className="rounded-lg border overflow-hidden"
                        >
                          {/* Original */}
                          <div className="bg-red-500/5 dark:bg-red-500/10 px-4 py-3 border-b border-red-500/10">
                            <div className="flex items-start gap-2">
                              <span className="shrink-0 mt-0.5 text-[10px] font-bold text-red-500/70 uppercase tracking-wider">
                                Before
                              </span>
                              <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed line-through decoration-red-400/50">
                                {diff.original}
                              </p>
                            </div>
                          </div>

                          {/* Arrow separator */}
                          <div className="flex items-center justify-center -my-2 relative z-10">
                            <div className="bg-background border rounded-full p-1">
                              <ArrowRight className="h-3 w-3 text-muted-foreground rotate-90" />
                            </div>
                          </div>

                          {/* Improved */}
                          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 px-4 py-3 border-t border-emerald-500/10">
                            <div className="flex items-start gap-2">
                              <span className="shrink-0 mt-0.5 text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider">
                                After
                              </span>
                              <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                {stripLatex(diff.improved)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between gap-3 bg-muted/30">
          <p className="text-[10px] text-muted-foreground max-w-xs">
            The generated .tex file compiles in Overleaf using Jake
            Gutierrez&apos;s template.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading || !latex}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Download .tex
            </Button>
            <Button
              size="sm"
              onClick={handleOpenOverleaf}
              disabled={isLoading || !latex}
              className="gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Overleaf
            </Button>
          </div>
        </div>
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="flex flex-col m-0 overflow-hidden flex-1 data-[state=active]:flex">
            <div className="px-6 py-6 flex-1 overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
                <h3 className="text-sm font-semibold mb-2">Custom Formatting Instructions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The AI usually follows standard Jake Gutierrez formatting conventions. If you want the resume formatted differently (e.g. adjust margins, change section order, summarize projects differently), provide instructions here and regenerate.
                </p>
                <Textarea 
                  placeholder="E.g., Group all my ML skills together separated by commas..."
                  className="min-h-[150px] resize-y"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
            </div>
            
            <div className="px-6 py-4 border-t bg-muted/10 flex items-center justify-between shrink-0">
                <p className="text-xs text-muted-foreground">This will override standard styling rules</p>
                <Button 
                  onClick={() => onRegenerate?.(instructions)}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Regenerate Preview
                </Button>
            </div>
        </TabsContent>
        </Tabs>

        {/* Hidden Overleaf form */}
        <form
          ref={overleafFormRef}
          action="https://www.overleaf.com/docs"
          method="POST"
          target="_blank"
          className="hidden"
        >
          <input type="hidden" name="snip_uri" value={encodedLatex} />
        </form>
      </DialogContent>
    </Dialog>
  )
}
