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

// 自定义字段标签
export interface FieldLabels {
    // Section 标题
    sectionBasics?: string;      // 基本信息
    sectionSummary?: string;     // 个人简介
    sectionExperience?: string;  // 工作经历
    sectionEducation?: string;   // 教育背景
    sectionProjects?: string;    // 项目经历
    sectionSkills?: string;      // 专业技能
    sectionCustom?: string;      // 自定义模块
    
    // 基本信息字段
    name?: string;        // 姓名
    title?: string;       // 职位/求职意向
    email?: string;       // 邮箱
    phone?: string;       // 电话
    city?: string;        // 所在地
    website?: string;     // 个人网站
    github?: string;      // GitHub
    linkedin?: string;    // LinkedIn
    
    // 个人简介字段
    summary?: string;     // 个人简介
    
    // 教育背景字段
    school?: string;      // 学校
    major?: string;       // 专业
    degree?: string;      // 学位
    eduStart?: string;    // 开始时间
    eduEnd?: string;      // 结束时间
    eduHighlights?: string; // 荣誉/成就
    
    // 工作经历字段
    company?: string;     // 公司
    role?: string;        // 职位
    expCity?: string;     // 工作地点
    expStart?: string;    // 开始时间
    expEnd?: string;      // 结束时间
    expHighlights?: string; // 工作内容
    
    // 项目经历字段
    projectName?: string; // 项目名称
    projectLink?: string; // 项目链接
    techStack?: string;   // 技术栈
    projectHighlights?: string; // 项目描述
    
    // 技能字段
    skillCategory?: string; // 技能分类
    skillItems?: string;    // 技能项
}

// 元素位置信息（自由拖拽）- 保留用于特殊场景
export interface ElementPosition {
    x: number;
    y: number;
}

// 存储所有元素的位置
export type ElementPositions = Record<string, ElementPosition>;

// 模块内字段排序
// key 格式: "sectionId:itemId" 例如 "education:edu-1"
export type ItemFieldOrder = Record<string, string[]>;

// 字段排序配置 - 每个 section 的字段顺序
export interface FieldOrderConfig {
    basics?: string[];
    summary?: string[];
    experience?: string[];
    education?: string[];
    projects?: string[];
    skills?: string[];
    custom?: string[];
}

// 字段可见性配置 - 每个 section 的字段可见性
export interface FieldVisibilityConfig {
    basics?: Record<string, boolean>;
    summary?: Record<string, boolean>;
    experience?: Record<string, boolean>;
    education?: Record<string, boolean>;
    projects?: Record<string, boolean>;
    skills?: Record<string, boolean>;
    custom?: Record<string, boolean>;
}

export interface ResumeSettings {
    template: TemplateType;
    themeColor: string;
    fontScale: number; // 80, 100, 120
    lineHeight: number; // 1.2, 1.5, etc.
    sectionVisibility: SectionVisibility;
    sectionOrder: SectionOrder;
    fieldLabels?: FieldLabels; // 自定义字段标签
    editMode?: boolean; // 编辑模式
    elementPositions?: ElementPositions; // 元素自由拖拽位置
    itemFieldOrder?: ItemFieldOrder; // 模块内字段排序
    fieldOrder?: FieldOrderConfig; // 字段排序配置
    fieldVisibility?: FieldVisibilityConfig; // 字段可见性配置
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
