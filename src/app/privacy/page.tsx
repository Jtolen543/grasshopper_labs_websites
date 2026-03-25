import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
      
      <div className="space-y-8 bg-card/50 p-8 rounded-xl border border-border/50 backdrop-blur">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-border/50 pb-2">Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you use ResumeHub, we collect the resume text and files you voluntarily upload to our platform, as well as necessary account information to provide our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-border/50 pb-2 text-primary/90">How We Use Large Language Models (LLMs)</h2>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
            <p className="text-foreground font-medium">
              We leverage advanced Large Language Models (LLMs) to enhance your experience.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              When you upload your resume, we use LLMs to securely parse and analyze the text. This parsed data is used exclusively to evaluate your experience, match your skills against job requirements, and generate the tailored visuals and insights displayed on your personalized dashboard.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We do not use your resume data to train our own foundational AI models, and processing is done solely to provide you with the ResumeHub service.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-border/50 pb-2">Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures to protect your personal information and resume data from unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-border/50 pb-2">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy or how we handle your data, please contact us through our <Link href="/about-us" className="text-primary hover:underline">Contact Page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
