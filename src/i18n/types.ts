export type Language = 'en' | 'zh';

export interface Translations {
  // Header
  appTitle: string;
  classic: string;
  modern: string;
  minimal: string;
  professional: string;
  elegant: string;
  creative: string;
  executive: string;
  tech: string;
  import: string;
  export: string;
  downloadPDF: string;
  print: string;
  reset: string;

  // Editor sections
  basics: string;
  summary: string;
  experience: string;
  education: string;
  projects: string;
  skills: string;

  // Basics form
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  photo: string;
  uploadPhoto: string;
  removePhoto: string;

  // Experience form
  company: string;
  role: string;
  city: string;
  startDate: string;
  endDate: string;
  present: string;
  highlights: string;
  addExperience: string;

  // Education form
  school: string;
  degree: string;
  major: string;
  addEducation: string;
  highlightsDistinctions: string;

  // Projects form
  projectName: string;
  link: string;
  techStack: string;
  addProject: string;

  // Skills form
  categoryName: string;
  skillsCommaSeparated: string;
  addSkillGroup: string;

  // Summary form
  professionalSummary: string;
  summaryPlaceholder: string;

  // Preview section titles
  previewSummary: string;
  previewExperience: string;
  previewEducation: string;
  previewProjects: string;
  previewSkills: string;

  // Common
  onePerLine: string;
  optional: string;

  // Custom sections
  custom: string;
  newSection: string;
  sectionTitle: string;
  itemTitle: string;
  itemTitlePlaceholder: string;
  itemSubtitle: string;
  itemSubtitlePlaceholder: string;
  date: string;
  details: string;
  detailsPlaceholder: string;
  addItem: string;
  addCustomSection: string;
  previewCustom: string;
}
