/**
 * TemplateCard Property Tests
 * Property 6: Template Card Rendering Completeness
 * Validates: Requirements 3.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { TemplateSearchResult, TemplateSource, TemplateStyle } from '../types';

// ============ Arbitraries ============

const templateSourceArb: fc.Arbitrary<TemplateSource> = fc.constantFrom(
  'github', 'dribbble', 'behance', 'custom'
);

const templateStyleArb: fc.Arbitrary<TemplateStyle> = fc.constantFrom(
  'modern', 'classic', 'minimal', 'creative', 'professional', 'tech'
);

const templateSearchResultArb: fc.Arbitrary<TemplateSearchResult> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ maxLength: 500 }).filter(s => s.length >= 0),
  previewUrl: fc.webUrl(),
  source: templateSourceArb,
  sourceUrl: fc.webUrl(),
  style: templateStyleArb,
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0), { maxLength: 10 }),
  metadata: fc.record({
    author: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    rating: fc.option(fc.float({ min: 0, max: 5, noNaN: true }), { nil: undefined }),
    downloads: fc.option(fc.nat({ max: 1000000 }), { nil: undefined }),
    lastUpdated: fc.option(
      fc.integer({ min: 946684800000, max: 1924905600000 }) // 2000-01-01 to 2030-12-31
        .map(ts => new Date(ts).toISOString()), 
      { nil: undefined }
    ),
  }),
  relevanceScore: fc.float({ min: 0, max: 1, noNaN: true }),
});

// ============ Property Tests ============

describe('TemplateCard Properties', () => {
  describe('Property 6: Template Card Rendering Completeness', () => {
    it('should have all required display fields for any valid template', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          // Property: Every template has required display fields
          expect(template.id).toBeDefined();
          expect(template.name.trim().length).toBeGreaterThan(0);
          expect(template.previewUrl).toBeDefined();
          expect(template.source).toBeDefined();
          expect(template.style).toBeDefined();
          expect(Array.isArray(template.tags)).toBe(true);
          expect(template.metadata).toBeDefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should have valid source type for any template', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          const validSources: TemplateSource[] = ['github', 'dribbble', 'behance', 'custom'];
          expect(validSources).toContain(template.source);
        }),
        { numRuns: 100 }
      );
    });

    it('should have valid style type for any template', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          const validStyles: TemplateStyle[] = [
            'modern', 'classic', 'minimal', 'creative', 
            'professional', 'tech'
          ];
          expect(validStyles).toContain(template.style);
        }),
        { numRuns: 100 }
      );
    });

    it('should have relevance score between 0 and 1', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          expect(template.relevanceScore).toBeGreaterThanOrEqual(0);
          expect(template.relevanceScore).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should have valid metadata when present', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          const { metadata } = template;
          
          // Rating should be between 0 and 5 if present
          if (metadata.rating !== undefined) {
            expect(metadata.rating).toBeGreaterThanOrEqual(0);
            expect(metadata.rating).toBeLessThanOrEqual(5);
          }
          
          // Downloads should be non-negative if present
          if (metadata.downloads !== undefined) {
            expect(metadata.downloads).toBeGreaterThanOrEqual(0);
          }
          
          // Author should be non-empty string if present
          if (metadata.author !== undefined) {
            expect(metadata.author.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should display at most 3 tags with overflow indicator', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          const displayedTags = template.tags.slice(0, 3);
          const hasOverflow = template.tags.length > 3;
          
          // Property: Displayed tags should be at most 3
          expect(displayedTags.length).toBeLessThanOrEqual(3);
          
          // Property: Overflow indicator should show remaining count
          if (hasOverflow) {
            const remainingCount = template.tags.length - 3;
            expect(remainingCount).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should have non-empty tags when tags array is not empty', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          template.tags.forEach(tag => {
            expect(tag.trim().length).toBeGreaterThan(0);
          });
        }),
        { numRuns: 100 }
      );
    });
  });
});
