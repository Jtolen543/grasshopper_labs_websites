import { ResumeUpload } from "@/components/resume-upload"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Resume Upload</h1>
            <p className="text-muted-foreground text-lg">Upload your resume and we&apos;ll store it securely for you</p>
          </div>
          <ResumeUpload />
        </div>
      </div>
    </main>
  )
}