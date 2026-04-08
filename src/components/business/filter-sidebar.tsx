"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Loader2, Save, X, Plus, GripVertical } from "lucide-react"
import { CompanyQuery } from "@/lib/business-matching"

interface FilterSidebarProps {
  initialQuery?: CompanyQuery
  onSearch: (query: Partial<CompanyQuery>) => void
}

export function FilterSidebar({ initialQuery, onSearch }: FilterSidebarProps) {
  const [loading, setLoading] = useState(false)
  const [gpa, setGpa] = useState([initialQuery?.minGpa || 3.0])
  const [role, setRole] = useState(initialQuery?.targetRoles?.[0] || "Frontend Engineer")
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set(initialQuery?.targetYearsInSchool || [3, 4]))
  
  const [skills, setSkills] = useState<string[]>(initialQuery?.requiredSkills || ["React", "TypeScript", "Next.js"])
  const [newSkill, setNewSkill] = useState("")

  const toggleYear = (year: number) => {
    const newSet = new Set(selectedYears)
    if (newSet.has(year)) newSet.delete(year)
    else newSet.add(year)
    setSelectedYears(newSet)
  }

  const handleSimulatedSearch = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onSearch({
        minGpa: gpa[0],
        requiredSkills: skills,
        targetRoles: [role],
        targetYearsInSchool: Array.from(selectedYears)
      })
    }, 1500)
  }

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ((e as React.KeyboardEvent).key === "Enter" || e.type === "click") {
      if (newSkill.trim() && !skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()])
        setNewSkill("")
      }
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  return (
    <Card className="w-full bg-background border-border shadow-sm sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> Strategy Config
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6"><Save className="h-3.5 w-3.5 text-muted-foreground" /></Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 overflow-y-auto flex-grow flex flex-col">
        <div className="p-5 space-y-6 flex-grow">
          
          {/* Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Role</label>
            <Input 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="font-semibold" 
            />
          </div>

          {/* Education Level */}
          <div className="space-y-3">
             <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Class Year</label>
             <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-muted/50 transition">
                  <Checkbox checked={selectedYears.has(3)} onCheckedChange={() => toggleYear(3)} />
                  <span className="text-sm font-medium">Junior</span>
                </label>
                <label className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-muted/50 transition">
                  <Checkbox checked={selectedYears.has(4)} onCheckedChange={() => toggleYear(4)} />
                  <span className="text-sm font-medium">Senior</span>
                </label>
                <label className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-muted/50 transition">
                  <Checkbox checked={selectedYears.has(2)} onCheckedChange={() => toggleYear(2)} />
                  <span className="text-sm font-medium">Sophomore</span>
                </label>
                <label className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-muted/50 transition">
                  <Checkbox checked={selectedYears.has(1)} onCheckedChange={() => toggleYear(1)} />
                  <span className="text-sm font-medium">Freshman</span>
                </label>
             </div>
          </div>

          {/* GPA Slider */}
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Min. GPA</label>
               <span className="text-sm font-semibold text-primary">{gpa[0].toFixed(1)}+</span>
             </div>
             <Slider 
               defaultValue={[3.2]} 
               max={4.0} 
               min={2.0} 
               step={0.1} 
               value={gpa}
               onValueChange={setGpa}
               className="py-2"
             />
             <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
               <span>2.0</span>
               <span>4.0</span>
             </div>
          </div>

          {/* Must Have Skills */}
          <div className="space-y-3">
             <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Required Core Skills</label>
             <div className="flex flex-wrap gap-2">
               {skills.map(skill => (
                 <Badge key={skill} variant="secondary" className="pl-2 pr-1 h-7 flex items-center gap-1 bg-muted/80">
                   {skill}
                   <div 
                     className="hover:bg-background rounded-full p-0.5 cursor-pointer"
                     onClick={() => removeSkill(skill)}
                   >
                     <X className="h-3 w-3" />
                   </div>
                 </Badge>
               ))}
               <Badge variant="outline" className="border-dashed p-0 overflow-hidden min-w-[100px] hover:border-primary/50 transition group">
                 <Input 
                   className="h-6 border-0 text-xs shadow-none focus-visible:ring-0 bg-transparent px-2 w-full placeholder:text-muted-foreground/60" 
                   placeholder="Add skill..." 
                   value={newSkill}
                   onChange={(e) => setNewSkill(e.target.value)}
                   onKeyDown={addSkill}
                 />
                 <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 rounded-none bg-muted/30 group-hover:text-primary" onClick={addSkill}>
                   <Plus className="h-3 w-3" />
                 </Button>
               </Badge>
             </div>
          </div>

        </div>

        {/* Action Bottom */}
        <div className="p-4 border-t bg-muted/10 mt-auto">
           <Button 
             className="w-full h-11 font-bold shadow-md relative overflow-hidden transition-all text-sm"
             onClick={handleSimulatedSearch}
             disabled={loading}
           >
             {loading ? (
               <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Querying Database...</>
             ) : (
               <><Search className="mr-2 h-4 w-4" /> Run Match Algorithm</>
             )}
           </Button>
           <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium uppercase tracking-widest">
             Cost: <span className="text-foreground">2 Credits</span>
           </p>
        </div>
      </CardContent>
    </Card>
  )
}
