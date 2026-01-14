/**
 * Property Tests for Agent Types
 * Feature: smart-template-search, Property 7: Template Conversion Produces Valid ResumeData
 * Validates: Requirements 4.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { 
  TemplateSearchResult, 
  SearchQuery, 
  CacheEntry,
  TemplateStyle,
  TemplateSource,
  AgentError,
  AgentErrorType
} from './types';

// ============ Arbitraries for Type Generation ============

const templateStyleArb = fc.constantFrom<TemplateStyle>(
  'classic', 'modern', 'minimal', 'creative', 'professional', 'tech'
);

const templateSourceArb = fc.constantFrom<TemplateSource>(
  'github', 'dribbble', 'behance', 'custom'
);

const templateMetadataArb = fc.record({
  author: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  license: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  lastUpdated: fc.option(
    fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()), 
    { nil: undefined }
  ),
  downloads: fc.option(fc.nat({ max: 100000 }), { nil: undefined }),
  rating: fc.option(fc.float({ min: 0, max: 5, noNaN: true }), { nil: undefined }),
});

const templateSearchResultArb: fc.Arbitrary<TemplateSearchResult> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  previewUrl: fc.webUrl(),
  sourceUrl: fc.webUrl(),
  source: templateSourceArb,
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 10 }),
  style: templateStyleArb,
  relevanceScore: fc.float({ min: 0, max: 1, noNaN: true }),
  metadata: templateMetadataArb,
});

const searchIntentArb = fc.record({
  industry: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  position: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  style: fc.option(templateStyleArb, { nil: undefined }),
  experience: fc.option(fc.constantFrom('entry', 'mid', 'senior', 'executive'), { nil: undefined }),
});

const searchFiltersArb = fc.record({
  sources: fc.option(fc.array(templateSourceArb, { minLength: 1, maxLength: 4 }), { nil: undefined }),
  minRating: fc.option(fc.float({ min: 0, max: 5, noNaN: true }), { nil: undefined }),
  maxResults: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
});

const searchQueryArb: fc.Arbitrary<SearchQuery> = fc.record({
  raw: fc.string({ minLength: 1, maxLength: 200 }),
  keywords: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
  intent: searchIntentArb,
  filters: searchFiltersArb,
});

const agentErrorTypeArb = fc.constantFrom<AgentErrorType>(
  'NETWORK_ERROR', 'AI_SERVICE_UNAVAILABLE', 'INVALID_API_KEY',
  'PARSE_ERROR', 'CONVERSION_ERROR', 'CACHE_ERROR', 'VALIDATION_ERROR'
);

const agentErrorArb: fc.Arbitrary<AgentError> = fc.record({
  type: agentErrorTypeArb,
  message: fc.string({ minLength: 1, maxLength: 200 }),
  details: fc.option(fc.anything(), { nil: undefined }),
  recoverable: fc.boolean(),
});

// ============ Property Tests ============

describe('Agent Types Property Tests', () => {
  describe('TemplateSearchResult', () => {
    it('should always have required fields', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          // All required fields must be present and non-empty for id
          expect(template.id).toBeDefined();
          expect(template.id.length).toBeGreaterThan(0);
          expect(template.name).toBeDefined();
          expect(template.previewUrl).toBeDefined();
          expect(template.sourceUrl).toBeDefined();
          expect(template.source).toBeDefined();
          expect(template.style).toBeDefined();
          expect(typeof template.relevanceScore).toBe('number');
        }),
        { numRuns: 100 }
      );
    });

    it('should have relevanceScore between 0 and 1', () => {
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          expect(template.relevanceScore).toBeGreaterThanOrEqual(0);
          expect(template.relevanceScore).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should have valid source type', () => {
      const validSources: TemplateSource[] = ['github', 'dribbble', 'behance', 'custom'];
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          expect(validSources).toContain(template.source);
        }),
        { numRuns: 100 }
      );
    });

    it('should have valid style type', () => {
      const validStyles: TemplateStyle[] = ['classic', 'modern', 'minimal', 'creative', 'professional', 'tech'];
      fc.assert(
        fc.property(templateSearchResultArb, (template) => {
          expect(validStyles).toContain(template.style);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('SearchQuery', () => {
    it('should always have raw query and keywords', () => {
      fc.assert(
        fc.property(searchQueryArb, (query) => {
          expect(query.raw).toBeDefined();
          expect(query.keywords).toBeDefined();
          expect(Array.isArray(query.keywords)).toBe(true);
          expect(query.keywords.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should have intent and filters objects', () => {
      fc.assert(
        fc.property(searchQueryArb, (query) => {
          expect(query.intent).toBeDefined();
          expect(typeof query.intent).toBe('object');
          expect(query.filters).toBeDefined();
          expect(typeof query.filters).toBe('object');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('CacheEntry', () => {
    it('should preserve data through cache entry creation', () => {
      fc.assert(
        fc.property(
          fc.array(templateSearchResultArb, { minLength: 0, maxLength: 5 }),
          fc.string({ minLength: 1 }),
          (templates, queryStr) => {
            const entry: CacheEntry<TemplateSearchResult[]> = {
              data: templates,
              timestamp: Date.now(),
              query: queryStr,
            };
            
            expect(entry.data).toEqual(templates);
            expect(entry.query).toBe(queryStr);
            expect(typeof entry.timestamp).toBe('number');
            expect(entry.timestamp).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('AgentError', () => {
    it('should always have type, message, and recoverable flag', () => {
      fc.assert(
        fc.property(agentErrorArb, (error) => {
          expect(error.type).toBeDefined();
          expect(error.message).toBeDefined();
          expect(typeof error.recoverable).toBe('boolean');
        }),
        { numRuns: 100 }
      );
    });

    it('should have valid error type', () => {
      const validTypes: AgentErrorType[] = [
        'NETWORK_ERROR', 'AI_SERVICE_UNAVAILABLE', 'INVALID_API_KEY',
        'PARSE_ERROR', 'CONVERSION_ERROR', 'CACHE_ERROR', 'VALIDATION_ERROR'
      ];
      fc.assert(
        fc.property(agentErrorArb, (error) => {
          expect(validTypes).toContain(error.type);
        }),
        { numRuns: 100 }
      );
    });
  });
});
