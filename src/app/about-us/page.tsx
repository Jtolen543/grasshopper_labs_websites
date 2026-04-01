"use client"

import { TeamMemberCard } from "@/components/team-member-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, MessageSquare, Send } from "lucide-react"

export default function AboutUsPage() {
  const students = [
    {
      name: "Wyatt Harris",
      role: "Full Stack Dev",
      description: "Computer Engineering Undergrad and Undergraduate Researcher.",
      socials: { github: "https://github.com/wharris23", linkedin: "https://www.linkedin.com/in/wyatt-harris-2123swe/", email: "wharris2023@gmail.com" },
      image: "/team/wyatt-harris.png"
    },
    {
      name: "Jason Tolen",
      role: "Project Manager",
      description: "Computer Science Alumni and Data Annotation Freelancer.",
      socials: { github: "https://github.com/Jtolen543", linkedin: "https://www.linkedin.com/in/jason-tolen/", email: "jason@example.com" },
      image: "/team/jason-tolen.png"
    },
    {
      name: "Nicolas Slenko",
      role: "Full Stack Dev",
      description: "Computer Science Undergrad and Incoming Roblox Intern.",
      socials: { github: "https://github.com/NicolasSlenko/", linkedin: "https://www.linkedin.com/in/nicolas-slenko/", email: "nickslenko@gmail.com" },
      image: "/team/nicolas-slenko.png"
    },
    {
      name: "Oliver",
      role: "Researcher",
      description: "Uncovering insights from massive datasets. Focused on machine learning and predictive analytics.",
      socials: { github: "#", linkedin: "#", email: "oliver@example.com" }
    }
  ]

  const professor = {
    name: "Dr. Amanpreet Kapoor",
    role: "Research Lead & Professor",
    description: "Instructional Associate Professor in the UF Department of Engineering Education.",
    socials: { github: "#", linkedin: "#", email: "kapoor@ufl.edu" },
    isProfessor: true,
    image: "/team/amanpreet-kapoor.png"
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">
            The Team
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Us
          </h1>
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We built this site based on information found from past research where students may benefit from learning which factors could benefit them the most in obtaining an internship. We aim to help students further their career and guide them in the correct direction.
            </p>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {students.map((student, idx) => (
            <TeamMemberCard key={idx} {...student} />
          ))}
        </div>

        {/* Professor Section */}
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
               Faculty Advisor
             </span>
          </div>
          <TeamMemberCard {...professor} />
        </div>

        {/* --- Contact Section Merged from /contact --- */}
        <div className="mt-32 max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Info Section */}
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

          {/* Standard Form */}
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
