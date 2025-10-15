"use client"

import { useState } from "react"
import { FieldErrors, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import { toast } from "sonner"

// Zod schema for form validation
const questionnaireSchema = z.object({
  techSectors: z.array(z.string()).min(1, "Please select at least one tech sector"),
  roleTypes: z.array(z.string()).min(1, "Please select at least one role type"),
  workEnvironment: z.array(z.string()).min(1, "Please select at least one work environment"),
  companySize: z.array(z.string()).min(1, "Please select at least one company size"),
  experienceLevel: z.array(z.string()).min(1, "Please select at least one experience level"),
  workSchedule: z.array(z.string()).min(1, "Please select at least one work schedule"),
  benefits: z.array(z.string()).min(1, "Please select at least one benefit priority"),
  technicalSkills: z.array(z.string()).min(1, "Please select at least one technical skill"),
  location: z.array(z.string()).min(1, "Please select at least one location preference"),
  salaryExpectations: z.array(z.string()).min(1, "Please select at least one salary expectation"),
  learningPriorities: z.array(z.string()).min(1, "Please select at least one learning priority"),
  workCulture: z.array(z.string()).min(1, "Please select at least one work culture preference"),
  careerGoals: z.array(z.string()).min(1, "Please select at least one career goal"),
  teamPreferences: z.array(z.string()).min(1, "Please select at least one team preference"),
  projectTypes: z.array(z.string()).min(1, "Please select at least one project type"),
})

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>

const questions = [
  {
    id: "techSectors",
    title: "Which tech sectors interest you?",
    description: "Select all areas of technology you'd like to work in",
    options: [
      "Software Development",
      "Web Development",
      "Mobile Development",
      "Data Science & Analytics",
      "Machine Learning & AI",
      "Cybersecurity",
      "Cloud Computing",
      "DevOps",
      "Game Development",
      "UI/UX Design",
      "Product Management",
      "Quality Assurance",
      "Blockchain",
      "IoT (Internet of Things)",
      "AR/VR",
    ],
  },
  {
    id: "roleTypes",
    title: "What types of positions are you seeking?",
    description: "Select all role types that interest you",
    options: [
      "Summer Internship",
      "Co-op Program",
      "Part-time Internship",
      "New Grad Full-time",
      "Entry-level Position",
      "Rotational Program",
      "Research Assistant",
      "Teaching Assistant",
      "Freelance Projects",
      "Open Source Contributor",
    ],
  },
  {
    id: "workEnvironment",
    title: "What work environments do you prefer?",
    description: "Select your preferred work settings",
    options: [
      "Fully Remote",
      "Hybrid (2-3 days office)",
      "In-office",
      "Flexible/Your choice",
      "Co-working space",
      "Campus-based",
      "Home office setup provided",
      "International office",
    ],
  },
  {
    id: "companySize",
    title: "What company sizes interest you?",
    description: "Select your preferred company sizes",
    options: [
      "Early-stage Startup (1-20)",
      "Growing Startup (21-100)",
      "Mid-size Tech Company (101-1000)",
      "Large Tech Company (1000-10000)",
      "Big Tech (FAANG/MANGA)",
      "Tech Consulting Firm",
      "University Research Lab",
      "Non-profit Tech Org",
    ],
  },
  {
    id: "experienceLevel",
    title: "What experience level are you targeting?",
    description: "Select the levels you're qualified for or interested in",
    options: [
      "Intern (No experience required)",
      "Intern (Some coursework)",
      "Intern (Previous internship)",
      "New Grad (0-1 years)",
      "Junior (1-2 years)",
      "Entry-level with bootcamp",
      "Entry-level with projects",
      "Research position",
    ],
  },
  {
    id: "workSchedule",
    title: "What work schedules work for you?",
    description: "Select your preferred work schedules",
    options: [
      "Standard 9-5",
      "Flexible hours",
      "Core hours (10-4)",
      "Async-first",
      "Part-time (20 hrs/week)",
      "Part-time (30 hrs/week)",
      "Full-time (40 hrs/week)",
      "Willing to work overtime",
      "School schedule compatible",
    ],
  },
  {
    id: "benefits",
    title: "What benefits are most important to you?",
    description: "Select your top benefit priorities as a student/new grad",
    options: [
      "Competitive salary",
      "Health insurance",
      "401k matching",
      "Learning & development budget",
      "Conference attendance",
      "Mentorship program",
      "Tuition reimbursement",
      "Student loan assistance",
      "Relocation assistance",
      "Housing stipend",
      "Free meals/snacks",
      "Gym membership",
      "Mental health support",
      "PTO/Vacation days",
    ],
  },
  {
    id: "technicalSkills",
    title: "What technical skills do you want to use or develop?",
    description: "Select the skills you want to focus on",
    options: [
      "JavaScript/TypeScript",
      "Python",
      "Java",
      "C++/C",
      "React/Vue/Angular",
      "Node.js",
      "SQL/Databases",
      "AWS/Azure/GCP",
      "Docker/Kubernetes",
      "Git/Version Control",
      "Machine Learning",
      "Data Structures & Algorithms",
      "System Design",
      "API Development",
      "Mobile (iOS/Android)",
    ],
  },
  {
    id: "location",
    title: "Where would you like to work?",
    description: "Select your location preferences",
    options: [
      "San Francisco Bay Area",
      "Seattle",
      "New York City",
      "Austin",
      "Boston",
      "Los Angeles",
      "Chicago",
      "Remote (US)",
      "Remote (International)",
      "Near my university",
      "Near family",
      "Open to relocation",
      "Tech hub cities",
      "Lower cost of living areas",
    ],
  },
  {
    id: "salaryExpectations",
    title: "What are your salary expectations?",
    description: "Select your expected compensation ranges (for full-time roles)",
    options: [
      "Internship: $20-30/hr",
      "Internship: $30-40/hr",
      "Internship: $40-50/hr",
      "Internship: $50+/hr",
      "New Grad: $60k-80k",
      "New Grad: $80k-100k",
      "New Grad: $100k-120k",
      "New Grad: $120k-150k",
      "New Grad: $150k+",
      "Equity/Stock options important",
      "Negotiable based on learning",
    ],
  },
  {
    id: "learningPriorities",
    title: "What learning opportunities are most important?",
    description: "Select your professional development priorities",
    options: [
      "Structured onboarding program",
      "Dedicated mentor",
      "Pair programming",
      "Code reviews",
      "Tech talks & workshops",
      "Conference attendance",
      "Online course stipend",
      "Certification support",
      "Rotation programs",
      "Cross-team projects",
      "Open source contribution time",
      "Hackathons",
    ],
  },
  {
    id: "workCulture",
    title: "What work culture appeals to you?",
    description: "Select your preferred company culture traits",
    options: [
      "Fast-paced & innovative",
      "Collaborative & team-focused",
      "Autonomous & independent",
      "Structured & process-driven",
      "Casual & relaxed",
      "Mission-driven",
      "Diversity & inclusion focused",
      "Work-life balance emphasis",
      "High-growth environment",
      "Flat hierarchy",
      "Strong engineering culture",
      "Social & team events",
    ],
  },
  {
    id: "careerGoals",
    title: "What are your career goals?",
    description: "Select your professional aspirations",
    options: [
      "Become a senior engineer",
      "Move into management",
      "Become a tech lead",
      "Specialize in one area",
      "Be a generalist/full-stack",
      "Start my own company",
      "Work on cutting-edge tech",
      "Make social impact",
      "Build products used by millions",
      "Contribute to open source",
      "Teach/mentor others",
      "Research & innovation",
    ],
  },
  {
    id: "teamPreferences",
    title: "What team environment do you prefer?",
    description: "Select your preferred team dynamics",
    options: [
      "Small team (2-5 people)",
      "Medium team (6-15 people)",
      "Large team (15+ people)",
      "Cross-functional teams",
      "Engineering-only teams",
      "Agile/Scrum teams",
      "Remote-first teams",
      "In-person collaboration",
      "Pair programming culture",
      "Independent work with check-ins",
    ],
  },
  {
    id: "projectTypes",
    title: "What types of projects excite you?",
    description: "Select the project types you want to work on",
    options: [
      "Consumer-facing products",
      "Enterprise software",
      "Internal tools",
      "Mobile apps",
      "Web applications",
      "Backend systems",
      "Data pipelines",
      "Machine learning models",
      "Infrastructure/DevOps",
      "Security systems",
      "Research projects",
      "Open source projects",
      "Greenfield (new) projects",
      "Legacy system maintenance",
    ],
  },
]

export default function Page() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      techSectors: [],
      roleTypes: [],
      workEnvironment: [],
      companySize: [],
      experienceLevel: [],
      workSchedule: [],
      benefits: [],
      technicalSkills: [],
      location: [],
      salaryExpectations: [],
      learningPriorities: [],
      workCulture: [],
      careerGoals: [],
      teamPreferences: [],
      projectTypes: [],
    }
  })

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const onSubmit = (data: QuestionnaireFormData) => {
    console.log("Questionnaire submitted:", data)
    toast.info("Successfully submitted form")
    setIsSubmitted(true)
  }
  const onError = (errors: FieldErrors<QuestionnaireFormData>) => {
    toast.info("Please correct the form")
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const currentQuestionData = questions[currentQuestion]
  const fieldName = currentQuestionData.id as keyof QuestionnaireFormData

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Questionnaire Complete!</h2>
            <p className="text-muted-foreground">
              Thank you for completing the job interests questionnaire. Your responses will help us better understand
              your career preferences.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false)
                setCurrentQuestion(0)
                form.reset()
              }}
            >
              Take Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col py-20 justify-center">
      <Card className="w-full max-w-2xl mx-auto min-h-140 justify-between">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle>Tech Career Interests - College Students</CardTitle>
              <Badge variant="outline">
                {currentQuestion + 1} of {questions.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6" id="formId">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{currentQuestionData.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentQuestionData.description}</p>
                </div>

                <FormField
                  control={form.control}
                  name={fieldName}
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentQuestionData.options.map((option) => (
                          <FormField
                            key={option}
                            control={form.control}
                            name={fieldName}
                            render={({ field }) => {
                              return (
                                <FormItem key={option} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option])
                                          : field.onChange(field.value?.filter((value) => value !== option))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">{option}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex w-full justify-end gap-4">
              <Button type="button" variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button type="submit" form="formId">Submit Questionnaire</Button>
              ) : (
                <Button type="button" onClick={nextQuestion}>
                  Next
                </Button>
              )}
            </div>
        </CardFooter>
      </Card>
    </div>
  )
}
