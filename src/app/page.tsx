import { HeroSection } from "@/components/landing/hero-section";
import { FeatureBentoGrid } from "@/components/landing/feature-bento-grid";
import { ResumeUpload } from "@/components/resume-upload";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <main className="container mx-auto px-4 pt-10 pb-20 space-y-12">
        {/* Signed-in users see the upload form inside the hero */}
        <SignedIn>
          <HeroSection
            actionContent={
              <div className="w-full max-w-2xl mx-auto mt-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
                <ResumeUpload />
              </div>
            }
          />
        </SignedIn>

        {/* Signed-out users see the default hero with Get Started / Learn More buttons */}
        <SignedOut>
          <HeroSection />
        </SignedOut>
        
        {/* Explains site value propositions clearly to users scrolling down */}
        <FeatureBentoGrid />
      </main>
    </div>
  );
}