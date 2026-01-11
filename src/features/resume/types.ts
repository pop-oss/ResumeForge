export type SectionType =
    'basics' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'custom';

export type SectionVisibility = Record<SectionType | string, boolean>;
export type SectionOrder = string[];

export interface ResumeBasics {
    name: string;
    title: string;
    email: string;
    phone: string;
    city: string;
    website?: string;
    github?: string;
    linkedin?: string;
    avatarBase64?: string;
}

export interface ExperienceItem {
    id: string;
    company: string;
    role: string;
    city: string;
    start: string;
    end: string;
    current: boolean;
    highlights: string[];
}

export interface EducationItem {
    id: string;
    school: string;
    major: string;
    degree: string;
    start: string;
    end: string;
    highlights: string[];
}

export interface ProjectItem {
    id: string;
    name: string;
    link?: string;
    techStack: string[];
    highlights: string[];
}

export interface SkillGroup {
    id: string;
    name: string;
    items: string[];
}

export interface CustomSectionItem {
    id: string;
    title: string;
    subtitle?: string;
    date?: string;
    link?: string;
    items: string[];
}

export interface CustomSection {
    id: string;
    title: string;
    items: CustomSectionItem[];
}

export type TemplateType = 'classic' | 'modern' | 'minimal' | 'elegant' | 'creative' | 'professional' | 'executive' | 'tech';

export interface ResumeSettings {
    template: TemplateType;
    themeColor: string;
    fontScale: number; // 80, 100, 120
    lineHeight: number; // 1.2, 1.5, etc.
    sectionVisibility: SectionVisibility;
    sectionOrder: SectionOrder;
}

export interface ResumeData {
    basics: ResumeBasics;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    projects: ProjectItem[];
    skills: SkillGroup[];
    custom: CustomSection[];
    settings: ResumeSettings;
}
