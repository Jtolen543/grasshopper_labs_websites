"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Check } from "lucide-react"

interface RecruiterFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (tags: string[], note: string) => void
  studentId: string
  action: "save" | "pass" | null
}

const COMMON_TAGS = {
  pass: [
    "Needs more quantitative metrics",
    "Missing required technical skills",
    "Formatting is hard to read",
    "Lack of relevant projects",
    "Typos or grammatical errors",
    "Not enough detail on experience"
  ],
  save: [
    "Impressive tech stack",
    "Clear, action-oriented bullet points",
    "Great project portfolio",
    "Strong academic alignment",
    "Relevant internship experience",
    "Excellent formatting"
  ]
}

export function RecruiterFeedbackModal({ isOpen, onClose, onSubmit, action }: RecruiterFeedbackModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [note, setNote] = useState("")

  const tagsToShow = action === "pass" ? COMMON_TAGS.pass : COMMON_TAGS.save

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    onSubmit(selectedTags, note)
    setSelectedTags([])
    setNote("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave Feedback</DialogTitle>
          <DialogDescription>
            Help this candidate improve by leaving anonymous feedback. Your insights are invaluable for student growth.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Quick Tags</h4>
            <div className="flex flex-wrap gap-2">
              {tagsToShow.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer py-1.5 transition-all"
                  onClick={() => toggleTag(tag)}
                >
                  {selectedTags.includes(tag) && <Check className="mr-1 h-3 w-3" />}
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Additional Notes (Optional)</h4>
            <Textarea
              placeholder="e.g., I'd love to see more detail on how you scaled the database in your capstone project."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Skip</Button>
          <Button onClick={handleSubmit} className="bg-primary">
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
