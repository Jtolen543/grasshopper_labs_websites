"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"
import {
  Mail,
  Send,
  Crown,
  GraduationCap,
  Code2,
  FlaskConical,
  Users,
  UserPlus,
  ArrowDown,
  Briefcase,
  GitPullRequest,
  Lightbulb,
  Shield,
} from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TeamNode {
  name: string
  role: string
  subtitle: string
  description: string
  icon: React.ElementType
  imageUrl?: string
  filled: boolean
  tags?: string[]
  mentorLink?: boolean
  bridgeNode?: boolean
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const advisors: TeamNode[] = [
  {
    name: "Dr. Amanpreet Kapoor",
    role: "Faculty Advisor",
    subtitle: "Strategic Oversight",
    description:
      "Instructional Associate Professor in the UF Department of Engineering Education. Provides academic direction and research methodology guidance.",
    icon: GraduationCap,
    imageUrl: "/team/amanpreet-kapoor.png",
    filled: true,
    tags: ["Research Direction", "Academic Rigor"],
  },
  {
    name: "Jason Tolen",
    role: "Alumni Consultant",
    subtitle: "Strategic Oversight",
    description:
      "Computer Science Alumni and Data Annotation Freelancer. Brings industry perspective and long-term architectural insight to the project.",
    icon: Briefcase,
    imageUrl: "/team/jason-tolen.png",
    filled: true,
    tags: ["Industry Lens", "Architecture"],
  },
]

const projectLead: TeamNode = {
  name: "Wyatt Harris",
  role: "Project & Research Lead",
  subtitle: "Central Hub · Owns Vision, Roadmap & Research",
  description:
    "The central decision-maker who owns the product vision, drives the research agenda, manages the project roadmap, and coordinates all cross-functional work. Every major technical and research decision flows through this role — bridging academic objectives with engineering execution.",
  icon: Crown,
  imageUrl: "/team/wyatt-harris.png",
  filled: true,
  tags: ["Vision", "Research", "Roadmap", "PM", "Full Stack", "Decision Authority"],
}

const executionTeam: TeamNode[] = [
  {
    name: "Nicolas Slenko",
    role: "Tech Lead",
    subtitle: "Execution · Code Quality Filter",
    description:
      "Acts as the quality gate for all incoming code. Responsible for architecture decisions, code reviews, CI/CD standards, and mentoring junior contributors.",
    icon: Code2,
    imageUrl: "/team/nicolas-slenko.png",
    filled: true,
    tags: ["Architecture", "Code Review", "CI/CD", "Mentorship"],
  },
  {
    name: "Oliver",
    role: "User Research & Testing",
    subtitle: "Execution · Insights Specialist",
    description:
      "Bridges the gap between human insights and technical requirements. Conducts user interviews, usability testing, and translates findings into actionable specs.",
    icon: FlaskConical,
    filled: true,
    tags: ["UX Research", "Testing", "Requirements"],
    bridgeNode: true,
  },
  {
    name: "TBD",
    role: "Junior Developer",
    subtitle: "Execution · Apprentice",
    description:
      "Contributes features and fixes under the Tech Lead's mentorship. Follows established patterns and grows through structured code review.",
    icon: UserPlus,
    filled: false,
    tags: ["Feature Dev", "Learning"],
    mentorLink: true,
  },
  {
    name: "TBD",
    role: "Student Assistant",
    subtitle: "Execution · Support",
    description:
      "Supports documentation, data collection, and exploratory development tasks. Reports to Tech Lead for code contributions.",
    icon: Users,
    filled: false,
    tags: ["Documentation", "Data", "Support"],
    mentorLink: true,
  },
]

// ─── Card Component ────────────────────────────────────────────────────────────

function NodeCard({
  node,
  variant,
}: {
  node: TeamNode
  variant: "advisor" | "lead" | "execution"
}) {
  const styles = {
    advisor: {
      border: "border-zinc-700 dark:border-zinc-400",
      bg: "bg-zinc-900 dark:bg-zinc-800",
      text: "text-zinc-100",
      subtitleText: "text-zinc-400",
      descText: "text-zinc-300",
      tagBg: "bg-zinc-700 text-zinc-200",
      iconBg: "bg-zinc-700",
    },
    lead: {
      border: "border-amber-500 dark:border-amber-400",
      bg: "bg-gradient-to-br from-amber-950 via-yellow-950 to-amber-950 dark:from-amber-900/90 dark:via-yellow-900/80 dark:to-amber-900/90",
      text: "text-amber-50",
      subtitleText: "text-amber-300",
      descText: "text-amber-200",
      tagBg: "bg-amber-800/80 text-amber-100",
      iconBg: "bg-amber-700",
    },
    execution: {
      border: "border-blue-600 dark:border-blue-400",
      bg: "bg-blue-950 dark:bg-blue-900/80",
      text: "text-blue-50",
      subtitleText: "text-blue-300",
      descText: "text-blue-200",
      tagBg: "bg-blue-800 text-blue-200",
      iconBg: "bg-blue-800",
    },
  }

  const s = styles[variant]
  const Icon = node.icon

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
        s.border, s.bg,
        variant === "lead" && "shadow-amber-500/20 ring-1 ring-amber-500/30",
        !node.filled && "opacity-70 border-dashed"
      )}
    >
      {/* Bridge indicator */}
      {node.bridgeNode && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400 text-[10px] gap-1 font-semibold">
            <Lightbulb className="h-3 w-3" /> Insights ↔ Requirements
          </Badge>
        </div>
      )}

      {/* Mentor link indicator */}
      {node.mentorLink && (
        <div className="absolute -top-3 right-3">
          <Badge variant="outline" className="border-blue-400 text-blue-300 text-[10px] gap-1 bg-blue-950/80">
            <GitPullRequest className="h-3 w-3" /> → Tech Lead
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {node.imageUrl ? (
          <div className={cn("relative shrink-0 overflow-hidden rounded-full aspect-square border-2 border-background/10 shadow-sm", variant === "lead" ? "w-24 sm:w-28" : "w-16 sm:w-20")}>
            <Image
              src={node.imageUrl}
              alt={node.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className={cn("shrink-0 rounded-full flex items-center justify-center", s.iconBg, variant === "lead" ? "w-24 h-24 sm:w-28 sm:h-28" : "w-16 h-16 sm:w-20 sm:h-20")}>
            <Icon className={cn("text-white", variant === "lead" ? "h-10 w-10" : "h-7 w-7")} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className={cn("font-bold leading-tight", s.text, variant === "lead" ? "text-lg" : "text-base", !node.filled && "italic")}>
            {node.name}
          </h3>
          <p className={cn("font-semibold", s.subtitleText, variant === "lead" ? "text-base" : "text-sm")}>{node.role}</p>
          <p className={cn("text-xs opacity-75 mt-0.5", s.subtitleText)}>{node.subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <p className={cn("leading-relaxed mb-3", s.descText, variant === "lead" ? "text-sm" : "text-xs")}>{node.description}</p>

      {/* Tags */}
      {node.tags && (
        <div className="flex flex-wrap gap-1.5">
          {node.tags.map((tag) => (
            <span key={tag} className={cn("font-medium px-2 py-0.5 rounded-full", s.tagBg, variant === "lead" ? "text-xs" : "text-[10px]")}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Connectors ────────────────────────────────────────────────────────────────

function VerticalConnector({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex justify-center py-3">
      <div className="flex flex-col items-center gap-1">
        <div className={cn("w-0.5 h-8 rounded-full bg-gradient-to-b", from, to)} />
        <ArrowDown className={cn("h-4 w-4", to.replace("to-", "text-"))} />
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">
            <Shield className="h-3 w-3 mr-1" /> Project Ecosystem
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Us
          </h1>
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We built this site based on information found from past research where students may benefit from learning which factors could benefit them the most in obtaining an internship. We aim to help students further their career and guide them in the correct direction.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              An organizational hierarchy built around a central research and project lead,
              with advisory oversight and specialized execution teams.
            </p>
          </div>
        </div>

        {/* ─── Faculty Director (Dr. Kapoor) ───────────────────────── */}
        <div className="mb-16 max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Faculty Advisor</h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-zinc-700 to-zinc-500 mx-auto rounded-full" />
          </div>
          <div className="max-w-xl mx-auto">
            <NodeCard node={advisors[0]} variant="advisor" />
          </div>
        </div>

        {/* ─── Core Leadership Team ────────────────────────────────── */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Project Leadership</h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            <NodeCard node={advisors[1]} variant="advisor" />
            <div className="relative z-10 scale-105 transform">
              <NodeCard node={projectLead} variant="lead" />
            </div>
            <NodeCard node={executionTeam[0]} variant="execution" />
          </div>
        </div>

        {/* ─── Execution Team ──────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Execution Team</h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto items-start">
            {executionTeam.slice(1).map((node, i) => (
              <NodeCard key={i} node={node} variant="execution" />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 border rounded-lg p-4 max-w-2xl mx-auto bg-muted/30">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Legend</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-zinc-700 bg-zinc-900 shrink-0" />
              <span className="text-muted-foreground">Advisory — Strategic Oversight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-amber-500 bg-amber-950 shrink-0" />
              <span className="text-muted-foreground">Project Lead — Central Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-950 shrink-0" />
              <span className="text-muted-foreground">Execution Team</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-dashed border-blue-600 bg-blue-950/50 shrink-0" />
              <span className="text-muted-foreground">Unfilled Position</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500 text-emerald-950 text-[9px] h-4 px-1.5">Bridge</Badge>
              <span className="text-muted-foreground">Human Insights ↔ Technical Specs</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-400 text-blue-400 text-[9px] h-4 px-1.5">→ Tech Lead</Badge>
              <span className="text-muted-foreground">Code Review Reporting Line</span>
            </div>
          </div>
        </div>

        {/* ─── Contact Section ──────────────────────────────────────── */}
        <div className="mt-32 max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Have questions about the project? Want to collaborate or report an issue?
                We&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email Us</p>
                  <a href="mailto:wharris2023@gmail.com" className="text-lg hover:text-primary transition-colors">wharris2023@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input id="name" placeholder="Your name" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" placeholder="name@example.com" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea
                    id="message"
                    placeholder="How can we help?"
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
