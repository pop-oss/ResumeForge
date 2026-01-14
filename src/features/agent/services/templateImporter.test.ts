/**
 * Property Tests for Template Importer
 * Feature: smart-template-search
 * 
 * Property 7: Template Conversion Produces Valid ResumeData
 * Validates: Requirements 4.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateResumeData,
  convertToResumeData,
} from './templateImporter';
import type { TemplateSearchResult, ExternalTemplate, TemplateStyle, TemplateSource } from '../types';

// ============ Test Arbitraries ============

const templateStyleArb = fc.constantFrom<TemplateStyle>('classic', 'modern', 'minimal', 'creative', 'professional', 'tech');
const templateSourceArb = fc.constantFrom<TemplateSource>('github', 'dribbble', 'behance', 'custom');

const templateSearchResultArb: fc.Arbitrary<TemplateSearchResult> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  previewUrl: fc.constant('https://example.com/preview.png'),
  sourceUrl: fc.constant('https://example.com/source'),
  source: templateSourceArb,
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
  style: templateStyleArb,
  relevanceScore: fc.float({ min: 0, max: 1, noNaN: true }),
  metadata: fc.record({
    author: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    license: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
    downloads: fc.option(fc.nat({ max: 10000 }), { nil: undefined }),
    rating: fc.option(fc.float({ min: 0, max: 5, noNaN: true }), { nil: undefined }),
  }),
});

// JSON Resume format arbitrary
const jsonResumeArb = fc.record({
  name: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  title: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  phone: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  city: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
  summary: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  experience: fc.option(
    fc.array(
      fc.record({
        company: fc.string({ minLength: 1, maxLength: 50 }),
        role: fc.string({ minLength: 1, maxLength: 50 }),
        start: fc.constant('2020-01'),
        end: fc.constant('2023-01'),
        highlights: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 3 }),
      }),
      { minLength: 0, maxLength: 3 }
    ),
    { nil: undefined }
  ),
  education: fc.option(
    fc.array(
      fc.record({
        school: fc.string({ minLength: 1, maxLength: 50 }),
        major: fc.string({ minLength: 1, maxLength: 50 }),
        degree: fc.string({ minLength: 1, maxLength: 30 }),
        start: fc.constant('2016-09'),
        end: fc.constant('2020-06'),
      }),
      { minLength: 0, maxLength: 2 }
    ),
    { nil: undefined }
  ),
  skills: fc.option(
    fc.array(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 30 }),
        items: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
      }),
      { minLength: 0, maxLength: 3 }
    ),
    { nil: undefined }
  ),
  style: fc.option(templateStyleArb, { nil: undefined }),
  themeColor: fc.option(fc.string({ minLength: 6, maxLength: 6 }).filter(s => /^[0-9a-fA-F]+$/.test(s)).map(s => `#${s}`), { nil: undefined }),
});

const externalTemplateArb: fc.Arbitrary<ExternalTemplate> = fc.record({
  json: fc.option(jsonResumeArb as fc.Arbitrary<Record<string, unknown>>, { nil: undefined }),
  html: fc.option(fc.string({ minLength: 0, maxLength: 1000 }), { nil: undefined }),
  css: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  format: fc.constantFrom('html', 'json', 'react'),
  sourceUrl: fc.constant('https://example.com/template'),
});

// ============ Tests ============

describe('Template Importer Property Tests', () => {
  describe('validateResumeData', () => {
    it('should validate correct ResumeData structure', () => {
      const validData = {
        basics: {
          name: 'John Doe',
          title: 'Developer',
          email: 'john@example.com',
          phone: '123-456-7890',
          city: 'New York',
        },
        summary: 'A passionate developer',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        custom: [],
        settings: {
          template: 'classic',
          themeColor: '#2563eb',
          fontScale: 100,
          lineHeight: 1.5,
          sectionVisibility: { basics: true },
          sectionOrder: ['basics'],
        },
      };
      
      expect(validateResumeData(validData)).toBe(true);
    });

    it('should reject invalid data', () => {
      const invalidCases = [
        null,
        undefined,
        {},
        { basics: null },
        { basics: { name: 123 } }, // wrong type
        { basics: { name: 'John' } }, // missing required fields
      ];
      
      for (const invalid of invalidCases) {
        expect(validateResumeData(invalid)).toBe(false);
      }
    });
  });

  describe('Property 7: Template Conversion Produces Valid ResumeData', () => {
    it('for any TemplateSearchResult without external data, should produce valid ResumeData', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          const { data, error } = convertToResumeData(template);
          
          // Should either succeed with valid data or fail with error
          if (error) {
            expect(error.type).toBeDefined();
            expect(error.message).toBeDefined();
          } else {
            expect(data).not.toBeNull();
            expect(validateResumeData(data)).toBe(true);
            
            // Verify structure
            expect(data!.basics).toBeDefined();
            expect(data!.summary).toBeDefined();
            expect(Array.isArray(data!.experience)).toBe(true);
            expect(Array.isArray(data!.education)).toBe(true);
            expect(Array.isArray(data!.projects)).toBe(true);
            expect(Array.isArray(data!.skills)).toBe(true);
            expect(Array.isArray(data!.custom)).toBe(true);
            expect(data!.settings).toBeDefined();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('for any TemplateSearchResult with JSON external data, should produce valid ResumeData', () => {
      fc.assert(
        fc.property(
          templateSearchResultArb,
          externalTemplateArb,
          (template, externalData) => {
            const { data, error } = convertToResumeData(template, externalData);
            
            if (error) {
              expect(error.type).toBeDefined();
            } else {
              expect(data).not.toBeNull();
              expect(validateResumeData(data)).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);

    it('converted data should have template style from input', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          const { data, error } = convertToResumeData(template);
          
          if (!error && data) {
            // Style should be mapped from template
            const validStyles = ['classic', 'modern', 'minimal', 'creative', 'professional', 'tech', 'elegant', 'executive'];
            expect(validStyles).toContain(data.settings.template);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('converted data should have valid settings', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          const { data, error } = convertToResumeData(template);
          
          if (!error && data) {
            // Settings should have required fields
            expect(typeof data.settings.template).toBe('string');
            expect(typeof data.settings.themeColor).toBe('string');
            expect(typeof data.settings.fontScale).toBe('number');
            expect(typeof data.settings.lineHeight).toBe('number');
            expect(data.settings.sectionVisibility).toBeDefined();
            expect(Array.isArray(data.settings.sectionOrder)).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('converted data arrays should contain valid items', () => {
      fc.assert(
        fc.property(
          templateSearchResultArb,
          externalTemplateArb,
          (template, externalData) => {
            const { data, error } = convertToResumeData(template, externalData);
            
            if (!error && data) {
              // Experience items should have required fields
              for (const exp of data.experience) {
                expect(typeof exp.id).toBe('string');
                expect(typeof exp.company).toBe('string');
                expect(typeof exp.role).toBe('string');
              }
              
              // Education items should have required fields
              for (const edu of data.education) {
                expect(typeof edu.id).toBe('string');
                expect(typeof edu.school).toBe('string');
              }
              
              // Skills should have required fields
              for (const skill of data.skills) {
                expect(typeof skill.id).toBe('string');
                expect(typeof skill.name).toBe('string');
                expect(Array.isArray(skill.items)).toBe(true);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);
  });

  describe('Edge Cases', () => {
    it('should handle empty JSON data', () => {
      const template: TemplateSearchResult = {
        id: '1',
        name: 'Test',
        description: '',
        previewUrl: 'https://example.com/preview.png',
        sourceUrl: 'https://example.com',
        source: 'github',
        tags: [],
        style: 'modern',
        relevanceScore: 0.5,
        metadata: {},
      };
      
      const externalData: ExternalTemplate = {
        json: {},
        format: 'json',
        sourceUrl: 'https://example.com',
      };
      
      const { data, error } = convertToResumeData(template, externalData);
      
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(validateResumeData(data)).toBe(true);
    });

    it('should handle JSON Resume format (basics object)', () => {
      const template: TemplateSearchResult = {
        id: '1',
        name: 'Test',
        description: '',
        previewUrl: 'https://example.com/preview.png',
        sourceUrl: 'https://example.com',
        source: 'github',
        tags: [],
        style: 'modern',
        relevanceScore: 0.5,
        metadata: {},
      };
      
      const externalData: ExternalTemplate = {
        json: {
          basics: {
            name: 'John Doe',
            label: 'Developer',
            email: 'john@example.com',
            phone: '123-456-7890',
            location: { city: 'New York' },
            summary: 'A developer',
          },
          work: [
            {
              name: 'Company',
              position: 'Engineer',
              startDate: '2020-01',
              endDate: '2023-01',
              highlights: ['Did stuff'],
            },
          ],
        },
        format: 'json',
        sourceUrl: 'https://example.com',
      };
      
      const { data, error } = convertToResumeData(template, externalData);
      
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.basics.name).toBe('John Doe');
      expect(data!.basics.title).toBe('Developer');
      expect(data!.experience.length).toBe(1);
    });
  });
});
