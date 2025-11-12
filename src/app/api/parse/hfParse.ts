import type { Resume } from './resumeSchema';
import { pipeline } from '@xenova/transformers';

// Real HuggingFace NER-based resume parser using machine learning models
// Uses BERT-based Named Entity Recognition to identify entities and structure them

let nerPipeline: any = null;

async function getNERPipeline() {
  if (!nerPipeline) {
    console.log('Loading HuggingFace NER model (Xenova/bert-base-NER)...');
    nerPipeline = await pipeline('token-classification', 'Xenova/bert-base-NER');
    console.log('NER model loaded successfully');
  }
  return nerPipeline;
}

// Aggregate consecutive entities
function aggregateEntities(nerResults: any[]): any[] {
  const aggregated: any[] = [];
  let current: any = null;

  for (const result of nerResults) {
    const entity = result.entity.replace(/^[BI]-/, '');
    
    if (result.entity.startsWith('B-') || !current || current.entity !== entity) {
      if (current) aggregated.push(current);
      current = {
        entity,
        word: result.word,
        score: result.score,
        start: result.start,
        end: result.end
      };
    } else {
      current.word += result.word.startsWith('##') ? result.word.substring(2) : ' ' + result.word;
      current.end = result.end;
      current.score = Math.max(current.score, result.score);
    }
  }
  
  if (current) aggregated.push(current);
  return aggregated;
}

function findSection(text: string, keywords: string[]): string {
  const lines = text.split('\n');
  let sectionStart = -1;
  let sectionEnd = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (keywords.some(keyword => line.includes(keyword))) {
      sectionStart = i;
      break;
    }
  }

  if (sectionStart === -1) return '';

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

function extractEmail(text: string): string {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : '';
}

function extractPhone(text: string): string {
  const phoneRegex = /(\+\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0] : '';
}

function extractLinkedIn(text: string): string {
  const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9-]+)/gi;
  const matches = text.match(linkedinRegex);
  return matches ? 'https://' + matches[0] : '';
}

function extractGitHub(text: string): string {
  const githubRegex = /(github\.com\/[a-zA-Z0-9-]+)/gi;
  const matches = text.match(githubRegex);
  return matches ? 'https://' + matches[0] : '';
}

function extractGPA(text: string): number {
  const lowerText = text.toLowerCase();
  
  const gpaPattern1 = /(?:gpa|g\.p\.a\.?)[:\s]+(\d\.\d+)/i;
  const match1 = text.match(gpaPattern1);
  if (match1) {
    return parseFloat(match1[1]);
  }
  
  const gpaPattern2 = /(\d\.\d+)\s*\/\s*(\d\.\d+)/;
  const match2 = text.match(gpaPattern2);
  if (match2 && lowerText.includes('gpa')) {
    return parseFloat(match2[1]);
  }
  
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

// Extract name using NER to find PERSON entities
function extractNameWithNER(text: string, entities: any[]): string {
  const personEntities = entities.filter((e: any) => 
    e.entity === 'PER' && 
    e.start < 300 &&
    e.score > 0.8
  );
  
  if (personEntities.length > 0) {
    return personEntities[0].word.trim();
  }
  
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (!line.includes('@') && line.length > 5 && line.length < 50) {
      return line;
    }
  }
  
  return lines[0]?.trim() || '';
}

// Extract location using NER to find LOCATION entities
function extractLocationWithNER(text: string, entities: any[]): { city: string; state: string; country: string } {
  const locationEntities = entities.filter((e: any) => 
    e.entity === 'LOC' && 
    e.start < 500 &&
    e.score > 0.7
  );
  
  if (locationEntities.length > 0) {
    const location = locationEntities[0].word.trim();
    const match = location.match(/([A-Z][a-z]+),\s*([A-Z]{2})/);
    if (match) {
      return {
        city: match[1],
        state: match[2],
        country: 'USA'
      };
    }
    return {
      city: location,
      state: '',
      country: ''
    };
  }
  
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

// Extract education using NER to identify organizations (schools)
function extractEducationWithNER(text: string, entities: any[]) {
  const educationSection = findSection(text, ['education', 'academic']);
  if (!educationSection) return [];
  
  const lines = educationSection.split('\n').filter(line => line.trim().length > 0);
  const education: any[] = [];
  let currentEdu: any = null;
  
  const orgEntities = entities.filter((e: any) => 
    e.entity === 'ORG' && 
    educationSection.includes(e.word) &&
    e.score > 0.7
  );

  for (const line of lines) {
    const trimmed = line.trim();
    
    const hasOrgEntity = orgEntities.some(org => trimmed.includes(org.word));
    const hasSchoolKeyword = /university|college|institute|school/i.test(trimmed);
    
    if (hasOrgEntity || hasSchoolKeyword) {
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

function extractSkills(text: string) {
  const skillsSection = findSection(text, ['skills', 'technical skills', 'technologies']);
  
  const languageKeywords = ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'php', 'sql', 'r', 'matlab'];
  const frameworkKeywords = ['react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', 'fastapi', '.net'];
  const databaseKeywords = ['mongodb', 'postgresql', 'mysql', 'redis', 'dynamodb', 'cassandra', 'oracle', 'sqlite', 'firebase'];
  const cloudKeywords = ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify'];
  const devopsKeywords = ['docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible', 'ci/cd'];
  
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

function extractExperienceWithNER(text: string, entities: any[]) {
  const experienceSection = findSection(text, ['experience', 'work experience', 'employment']);
  if (!experienceSection) return [];
  
  const lines = experienceSection.split('\n').filter(line => line.trim().length > 0);
  const experience: any[] = [];
  let currentExp: any = null;
  
  const orgEntities = entities.filter((e: any) => 
    e.entity === 'ORG' && 
    experienceSection.includes(e.word) &&
    e.score > 0.7
  );

  for (const line of lines) {
    const trimmed = line.trim();
    
    const hasOrgEntity = orgEntities.some(org => trimmed.includes(org.word));
    const looksLikeCompany = /^[A-Z][a-zA-Z\s&,]+$/.test(trimmed) && trimmed.length < 60;
    
    if (hasOrgEntity || looksLikeCompany) {
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

function extractProjects(text: string) {
  const projectsSection = findSection(text, ['projects', 'personal projects', 'project experience']);
  if (!projectsSection) return [];
  
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

export async function extractWithHuggingFace(content: string): Promise<{ details: Resume | null; missing: string[] }> {
  try {
    console.log('Starting HuggingFace NER extraction with BERT model...');
    console.log('Text length:', content.length);
    
    const ner = await getNERPipeline();
    
    const textToAnalyze = content.slice(0, 5000);
    console.log('Running NER model on text...');
    const nerResults = await ner(textToAnalyze);
    console.log(`Found ${nerResults.length} entity tokens`);
    
    const entities = aggregateEntities(nerResults);
    console.log(`Aggregated into ${entities.length} entities`);
    entities.slice(0, 10).forEach((e: any) => {
      console.log(`  - ${e.entity}: "${e.word}" (score: ${e.score.toFixed(2)})`);
    });
    
    const name = extractNameWithNER(content, entities);
    const email = extractEmail(content);
    const phone = extractPhone(content);
    const location = extractLocationWithNER(content, entities);
    const linkedin = extractLinkedIn(content);
    const github = extractGitHub(content);

    console.log('Extracted basics with NER:', { name, email, phone, location });

    const education = extractEducationWithNER(content, entities);
    const skills = extractSkills(content);
    const experience = extractExperienceWithNER(content, entities);
    const projects = extractProjects(content);

    console.log('Extracted sections:', { 
      education: education.length, 
      experience: experience.length, 
      projects: projects.length 
    });

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

    console.log('HuggingFace NER extraction complete');
    
    const missing: string[] = [];
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (education.length === 0) missing.push('education');
    
    return { details: resume, missing };
  } catch (error) {
    console.error('Error in HuggingFace extraction:', error);
    return { 
      details: null, 
      missing: [`HuggingFace parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}
