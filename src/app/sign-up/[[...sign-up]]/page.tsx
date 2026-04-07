"use client"

import { useState } from "react"
import { SignUp } from "@clerk/nextjs"
import { CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const [hasAcceptedLLM, setHasAcceptedLLM] = useState(false)

  if (!hasAcceptedLLM) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="max-w-md w-full bg-background rounded-xl shadow-lg border border-border/50 p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome to Vistern</h1>
            <p className="text-muted-foreground">Before we create your account, please review our data usage policy.</p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              How we use AI (LLMs)
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We leverage Large Language Models (LLMs) to securely parse and analyze the resume you provide. This parsed data is used <strong>exclusively</strong> to evaluate your experience, match your skills against job requirements, and generate the tailored visuals and insights displayed on your personalized dashboard.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We <strong>do not</strong> use your resume data to train our own foundational AI models.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setHasAcceptedLLM(true)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
            >
              I Understand & Accept
            </button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              By accepting, you agree to our <a href="/privacy" target="_blank" className="underline hover:text-foreground">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <SignUp
        appearance={{
          elements: {
            card: "shadow-lg border border-border/50 bg-background/95 backdrop-blur",
          },
        }}
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
      />
    </div>
  )
}
