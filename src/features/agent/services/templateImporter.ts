/**
 * Template Importer Service
 * 模板导入服务 - 负责将外部模板转换为系统 ResumeData 格式
 * 
 * Features:
 * - Convert external templates to ResumeData format
 * - Validate converted data against schema
 * - Support multiple template formats (HTML, JSON, React)
 */

import type { 
  TemplateSearchResult, 
  ExternalTemplate, 
  AgentError 
} from '../types';
import type { 
  ResumeData, 
  ResumeBasics, 
  ResumeSettings,
  TemplateType 
} from '../../resume/types';
import { v4 as uuidv4 } from 'uuid';

// ============ Default Values ============

const DEFAULT_BASICS: ResumeBasics = {
  name: '',
  title: '',
  email: '',
  phone: '',
  city: '',
};

const DEFAULT_SETTINGS: ResumeSettings = {
  template: 'classic',
  themeColor: '#2563eb',
  fontScale: 100,
  lineHeight: 1.5,
  sectionVisibility: {
    basics: true,
    summary: true,
    experience: true,
    education: true,
    projects: true,
    skills: true,
  },
  sectionOrder: ['basics', 'summary', 'experience', 'education', 'projects', 'skills'],
};

// ============ Validation ============

/**
 * Validate ResumeBasics structure
 */
function validateBasics(basics: unknown): basics is ResumeBasics {
  if (!basics || typeof basics !== 'object') return false;
  const b = basics as Record<string, unknown>;
  return (
    typeof b.name === 'string' &&
    typeof b.title === 'string' &&
    typeof b.email === 'string' &&
    typeof b.phone === 'string' &&
    typeof b.city === 'string'
  );
}

/**
 * Validate ResumeSettings structure
 */
function validateSettings(settings: unknown): settings is ResumeSettings {
  if (!settings || typeof settings !== 'object') return false;
  const s = settings as Record<string, unknown>;
  return (
    typeof s.template === 'string' &&
    typeof s.themeColor === 'string' &&
    typeof s.fontScale === 'number' &&
    typeof s.lineHeight === 'number' &&
    s.sectionVisibility !== undefined &&
    Array.isArray(s.sectionOrder)
  );
}

/**
 * Validate complete ResumeData structure
 * Property 7: Converted data SHALL pass schema validation
 */
export function validateResumeData(data: unknown): data is ResumeData {
  if (!data || typeof data !== 'object') return false;
  
  const d = data as Record<string, unknown>;
  
  // Check required fields
  if (!validateBasics(d.basics)) return false;
  if (typeof d.summary !== 'string') return false;
  if (!Array.isArray(d.experience)) return false;
  if (!Array.isArray(d.education)) return false;
  if (!Array.isArray(d.projects)) return false;
  if (!Array.isArray(d.skills)) return false;
  if (!Array.isArray(d.custom)) return false;
  if (!validateSettings(d.settings)) return false;
  
  return true;
}

// ============ Template Style Mapping ============

/**
 * Map external template style to internal TemplateType
 */
function mapStyleToTemplate(style: string): TemplateType {
  const styleMap: Record<string, TemplateType> = {
    'classic': 'classic',
    'modern': 'modern',
    'minimal': 'minimal',
    'creative': 'creative',
    'professional': 'professional',
    'tech': 'tech',
    'elegant': 'elegant',
    'executive': 'executive',
  };
  
  return styleMap[style.toLowerCase()] || 'classic';
}

// ============ Conversion Functions ============

/**
 * Convert JSON template data to ResumeData
 */
function convertJsonTemplate(json: Record<string, unknown>): ResumeData {
  // Try to extract data from common JSON resume formats
  const basics: ResumeBasics = {
    name: (json.name as string) || (json.basics as Record<string, unknown>)?.name as string || '',
    title: (json.title as string) || (json.label as string) || (json.basics as Record<string, unknown>)?.label as string || '',
    email: (json.email as string) || (json.basics as Record<string, unknown>)?.email as string || '',
    phone: (json.phone as string) || (json.basics as Record<string, unknown>)?.phone as string || '',
    city: (json.city as string) || (json.location as string) || 
          ((json.basics as Record<string, unknown>)?.location as Record<string, unknown>)?.city as string || '',
    website: (json.website as string) || (json.url as string) || (json.basics as Record<string, unknown>)?.url as string,
    github: (json.github as string),
    linkedin: (json.linkedin as string),
  };
  
  const summary = (json.summary as string) || 
                  (json.basics as Record<string, unknown>)?.summary as string || 
                  '';
  
  // Convert experience/work
  const rawWork = (json.experience as unknown[]) || (json.work as unknown[]) || [];
  const experience = rawWork.map((item: unknown) => {
    const w = item as Record<string, unknown>;
    return {
      id: uuidv4(),
      company: (w.company as string) || (w.name as string) || '',
      role: (w.role as string) || (w.position as string) || '',
      city: (w.city as string) || (w.location as string) || '',
      start: (w.start as string) || (w.startDate as string) || '',
      end: (w.end as string) || (w.endDate as string) || '',
      current: (w.current as boolean) || false,
      highlights: (w.highlights as string[]) || [],
    };
  });
  
  // Convert education
  const rawEducation = (json.education as unknown[]) || [];
  const education = rawEducation.map((item: unknown) => {
    const e = item as Record<string, unknown>;
    return {
      id: uuidv4(),
      school: (e.school as string) || (e.institution as string) || '',
      major: (e.major as string) || (e.area as string) || (e.studyType as string) || '',
      degree: (e.degree as string) || '',
      start: (e.start as string) || (e.startDate as string) || '',
      end: (e.end as string) || (e.endDate as string) || '',
      highlights: (e.highlights as string[]) || [],
    };
  });
  
  // Convert projects
  const rawProjects = (json.projects as unknown[]) || [];
  const projects = rawProjects.map((item: unknown) => {
    const p = item as Record<string, unknown>;
    return {
      id: uuidv4(),
      name: (p.name as string) || '',
      link: (p.link as string) || (p.url as string),
      techStack: (p.techStack as string[]) || (p.keywords as string[]) || [],
      highlights: (p.highlights as string[]) || (p.description as string)?.split('\n') || [],
    };
  });
  
  // Convert skills
  const rawSkills = (json.skills as unknown[]) || [];
  const skills = rawSkills.map((item: unknown) => {
    const s = item as Record<string, unknown>;
    return {
      id: uuidv4(),
      name: (s.name as string) || (s.category as string) || '',
      items: (s.items as string[]) || (s.keywords as string[]) || [],
    };
  });
  
  // Determine template style
  const templateStyle = mapStyleToTemplate((json.style as string) || 'classic');
  const themeColor = (json.themeColor as string) || '#2563eb';
  
  return {
    basics,
    summary,
    experience,
    education,
    projects,
    skills,
    custom: [],
    settings: {
      ...DEFAULT_SETTINGS,
      template: templateStyle,
      themeColor,
    },
  };
}

/**
 * Create empty ResumeData with template style applied
 */
function createEmptyResumeWithStyle(style: string, themeColor?: string): ResumeData {
  return {
    basics: { ...DEFAULT_BASICS },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    custom: [],
    settings: {
      ...DEFAULT_SETTINGS,
      template: mapStyleToTemplate(style),
      themeColor: themeColor || DEFAULT_SETTINGS.themeColor,
    },
  };
}

// ============ Main Conversion Function ============

/**
 * Convert external template to ResumeData format
 * Property 7: For any valid ExternalTemplate, SHALL produce valid ResumeData
 */
export function convertToResumeData(
  template: TemplateSearchResult,
  externalData?: ExternalTemplate
): { data: ResumeData | null; error: AgentError | null } {
  try {
    let resumeData: ResumeData;
    
    if (externalData?.json) {
      // Convert from JSON format
      resumeData = convertJsonTemplate(externalData.json);
    } else {
      // Create empty resume with template style
      resumeData = createEmptyResumeWithStyle(template.style);
    }
    
    // Apply template metadata
    resumeData.settings.template = mapStyleToTemplate(template.style);
    
    // Validate the result
    if (!validateResumeData(resumeData)) {
      return {
        data: null,
        error: {
          type: 'CONVERSION_ERROR',
          message: 'Converted data failed validation',
          recoverable: true,
        },
      };
    }
    
    return { data: resumeData, error: null };
  } catch (error) {
    console.error('Template conversion failed:', error);
    return {
      data: null,
      error: {
        type: 'CONVERSION_ERROR',
        message: 'Failed to convert template',
        details: error,
        recoverable: true,
      },
    };
  }
}

/**
 * Fetch external template data from source URL
 */
export async function fetchExternalTemplate(
  template: TemplateSearchResult
): Promise<{ data: ExternalTemplate | null; error: AgentError | null }> {
  try {
    // For GitHub sources, try to fetch resume.json or similar
    if (template.source === 'github' && template.sourceUrl) {
      // Try common resume data file locations
      const possibleUrls = [
        template.sourceUrl.replace('github.com', 'raw.githubusercontent.com') + '/main/resume.json',
        template.sourceUrl.replace('github.com', 'raw.githubusercontent.com') + '/master/resume.json',
        template.sourceUrl.replace('github.com', 'raw.githubusercontent.com') + '/main/data.json',
      ];
      
      for (const url of possibleUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const json = await response.json();
            return {
              data: {
                json,
                format: 'json',
                sourceUrl: template.sourceUrl,
              },
              error: null,
            };
          }
        } catch {
          // Try next URL
        }
      }
    }
    
    // Return null data (will use empty template)
    return { data: null, error: null };
  } catch (error) {
    console.warn('Failed to fetch external template:', error);
    return {
      data: null,
      error: {
        type: 'NETWORK_ERROR',
        message: 'Failed to fetch template data',
        details: error,
        recoverable: true,
      },
    };
  }
}

/**
 * Import template: fetch external data and convert to ResumeData
 */
export async function importTemplate(
  template: TemplateSearchResult
): Promise<{ data: ResumeData | null; error: AgentError | null }> {
  // Try to fetch external data
  const { data: externalData } = await fetchExternalTemplate(template);
  
  // Convert to ResumeData
  return convertToResumeData(template, externalData || undefined);
}
