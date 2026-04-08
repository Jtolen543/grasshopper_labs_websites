export interface CompanyQuery {
  requiredSkills: string[];
  preferredSkills: string[];
  targetRoles: string[];
  minGpa?: number;
  targetYearsInSchool: number[];
  industry: string;
}

export interface StudentProfile {
  id: string;
  major: string;
  gpa: number;
  yearInSchool: number; // 1-4
  skills: {
    programmingLanguages: string[];
    frameworks: string[];
    databases: string[];
    devops: string[];
  };
  projects: {
    technologies: string[];
    roleCategories: string[]; // e.g., "Web", "Data/ML", "Mobile"
  }[];
  resumeScore: number; // Baseline XYZ score 0-100
  lastActiveDaysAgo: number;
  resumeUrl?: string;
}

export interface MatchResult {
  score: number; // 0-100
  breakdown: {
    skillsMatch: number;      // max 40
    projectRelevance: number; // max 30
    academicAlignment: number;// max 15
    resumeQuality: number;    // max 10
    recencyBonus: number;     // max 5
  };
  topMatchingSkills: string[];
}

export function calculateMatchScore(query: CompanyQuery, student: StudentProfile): MatchResult {
  let score = 0;
  
  // Flatten student skills
  const studentSkills = [
    ...student.skills.programmingLanguages,
    ...student.skills.frameworks,
    ...student.skills.databases,
    ...student.skills.devops,
  ].map(s => s.toLowerCase());

  // 1. Hard Skills Match (Max 40 points)
  let skillsScore = 0;
  const topMatchingSkills: string[] = [];
  
  if (query.requiredSkills.length > 0) {
    let reqMatches = 0;
    query.requiredSkills.forEach(req => {
      if (studentSkills.includes(req.toLowerCase())) {
        reqMatches++;
        topMatchingSkills.push(req);
      }
    });
    // Required skills are worth 30 of the 40 points
    skillsScore += (reqMatches / query.requiredSkills.length) * 30;
  } else {
    skillsScore += 30; // Default if no strict requirements
  }

  if (query.preferredSkills.length > 0) {
    let prefMatches = 0;
    query.preferredSkills.forEach(pref => {
      if (studentSkills.includes(pref.toLowerCase())) {
        prefMatches++;
        topMatchingSkills.push(pref);
      }
    });
    // Preferred skills are worth 10 of the 40 points
    skillsScore += (prefMatches / query.preferredSkills.length) * 10;
  } else {
    skillsScore += 10;
  }
  
  score += skillsScore;

  // 2. Project Context & Relevance (Max 30 points)
  // Map target roles to relevant categories to see if projects align
  const roleToCategories: Record<string, string[]> = {
    "Frontend Developer": ["Web"],
    "Backend Developer": ["Web", "Data/ML"],
    "Data Scientist": ["Data/ML"],
    "Mobile Developer": ["Mobile"],
    "Full Stack Developer": ["Web", "Data/ML"]
  };

  const targetCategories = new Set<string>();
  query.targetRoles.forEach(role => {
    roleToCategories[role]?.forEach(cat => targetCategories.add(cat));
  });

  let projectScore = 0;
  if (student.projects.length > 0 && targetCategories.size > 0) {
    let relevantProjects = 0;
    student.projects.forEach(proj => {
      const isRelevant = proj.roleCategories.some(cat => targetCategories.has(cat));
      if (isRelevant) relevantProjects++;
    });
    
    // Scale project score. Max 30 points for having a high ratio of relevant projects
    const ratio = relevantProjects / student.projects.length;
    // Base 10 points for having projects, up to 20 points for ratio
    projectScore = 10 + (ratio * 20);
  } else if (student.projects.length > 0) {
    projectScore = 20; // Good general experience
  }
  
  score += projectScore;

  // 3. Academic Alignment (Max 15 points)
  let academicScore = 0;
  // Year check (7.5 pts)
  if (query.targetYearsInSchool.includes(student.yearInSchool)) {
    academicScore += 7.5;
  } else if (query.targetYearsInSchool.length === 0) {
    academicScore += 7.5;
  } else {
    // Partial credit if close (e.g., Sophomore when looking for Junior)
    const closestTarget = Math.min(...query.targetYearsInSchool.map(y => Math.abs(y - student.yearInSchool)));
    if (closestTarget === 1) academicScore += 3;
  }

  // GPA check (7.5 pts)
  const minGpa = query.minGpa || 0;
  if (student.gpa >= minGpa) {
    academicScore += 5; // Meets minimum
    // Marginal boost up to 2.5 pts for exceeding
    const exceedAmt = student.gpa - minGpa;
    let boost = Math.min(2.5, exceedAmt * 2); // E.g., 0.5 over = 1pt boost
    academicScore += boost;
  } else {
     // Penalize if below min GPA
     academicScore += Math.max(0, 5 - ((minGpa - student.gpa) * 10));
  }
  
  score += academicScore;

  // 4. Resume Quality (Max 10 points)
  const resumeQuality = (student.resumeScore / 100) * 10;
  score += resumeQuality;

  // 5. Activity & Recency Bonus (Max 5 points)
  // Ensures scores aren't identical. Formula adds small fractional points.
  let recencyBonus = 0;
  if (student.lastActiveDaysAgo <= 1) recencyBonus = 5.0;           // Extremely active
  else if (student.lastActiveDaysAgo <= 7) recencyBonus = 4.2;      // Active this week
  else if (student.lastActiveDaysAgo <= 14) recencyBonus = 3.1;     // Active recently
  else if (student.lastActiveDaysAgo <= 30) recencyBonus = 1.5;     // Active this month
  
  // Inject fractional micro-modifier based on ID (simulated deterministic randomness for extreme edge cases)
  const microMod = (student.id.charCodeAt(0) % 100) / 1000; // between 0.000 and 0.099
  recencyBonus += microMod;
  
  score += recencyBonus;

  // Cap at 99.99 max to keep it realistic
  const finalScore = Math.min(99.99, score);

  return {
    score: Number(finalScore.toFixed(2)),
    breakdown: {
      skillsMatch: Number(skillsScore.toFixed(2)),
      projectRelevance: Number(projectScore.toFixed(2)),
      academicAlignment: Number(academicScore.toFixed(2)),
      resumeQuality: Number(resumeQuality.toFixed(2)),
      recencyBonus: Number(recencyBonus.toFixed(2)),
    },
    topMatchingSkills: Array.from(new Set(topMatchingSkills)).slice(0, 5),
  };
}
