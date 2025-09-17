export type Role = 'Software Engineer' | 'Data Scientist' | 'ML Engineer' | 'DevOps Engineer';
export type Industry = 'FinTech' | 'Healthcare' | 'Defense' | 'Tech' | 'Consulting';
export type Location = string;

export interface QuestionnaireData {
    role: Role;
    industry: Industry;
    location: Location;
}