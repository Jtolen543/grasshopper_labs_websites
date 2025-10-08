"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

const questionnaireSchema = z.object({
  industries: z.array(z.string()).min(1, "Please select at least one industry"),
  jobTypes: z.array(z.string()).min(1, "Please select at least one job type"),
  workEnvironment: z.array(z.string()).min(1, "Please select at least one work environment"),
  companySize: z.array(z.string()).min(1, "Please select at least one company size"),
  careerLevel: z.array(z.string()).min(1, "Please select at least one career level"),
  workSchedule: z.array(z.string()).min(1, "Please select at least one work schedule"),
  benefits: z.array(z.string()).min(1, "Please select at least one benefit priority"),
  skills: z.array(z.string()).min(1, "Please select at least one skill area"),
  location: z.array(z.string()).min(1, "Please select at least one location preference"),
  salaryRange: z.array(z.string()).min(1, "Please select at least one salary range"),
  jobSecurity: z.array(z.string()).min(1, "Please select at least one job security preference"),
  workLifeBalance: z.array(z.string()).min(1, "Please select at least one work-life balance preference"),
  careerGrowth: z.array(z.string()).min(1, "Please select at least one career growth preference"),
  teamSize: z.array(z.string()).min(1, "Please select at least one team size preference"),
  travelRequirement: z.array(z.string()).min(1, "Please select at least one travel requirement"),
})

type QuestionnaireFormData = z.infer<typeof questionnaireSchema>

const questions = [
  {
    id: "industries",
    title: "Which industries interest you?",
    description: "Select all industries you'd like to work in",
    options: [
      "Technology",
      "Healthcare",
      "Finance",
      "Education",
      "Marketing",
      "Manufacturing",
      "Retail",
      "Consulting",
      "Non-profit",
      "Government",
      "Entertainment",
      "Real Estate",
      "Transportation",
      "Energy",
      "Agriculture",
    ],
  },
  {
    id: "jobTypes",
    title: "What types of roles are you looking for?",
    description: "Select all job types that interest you",
    options: [
      "Full-time",
      "Part-time",
      "Contract",
      "Freelance",
      "Internship",
      "Temporary",
      "Seasonal",
      "Remote",
      "Hybrid",
      "On-site",
    ],
  },
  {
    id: "workEnvironment",
    title: "What work environments do you prefer?",
    description: "Select your preferred work settings",
    options: [
      "Office",
      "Remote",
      "Hybrid",
      "Co-working space",
      "Home office",
      "Outdoor",
      "Laboratory",
      "Factory",
      "Retail store",
      "Hospital",
    ],
  },
  {
    id: "companySize",
    title: "What company sizes interest you?",
    description: "Select your preferred company sizes",
    options: [
      "Startup (1-50 employees)",
      "Small (51-200 employees)",
      "Medium (201-1000 employees)",
      "Large (1001-5000 employees)",
      "Enterprise (5000+ employees)",
      "Non-profit",
      "Government",
    ],
  },
  {
    id: "careerLevel",
    title: "What career levels are you targeting?",
    description: "Select the career levels you're interested in",
    options: [
      "Entry-level",
      "Junior",
      "Mid-level",
      "Senior",
      "Lead",
      "Manager",
      "Director",
      "VP",
      "C-level",
      "Consultant",
      "Specialist",
    ],
  },
  {
    id: "workSchedule",
    title: "What work schedules work for you?",
    description: "Select your preferred work schedules",
    options: [
      "9-5 Standard",
      "Flexible hours",
      "4-day work week",
      "Night shift",
      "Weekend work",
      "Rotating shifts",
      "On-call",
      "Project-based",
      "Seasonal",
    ],
  },
  {
    id: "benefits",
    title: "What benefits are most important to you?",
    description: "Select your top benefit priorities",
    options: [
      "Health insurance",
      "Dental/Vision",
      "401k/Retirement",
      "Paid time off",
      "Flexible schedule",
      "Remote work",
      "Professional development",
      "Stock options",
      "Gym membership",
      "Free meals",
      "Childcare",
      "Mental health support",
    ],
  },
  {
    id: "skills",
    title: "What skill areas do you want to use or develop?",
    description: "Select the skills you want to focus on",
    options: [
      "Programming",
      "Data analysis",
      "Project management",
      "Sales",
      "Marketing",
      "Design",
      "Writing",
      "Public speaking",
      "Leadership",
      "Research",
      "Customer service",
      "Finance",
      "Operations",
      "Strategy",
      "Teaching",
    ],
  },
  {
    id: "location",
    title: "Where would you like to work?",
    description: "Select your location preferences",
    options: [
      "Major city",
      "Suburbs",
      "Small town",
      "Rural area",
      "International",
      "West Coast",
      "East Coast",
      "Midwest",
      "South",
      "Remote anywhere",
      "Specific state",
      "Near family",
      "Low cost of living",
      "High opportunity area",
    ],
  },
  {
    id: "salaryRange",
    title: "What salary ranges are you targeting?",
    description: "Select your expected salary ranges",
    options: [
      "Under $40k",
      "$40k-$60k",
      "$60k-$80k",
      "$80k-$100k",
      "$100k-$120k",
      "$120k-$150k",
      "$150k-$200k",
      "$200k+",
      "Negotiable",
      "Equity focused",
    ],
  },
  {
    id: "jobSecurity",
    title: "How important is job security to you?",
    description: "Select your job security preferences",
    options: [
      "Very important",
      "Somewhat important",
      "Not important",
      "Prefer stability",
      "Open to risk",
      "Contract work okay",
      "Startup risk acceptable",
      "Government preferred",
    ],
  },
  {
    id: "workLifeBalance",
    title: "What work-life balance do you prefer?",
    description: "Select your work-life balance priorities",
    options: [
      "Strict boundaries",
      "Some flexibility",
      "Work-focused",
      "Life-focused",
      "Seasonal variation",
      "Project-based intensity",
      "Always available",
      "Standard hours only",
    ],
  },
  {
    id: "careerGrowth",
    title: "What career growth opportunities interest you?",
    description: "Select your career development preferences",
    options: [
      "Fast promotion",
      "Skill development",
      "Leadership training",
      "Mentorship",
      "Cross-functional experience",
      "International assignments",
      "Continuing education",
      "Conference attendance",
      "Certification support",
      "Internal mobility",
    ],
  },
  {
    id: "teamSize",
    title: "What team sizes do you prefer working in?",
    description: "Select your preferred team environments",
    options: [
      "Solo work",
      "Small team (2-5)",
      "Medium team (6-15)",
      "Large team (16+)",
      "Cross-functional teams",
      "Remote teams",
      "In-person teams",
      "Matrix organization",
    ],
  },
  {
    id: "travelRequirement",
    title: "How much travel are you comfortable with?",
    description: "Select your travel preferences",
    options: [
      "No travel",
      "Minimal (1-2 times/year)",
      "Occasional (quarterly)",
      "Regular (monthly)",
      "Frequent (weekly)",
      "Extensive (50%+)",
      "International travel",
      "Domestic only",
      "Regional only",
    ],
  },
]

export default function Page() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<QuestionnaireFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      industries: [],
      jobTypes: [],
      workEnvironment: [],
      companySize: [],
      careerLevel: [],
      workSchedule: [],
      benefits: [],
      skills: [],
      location: [],
      salaryRange: [],
      jobSecurity: [],
      workLifeBalance: [],
      careerGrowth: [],
      teamSize: [],
      travelRequirement: [],
    },
  })

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const onSubmit = (data: QuestionnaireFormData) => {
    console.log("Questionnaire submitted:", data)
    setIsSubmitted(true)
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <CardTitle>Job Interests Questionnaire</CardTitle>
            <Badge variant="outline">
              {currentQuestion + 1} of {questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button type="submit">Submit Questionnaire</Button>
              ) : (
                <Button type="button" onClick={nextQuestion}>
                  Next
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}