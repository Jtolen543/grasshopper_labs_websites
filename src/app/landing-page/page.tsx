import { HeroSection } from "@/components/landing/hero-section";
import { FeatureBentoGrid } from "@/components/landing/feature-bento-grid";
import { CTASection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <main className="container mx-auto px-4 pt-20 pb-10 space-y-32">
        <HeroSection />
        <FeatureBentoGrid />
        <CTASection />
      </main>
    </div>
  );
}
