"use client";

import { AnimatedCard } from "./animated-card";
import { FileSearch, Target, Route, Users, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function FeatureBentoGrid() {
  return (
    <section className="py-20 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Powerful tools for <span className="text-primary">career growth</span>.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to visualize your skills, plan your path, and connect with the right people.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
        
        {/* Block 1: Resume Analysis (Large spans 2 cols on md) */}
        <AnimatedCard className="md:col-span-2 p-8 flex flex-col justify-between group" delay={0.1}>
          <div className="flex justify-between items-start">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <FileSearch className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Resume Parsing</h3>
              <p className="text-muted-foreground max-w-sm">
                Upload your resume and instantly see how well you match with your target internships. Our AI breaks down your experience into actionable data.
              </p>
            </div>
            
            {/* Animated mini visual */}
            <div className="hidden md:flex w-32 h-32 relative items-center justify-center">
              <motion.div 
                className="absolute inset-0 border-2 border-primary/30 rounded-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-2 border-2 border-primary/20 rounded-xl"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              <Sparkles className="w-8 h-8 text-primary absolute animate-pulse" />
            </div>
          </div>
        </AnimatedCard>

        {/* Block 2: Skill Growth */}
        <AnimatedCard className="p-8 flex flex-col justify-between group" delay={0.2}>
          <div>
             <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Skill Tracking</h3>
              <p className="text-muted-foreground">
                Visualize your technical and soft skills. Set targets and watch your proficiency grow over time.
              </p>
          </div>
          <div className="flex items-end gap-2 h-20 mt-4 overflow-hidden relative">
            <motion.div className="w-8 bg-blue-500/20 rounded-t-sm" initial={{ height: "20%" }} whileInView={{ height: "40%" }} transition={{ delay: 0.5 }}  />
            <motion.div className="w-8 bg-blue-500/40 rounded-t-sm" initial={{ height: "20%" }} whileInView={{ height: "60%" }} transition={{ delay: 0.6 }} />
            <motion.div className="w-8 bg-blue-500/60 rounded-t-sm" initial={{ height: "20%" }} whileInView={{ height: "80%" }} transition={{ delay: 0.7 }} />
            <motion.div className="w-8 bg-blue-500 text-black flex justify-center rounded-t-sm" initial={{ height: "20%" }} whileInView={{ height: "100%" }} transition={{ delay: 0.8 }}>
                <TrendingUp className="w-4 h-4 mt-2" />
            </motion.div>
          </div>
        </AnimatedCard>

        {/* Block 3: Career Pathing */}
        <AnimatedCard className="p-8 flex flex-col justify-between group" delay={0.3}>
          <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                <Route className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Career Pathing</h3>
              <p className="text-muted-foreground">
                Discover roles that fit your skills. See the roadmap of exactly what you need to learn to get there.
              </p>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full mt-auto relative overflow-hidden">
             <motion.div 
               className="absolute top-0 left-0 h-full bg-purple-500 rounded-full"
               initial={{ width: "0%" }}
               whileInView={{ width: "75%" }}
               transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
             />
          </div>
        </AnimatedCard>

        {/* Block 4: Mentor Tracking (Large spans 2 cols on md) */}
        <AnimatedCard className="md:col-span-2 p-8 flex flex-col justify-between group" delay={0.4}>
          <div className="flex justify-between items-center h-full">
            <div className="max-w-md">
               <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Build Your Network</h3>
                <p className="text-muted-foreground">
                  Connect with mentors and peers. Track your networking goals to ensure you are building the right relationships.
                </p>
            </div>
            
            <div className="hidden md:flex gap-4 relative">
                {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + (i * 0.1), type: "spring" }}
                      className="w-16 h-16 rounded-full bg-secondary border-2 border-border flex items-center justify-center z-10"
                      style={{ 
                         marginLeft: i > 1 ? "-20px" : "0",
                         zIndex: 10 - i 
                      }}
                    >
                        <Users className="w-6 h-6 text-muted-foreground" />
                    </motion.div>
                ))}
            </div>
          </div>
        </AnimatedCard>

      </div>
    </section>
  );
}
