"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection({ actionContent }: { actionContent?: React.ReactNode }) {
  return (
    <section className="relative flex flex-col items-center justify-center text-center mt-4 pt-16 pb-16 min-h-[75vh]">
      {/* Background Video acting as an intro sequence */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 rounded-3xl border border-primary/20 shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-100"
        >
          <source src="/videos/tree-growth-gen.mp4" type="video/mp4" />
        </video>
        {/* Lighter overlay to ensure the video remains visible while preserving textual readability */}
        <div className="absolute inset-0 bg-background/40 pointer-events-none" />
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col items-center w-full z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>The Future of Career Progression</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
          Empower your journey in <br className="hidden md:block" />
          <span className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
            computer science
          </span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Unlock the insights you need to land your dream internship. From AI-driven resume parsing to personalized pathing, we focus on helping you build your career.
        </p>

        {actionContent || (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-shadow">
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about-us">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-primary/30 hover:bg-primary/10">
                Learn More
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </section>
  );
}
