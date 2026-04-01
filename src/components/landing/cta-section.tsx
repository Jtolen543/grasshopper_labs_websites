"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 mb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-primary/5 border border-primary/20 p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-primary/10 blur-[100px] -z-10" />
        
        <Rocket className="w-12 h-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to launch your career?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Join hundreds of students using our platform to organize their resume, track their skills, and land their dream internships.
        </p>

        <Link href="/login">
          <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-shadow">
            Start Building Your Profile
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
