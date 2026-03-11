"use client"

import { useResume } from "@/contexts/resume-context"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, Shield, Trophy, Hammer, Rocket, Code, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export function CharacterSheet() {
  const { resumeData, addXp, setCharacterClass, debugSetLevel } = useResume()
  
  const gamification = resumeData?.gamification || {
    level: 1,
    xp: 0,
    levelMaxXp: 100,
    characterClass: "Novice",
    quests: [],
    achievements: []
  }

  const { level, xp, levelMaxXp, characterClass } = gamification
  const xpPercentage = (xp / levelMaxXp) * 100

  const getClassIcon = (c: string) => {
    switch (c) {
      case "Disruptor": return <Zap className="h-6 w-6 text-purple-400" />
      case "Builder": return <Hammer className="h-6 w-6 text-orange-400" />
      case "Scaler": return <Rocket className="h-6 w-6 text-blue-400" />
      default: return <Shield className="h-6 w-6 text-gray-400" />
    }
  }

  const getClassColor = (c: string) => {
    switch (c) {
      case "Disruptor": return "border-purple-500 shadow-purple-500/20"
      case "Builder": return "border-orange-500 shadow-orange-500/20"
      case "Scaler": return "border-blue-500 shadow-blue-500/20"
      default: return "border-gray-500"
    }
  }

  return (
    <Card className="bg-slate-950 border-slate-800 text-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-slate-800/[0.1] -z-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2" />
      
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
         {/* Avatar / Class Icon */}
        <div className={cn(
          "h-16 w-16 rounded-xl border-2 flex items-center justify-center bg-slate-900 shadow-lg transition-all duration-500",
          getClassColor(characterClass)
        )}>
          {getClassIcon(characterClass)}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <CardTitle className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
                {resumeData?.basics?.name || "Player One"}
                <Badge variant="outline" className="bg-slate-900 border-slate-700 text-xs ml-2">
                  LVL {level}
                </Badge>
              </CardTitle>
              <CardDescription className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
                {characterClass} Class
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold font-mono">{xp}</span>
              <span className="text-slate-500 text-xs"> / {levelMaxXp} XP</span>
            </div>
          </div>
          
          {/* XP Bar */}
          <div className="relative h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Debug / Manual Controls */}
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/50 backdrop-blur-sm">
          <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-widest">Debug Console</p>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs border-slate-700 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-800"
              onClick={() => addXp(50)}
            >
              <Plus className="h-3 w-3 mr-1" /> XP
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs border-slate-700 hover:bg-slate-800"
              onClick={() => debugSetLevel(Math.max(1, level - 1))}
            >
              <Minus className="h-3 w-3 mr-1" /> Lvl
            </Button>

             <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs border-slate-700 hover:bg-slate-800"
              onClick={() => debugSetLevel(level + 1)}
            >
              <Plus className="h-3 w-3 mr-1" /> Lvl
            </Button>

            <div className="w-px h-6 bg-slate-800 mx-1" />

            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setCharacterClass("Disruptor")}>
              <Zap className="h-4 w-4 text-purple-500" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setCharacterClass("Builder")}>
              <Hammer className="h-4 w-4 text-orange-500" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setCharacterClass("Scaler")}>
              <Rocket className="h-4 w-4 text-blue-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
