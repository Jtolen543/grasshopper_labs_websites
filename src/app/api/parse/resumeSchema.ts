import * as z from "zod";

export const BasicsSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
  }),
  linkedin: z.string(),
  github: z.string(),
  portfolio: z.string(),
});

export const EducationItemSchema = z.object({
  school: z.string(),
  degree: z.string(),
  field: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  gpa: z.number(),
  achievements: z.array(z.string()),
});

export const SkillsSchema = z.object({
  programming_languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  libraries: z.array(z.string()),
  databases: z.array(z.string()),
  devops_tools: z.array(z.string()),
  cloud_platforms: z.array(z.string()),
  other: z.array(z.string()),
});

export const ProjectItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  highlights: z.array(z.string()),
  link: z.string(),
  github: z.string(),
});

export const ExperienceItemSchema = z.object({
  company: z.string(),
  position: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  location: z.string(),
  responsibilities: z.array(z.string()),
  achievements: z.array(z.string()),
  technologies: z.array(z.string()),
});

export const AchievementItemSchema = z.object({
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  description: z.string(),
});

export const CertificationItemSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  credential_id: z.string(),
  url: z.string(),
});

export const PublicationItemSchema = z.object({
  title: z.string(),
  publisher: z.string(),
  date: z.string(),
  url: z.string(),
  summary: z.string(),
});

export const ExtracurricularItemSchema = z.object({
  organization: z.string(),
  role: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  achievements: z.array(z.string()),
});

const ResumeSchema = z.object({
  basics: BasicsSchema,
  education: z.array(EducationItemSchema),
  skills: SkillsSchema,
  projects: z.array(ProjectItemSchema),
  experience: z.array(ExperienceItemSchema),
  achievements: z.array(AchievementItemSchema),
  certifications: z.array(CertificationItemSchema),
  publications: z.array(PublicationItemSchema),
  extracurriculars: z.array(ExtracurricularItemSchema),
});

export function getResumeObject() {
  const resume = ResumeSchema.parse({
    basics: {
      name: "",
      email: "",
      phone: "",
      location: { city: "", state: "", country: "" },
      linkedin: "",
      github: "",
      portfolio: "",
    },
    education: [],
    skills: {
      programming_languages: [],
      frameworks: [],
      libraries: [],
      databases: [],
      devops_tools: [],
      cloud_platforms: [],
      other: [],
    },
    projects: [],
    experience: [],
    achievements: [],
    certifications: [],
    publications: [],
    extracurriculars: [],
  });
  return resume;
}

export type Resume = z.infer<typeof ResumeSchema>
export default ResumeSchema