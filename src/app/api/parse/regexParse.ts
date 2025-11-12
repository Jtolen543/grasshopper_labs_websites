import type { Resume } from './resumeSchema';

// Enhanced regex-based parser with sophisticated section detection and pattern matching
// Uses rule-based extraction to identify resume sections and extract structured data

// Helper to find sections in text
function findSection(text: string, keywords: string[]): string {
  const lines = text.split('\n');
  let sectionStart = -1;
  let sectionEnd = lines.length;

  // Find section start
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (keywords.some(keyword => line.includes(keyword))) {
      sectionStart = i;
      break;
    }
  }

  if (sectionStart === -1) return '';

  // Find section end (next section header)
  const sectionHeaders = [
    'education', 'experience', 'work', 'skills', 'projects', 
    'achievements', 'certifications', 'publications', 'activities',
    'summary', 'objective'
  ];

  for (let i = sectionStart + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (sectionHeaders.some(header => line === header || line.startsWith(header + ':'))) {
      sectionEnd = i;
      break;
    }
  }

  return lines.slice(sectionStart + 1, sectionEnd).join('\n');
}

// Extract email using regex
function extractEmail(text: string): string {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : '';
}

// Extract phone using regex
function extractPhone(text: string): string {
  const phoneRegex = /(\+\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0] : '';
}

// Extract LinkedIn
function extractLinkedIn(text: string): string {
  const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9-]+)/gi;
  const matches = text.match(linkedinRegex);
  return matches ? 'https://' + matches[0] : '';
}

// Extract GitHub
function extractGitHub(text: string): string {
  const githubRegex = /(github\.com\/[a-zA-Z0-9-]+)/gi;
  const matches = text.match(githubRegex);
  return matches ? 'https://' + matches[0] : '';
}

// Extract name from first few lines
function extractName(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  // Usually name is in first 3 lines and is the longest non-email line
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (!line.includes('@') && line.length > 5 && line.length < 50) {
      return line;
    }
  }
  return lines[0]?.trim() || '';
}

// Extract location
function extractLocation(text: string): { city: string; state: string; country: string } {
  const locationRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})/;
  const match = text.match(locationRegex);
  
  if (match) {
    return {
      city: match[1] || '',
      state: match[2] || '',
      country: 'USA'
    };
  }
  
  return { city: '', state: '', country: '' };
}

// Helper function to extract GPA from text
function extractGPA(text: string): number {
  const lowerText = text.toLowerCase();
  
  // Pattern 1: "GPA: 3.8" or "GPA 3.8" or "G.P.A: 3.8"
  const gpaPattern1 = /(?:gpa|g\.p\.a\.?)[:\s]+(\d\.\d+)/i;
  const match1 = text.match(gpaPattern1);
  if (match1) {
    return parseFloat(match1[1]);
  }
  
  // Pattern 2: "3.8/4.0" or "3.75 / 4.0" (GPA with scale)
  const gpaPattern2 = /(\d\.\d+)\s*\/\s*(\d\.\d+)/;
  const match2 = text.match(gpaPattern2);
  if (match2 && lowerText.includes('gpa')) {
    return parseFloat(match2[1]);
  }
  
  // Pattern 3: Just "3.8" on a line that mentions GPA
  if (lowerText.includes('gpa') || lowerText.includes('grade')) {
    const numberMatch = text.match(/(\d\.\d+)/);
    if (numberMatch) {
      const num = parseFloat(numberMatch[1]);
      if (num >= 0 && num <= 5) {
        return num;
      }
    }
  }
  
  return 0;
}

// Extract education
function extractEducation(text: string) {
  const educationSection = findSection(text, ['education', 'academic']);
  const lines = educationSection.split('\n').filter(line => line.trim().length > 0);
  
  const education: any[] = [];
  let currentEdu: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (/university|college|institute|school/i.test(trimmed)) {
      if (currentEdu) education.push(currentEdu);
      currentEdu = {
        school: trimmed,
        degree: '',
        field: '',
        start_date: '',
        end_date: '',
        gpa: 0,
        achievements: []
      };
    } else if (currentEdu && /bachelor|master|phd|b\.s\.|m\.s\.|b\.a\.|m\.a\./i.test(trimmed)) {
      currentEdu.degree = trimmed;
    } else if (currentEdu && /\d{4}/.test(trimmed)) {
      const years = trimmed.match(/\d{4}/g);
      if (years && years.length >= 1) {
        currentEdu.start_date = years[0];
        currentEdu.end_date = years[years.length - 1];
      }
    } else if (currentEdu && /gpa|grade|g\.p\.a/i.test(trimmed)) {
      const gpa = extractGPA(trimmed);
      if (gpa > 0) {
        currentEdu.gpa = gpa;
      }
    }
  }
  
  if (currentEdu) education.push(currentEdu);
  return education;
}

// Extract skills
function extractSkills(text: string) {
  const skillsSection = findSection(text, ['skills', 'technical skills', 'technologies']);
  
  const languageKeywords = ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'php', 'sql'];
  const frameworkKeywords = ['react', 'angular', 'vue', 'next.js', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', 'fastapi'];
  const databaseKeywords = ['mongodb', 'postgresql', 'mysql', 'redis', 'dynamodb', 'cassandra', 'oracle', 'sqlite'];
  const cloudKeywords = ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify'];
  const devopsKeywords = ['docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible'];
  
  const skills = {
    programming_languages: [] as string[],
    frameworks: [] as string[],
    libraries: [] as string[],
    databases: [] as string[],
    devops_tools: [] as string[],
    cloud_platforms: [] as string[],
    other: [] as string[]
  };

  const lowerText = skillsSection.toLowerCase();
  
  languageKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.programming_languages.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  frameworkKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.frameworks.push(skill);
    }
  });
  
  databaseKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.databases.push(skill);
    }
  });
  
  cloudKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.cloud_platforms.push(skill);
    }
  });
  
  devopsKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.devops_tools.push(skill);
    }
  });

  return skills;
}

// Extract experience
function extractExperience(text: string) {
  const experienceSection = findSection(text, ['experience', 'work experience', 'employment']);
  const lines = experienceSection.split('\n').filter(line => line.trim().length > 0);
  
  const experience: any[] = [];
  let currentExp: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (/^[A-Z][a-zA-Z\s&,]+$/.test(trimmed) && trimmed.length < 60) {
      if (currentExp) experience.push(currentExp);
      currentExp = {
        company: trimmed,
        position: '',
        start_date: '',
        end_date: '',
        location: '',
        responsibilities: [],
        achievements: [],
        technologies: []
      };
    } else if (currentExp && /\d{4}/.test(trimmed) && !currentExp.start_date) {
      const dateMatch = trimmed.match(/(\w+\s\d{4})\s*[-–—]\s*(\w+\s\d{4}|Present)/i);
      if (dateMatch) {
        currentExp.start_date = dateMatch[1];
        currentExp.end_date = dateMatch[2];
      }
    } else if (currentExp && (trimmed.startsWith('•') || trimmed.startsWith('-') || /^[A-Z]/.test(trimmed))) {
      const bullet = trimmed.replace(/^[•\-]\s*/, '');
      if (bullet.length > 10) {
        currentExp.responsibilities.push(bullet);
      }
    }
  }
  
  if (currentExp) experience.push(currentExp);
  return experience;
}

// Extract projects
function extractProjects(text: string) {
  const projectsSection = findSection(text, ['projects', 'personal projects', 'project experience']);
  const lines = projectsSection.split('\n').filter(line => line.trim().length > 0);
  
  const projects: any[] = [];
  let currentProject: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (/^[A-Z][a-zA-Z\s\-]+$/.test(trimmed) && trimmed.length < 50) {
      if (currentProject) projects.push(currentProject);
      currentProject = {
        name: trimmed,
        description: '',
        technologies: [],
        highlights: [],
        link: '',
        github: ''
      };
    } else if (currentProject) {
      if (/technologies|built with|stack/i.test(trimmed)) {
        const techMatch = trimmed.match(/[:;]\s*(.+)/);
        if (techMatch) {
          currentProject.technologies = techMatch[1].split(/[,;]/).map((t: string) => t.trim());
        }
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        currentProject.highlights.push(trimmed.replace(/^[•\-]\s*/, ''));
      } else if (!currentProject.description && trimmed.length > 20) {
        currentProject.description = trimmed;
      }
      
      if (trimmed.includes('github.com')) {
        const githubMatch = trimmed.match(/(github\.com\/[a-zA-Z0-9\-_/]+)/);
        if (githubMatch) currentProject.github = 'https://' + githubMatch[1];
      }
    }
  }
  
  if (currentProject) projects.push(currentProject);
  return projects;
}

export function extractWithRegex(content: string): { details: Resume | null; missing: string[] } {
  try {
    console.log('Starting enhanced regex extraction...');
    
    const name = extractName(content);
    const email = extractEmail(content);
    const phone = extractPhone(content);
    const location = extractLocation(content);
    const linkedin = extractLinkedIn(content);
    const github = extractGitHub(content);

    const education = extractEducation(content);
    const skills = extractSkills(content);
    const experience = extractExperience(content);
    const projects = extractProjects(content);

    const resume: Resume = {
      basics: {
        name,
        email,
        phone,
        location,
        linkedin,
        github,
        portfolio: ''
      },
      education,
      skills,
      experience,
      projects,
      achievements: [],
      certifications: [],
      publications: [],
      extracurriculars: []
    };

    console.log('Enhanced regex extraction complete');
    
    const missing: string[] = [];
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (education.length === 0) missing.push('education');
    
    return { details: resume, missing };
  } catch (error) {
    console.error('Error in regex extraction:', error);
    return { 
      details: null, 
      missing: [`Regex parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}
