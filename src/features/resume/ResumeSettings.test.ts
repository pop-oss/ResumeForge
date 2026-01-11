/**
 * Property-Based Tests for Resume Settings Configuration
 * 
 * Feature: template-field-editing
 * Property 5: Configuration Persistence Round-Trip
 * Validates: Requirements 2.5, 3.3, 6.5, 7.4
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { ResumeSettings, FieldOrderConfig, FieldVisibilityConfig, TemplateType } from './types';
import { DEFAULT_FIELD_ORDER } from './data';

// Arbitrary generators for field order config
const fieldOrderConfigArb = fc.record({
  basics: fc.shuffledSubarray(DEFAULT_FIELD_ORDER.basics, { minLength: DEFAULT_FIELD_ORDER.basics.length, maxLength: DEFAULT_FIELD_ORDER.basics.length }),
  experience: fc.shuffledSubarray(DEFAULT_FIELD_ORDER.experience, { minLength: DEFAULT_FIELD_ORDER.experience.length, maxLength: DEFAULT_FIELD_ORDER.experience.length }),
  education: fc.shuffledSubarray(DEFAULT_FIELD_ORDER.education, { minLength: DEFAULT_FIELD_ORDER.education.length, maxLength: DEFAULT_FIELD_ORDER.education.length }),
  projects: fc.shuffledSubarray(DEFAULT_FIELD_ORDER.projects, { minLength: DEFAULT_FIELD_ORDER.projects.length, maxLength: DEFAULT_FIELD_ORDER.projects.length }),
  skills: fc.shuffledSubarray(DEFAULT_FIELD_ORDER.skills, { minLength: DEFAULT_FIELD_ORDER.skills.length, maxLength: DEFAULT_FIELD_ORDER.skills.length }),
}) as fc.Arbitrary<FieldOrderConfig>;

// Arbitrary generators for field visibility config
const fieldVisibilityConfigArb = fc.record({
  basics: fc.record({
    name: fc.boolean(),
    title: fc.boolean(),
    email: fc.boolean(),
    phone: fc.boolean(),
    city: fc.boolean(),
    website: fc.boolean(),
    linkedin: fc.boolean(),
    github: fc.boolean(),
  }),
  experience: fc.record({
    company: fc.boolean(),
    role: fc.boolean(),
    city: fc.boolean(),
    dateRange: fc.boolean(),
    highlights: fc.boolean(),
  }),
  education: fc.record({
    school: fc.boolean(),
    degree: fc.boolean(),
    major: fc.boolean(),
    dateRange: fc.boolean(),
    highlights: fc.boolean(),
  }),
  projects: fc.record({
    name: fc.boolean(),
    techStack: fc.boolean(),
    highlights: fc.boolean(),
    link: fc.boolean(),
  }),
  skills: fc.record({
    name: fc.boolean(),
    items: fc.boolean(),
  }),
}) as fc.Arbitrary<FieldVisibilityConfig>;

// Arbitrary generator for template type
const templateTypeArb = fc.constantFrom<TemplateType>(
  'classic', 'modern', 'minimal', 'elegant', 'creative', 'professional', 'executive', 'tech'
);

// Arbitrary generator for ResumeSettings
const resumeSettingsArb = fc.record({
  template: templateTypeArb,
  themeColor: fc.tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  ).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`),
  fontScale: fc.constantFrom(80, 100, 120),
  lineHeight: fc.double({ min: 1.0, max: 2.0, noNaN: true }),
  sectionVisibility: fc.record({
    basics: fc.boolean(),
    summary: fc.boolean(),
    experience: fc.boolean(),
    education: fc.boolean(),
    projects: fc.boolean(),
    skills: fc.boolean(),
    custom: fc.boolean(),
  }),
  sectionOrder: fc.shuffledSubarray(
    ['basics', 'summary', 'experience', 'education', 'projects', 'skills', 'custom'],
    { minLength: 7, maxLength: 7 }
  ),
  fieldOrder: fieldOrderConfigArb,
  fieldVisibility: fieldVisibilityConfigArb,
  editMode: fc.boolean(),
}) as fc.Arbitrary<ResumeSettings>;

describe('Property 5: Configuration Persistence Round-Trip', () => {
  /**
   * For any valid ResumeSettings including fieldOrder and fieldVisibility,
   * saving to localStorage (JSON.stringify) and then loading (JSON.parse)
   * should produce an equivalent configuration object.
   */
  it('should preserve ResumeSettings through JSON serialization round-trip', () => {
    fc.assert(
      fc.property(resumeSettingsArb, (settings) => {
        // Serialize to JSON (simulating localStorage.setItem)
        const serialized = JSON.stringify(settings);
        
        // Deserialize from JSON (simulating localStorage.getItem)
        const deserialized = JSON.parse(serialized) as ResumeSettings;
        
        // Verify all fields are preserved
        expect(deserialized.template).toBe(settings.template);
        expect(deserialized.themeColor).toBe(settings.themeColor);
        expect(deserialized.fontScale).toBe(settings.fontScale);
        expect(deserialized.lineHeight).toBeCloseTo(settings.lineHeight, 10);
        expect(deserialized.editMode).toBe(settings.editMode);
        
        // Verify sectionVisibility
        expect(deserialized.sectionVisibility).toEqual(settings.sectionVisibility);
        
        // Verify sectionOrder
        expect(deserialized.sectionOrder).toEqual(settings.sectionOrder);
        
        // Verify fieldOrder - each section's field order should be preserved
        expect(deserialized.fieldOrder.basics).toEqual(settings.fieldOrder.basics);
        expect(deserialized.fieldOrder.experience).toEqual(settings.fieldOrder.experience);
        expect(deserialized.fieldOrder.education).toEqual(settings.fieldOrder.education);
        expect(deserialized.fieldOrder.projects).toEqual(settings.fieldOrder.projects);
        expect(deserialized.fieldOrder.skills).toEqual(settings.fieldOrder.skills);
        
        // Verify fieldVisibility - each section's field visibility should be preserved
        expect(deserialized.fieldVisibility.basics).toEqual(settings.fieldVisibility.basics);
        expect(deserialized.fieldVisibility.experience).toEqual(settings.fieldVisibility.experience);
        expect(deserialized.fieldVisibility.education).toEqual(settings.fieldVisibility.education);
        expect(deserialized.fieldVisibility.projects).toEqual(settings.fieldVisibility.projects);
        expect(deserialized.fieldVisibility.skills).toEqual(settings.fieldVisibility.skills);
      }),
      { numRuns: 20 }
    );
  });

  it('should preserve fieldOrder array order through serialization', () => {
    fc.assert(
      fc.property(fieldOrderConfigArb, (fieldOrder) => {
        const serialized = JSON.stringify(fieldOrder);
        const deserialized = JSON.parse(serialized) as FieldOrderConfig;
        
        // Array order must be exactly preserved
        expect(deserialized.basics).toEqual(fieldOrder.basics);
        expect(deserialized.experience).toEqual(fieldOrder.experience);
        expect(deserialized.education).toEqual(fieldOrder.education);
        expect(deserialized.projects).toEqual(fieldOrder.projects);
        expect(deserialized.skills).toEqual(fieldOrder.skills);
      }),
      { numRuns: 20 }
    );
  });

  it('should preserve fieldVisibility boolean values through serialization', () => {
    fc.assert(
      fc.property(fieldVisibilityConfigArb, (fieldVisibility) => {
        const serialized = JSON.stringify(fieldVisibility);
        const deserialized = JSON.parse(serialized) as FieldVisibilityConfig;
        
        // All boolean values must be exactly preserved
        expect(deserialized).toEqual(fieldVisibility);
      }),
      { numRuns: 20 }
    );
  });
});
