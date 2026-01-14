/**
 * Property Tests for Template Search Service
 * Feature: smart-template-search
 * 
 * Property 3: Template Metadata Extraction
 * Property 4: Search Result Filtering Relevance
 * Property 5: Search Result Sorting Invariant
 * 
 * Validates: Requirements 2.2, 2.3, 2.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  parseTemplateData,
  calculateRelevanceScore,
  filterByRelevance,
  sortByRelevance,
  processSearchResults,
  searchTemplatesSync,
} from './templateSearchService';
import type { TemplateSearchResult, SearchQuery, TemplateSource, TemplateStyle } from '../types';
import { SEARCH_CONFIG } from '../constants';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// ============ Test Arbitraries ============

const templateSourceArb = fc.constantFrom<TemplateSource>('github', 'dribbble', 'behance', 'custom');
const templateStyleArb = fc.constantFrom<TemplateStyle>('classic', 'modern', 'minimal', 'creative', 'professional', 'tech');

const rawTemplateDataArb = fc.record({
  id: fc.option(fc.uuid(), { nil: undefined }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
  previewUrl: fc.option(fc.constant('https://example.com/preview.png'), { nil: undefined }),
  sourceUrl: fc.option(fc.constant('https://example.com/source'), { nil: undefined }),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
  author: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
  rating: fc.option(fc.float({ min: 0, max: 5, noNaN: true }), { nil: undefined }),
});

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

const searchQueryArb: fc.Arbitrary<SearchQuery> = fc.record({
  raw: fc.string({ minLength: 1, maxLength: 100 }),
  keywords: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
  intent: fc.record({
    industry: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    position: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    style: fc.option(templateStyleArb, { nil: undefined }),
    experience: fc.option(fc.constantFrom('entry', 'mid', 'senior', 'executive'), { nil: undefined }),
  }),
  filters: fc.record({
    sources: fc.option(fc.array(templateSourceArb, { minLength: 1, maxLength: 4 }), { nil: undefined }),
    minRating: fc.option(fc.float({ min: 0, max: 5, noNaN: true }), { nil: undefined }),
    maxResults: fc.option(fc.nat({ max: 50 }), { nil: undefined }),
  }),
});

// ============ Tests ============

describe('Template Search Service Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Property 3: Template Metadata Extraction', () => {
    it('for any valid raw data with name, should extract required fields', () => {
      fc.assert(
        fc.property(rawTemplateDataArb, templateSourceArb, (rawData, source) => {
          const result = parseTemplateData(rawData as Record<string, unknown>, source);
          
          if (rawData.name && rawData.name.length > 0) {
            // Should successfully parse
            expect(result).not.toBeNull();
            
            if (result) {
              // Required fields must be present
              expect(result.id).toBeDefined();
              expect(result.id.length).toBeGreaterThan(0);
              expect(result.name).toBeDefined();
              expect(result.name.length).toBeGreaterThan(0);
              expect(result.previewUrl).toBeDefined();
              expect(result.sourceUrl).toBeDefined();
              expect(result.source).toBe(source);
              
              // Style should be valid
              const validStyles: TemplateStyle[] = ['classic', 'modern', 'minimal', 'creative', 'professional', 'tech'];
              expect(validStyles).toContain(result.style);
              
              // Tags should be an array
              expect(Array.isArray(result.tags)).toBe(true);
              
              // Metadata should be an object
              expect(typeof result.metadata).toBe('object');
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should return null for data without name', () => {
      const dataWithoutName = { id: '123', description: 'test' };
      const result = parseTemplateData(dataWithoutName, 'github');
      expect(result).toBeNull();
    });
  });

  describe('Property 4: Search Result Filtering Relevance', () => {
    it('all filtered results should have relevanceScore > minRelevanceScore', () => {
      fc.assert(
        fc.property(
          fc.array(templateSearchResultArb, { minLength: 0, maxLength: 20 }),
          fc.float({ min: 0, max: 1, noNaN: true }),
          (templates, minScore) => {
            const filtered = filterByRelevance(templates, minScore);
            
            // All filtered results should have score > minScore
            for (const template of filtered) {
              expect(template.relevanceScore).toBeGreaterThan(minScore);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use default minRelevanceScore when not specified', () => {
      fc.assert(
        fc.property(
          fc.array(templateSearchResultArb, { minLength: 0, maxLength: 20 }),
          (templates) => {
            const filtered = filterByRelevance(templates);
            
            for (const template of filtered) {
              expect(template.relevanceScore).toBeGreaterThan(SEARCH_CONFIG.minRelevanceScore);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Search Result Sorting Invariant', () => {
    it('sorted output should be in descending order by relevanceScore', () => {
      fc.assert(
        fc.property(
          fc.array(templateSearchResultArb, { minLength: 0, maxLength: 20 }),
          (templates) => {
            const sorted = sortByRelevance(templates);
            
            // Check descending order
            for (let i = 0; i < sorted.length - 1; i++) {
              expect(sorted[i].relevanceScore).toBeGreaterThanOrEqual(sorted[i + 1].relevanceScore);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('sorting should preserve all elements', () => {
      fc.assert(
        fc.property(
          fc.array(templateSearchResultArb, { minLength: 0, maxLength: 20 }),
          (templates) => {
            const sorted = sortByRelevance(templates);
            
            // Same length
            expect(sorted.length).toBe(templates.length);
            
            // All original IDs should be present
            const originalIds = new Set(templates.map(t => t.id));
            const sortedIds = new Set(sorted.map(t => t.id));
            expect(sortedIds).toEqual(originalIds);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('sorting should not modify original array', () => {
      fc.assert(
        fc.property(
          fc.array(templateSearchResultArb, { minLength: 1, maxLength: 10 }),
          (templates) => {
            const originalOrder = templates.map(t => t.id);
            sortByRelevance(templates);
            const afterOrder = templates.map(t => t.id);
            
            expect(afterOrder).toEqual(originalOrder);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should return score between 0 and 1', () => {
      fc.assert(
        fc.property(templateSearchResultArb, searchQueryArb, (template, query) => {
          const score = calculateRelevanceScore(template, query);
          
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should give higher score when style matches', () => {
      const template: TemplateSearchResult = {
        id: '1',
        name: 'Test Template',
        description: '',
        previewUrl: 'https://example.com/preview.png',
        sourceUrl: 'https://example.com',
        source: 'github',
        tags: [],
        style: 'modern',
        relevanceScore: 0,
        metadata: {},
      };
      
      const queryWithMatchingStyle: SearchQuery = {
        raw: 'modern resume',
        keywords: ['modern', 'resume'],
        intent: { style: 'modern' },
        filters: {},
      };
      
      const queryWithDifferentStyle: SearchQuery = {
        raw: 'classic resume',
        keywords: ['classic', 'resume'],
        intent: { style: 'classic' },
        filters: {},
      };
      
      const scoreMatching = calculateRelevanceScore(template, queryWithMatchingStyle);
      const scoreDifferent = calculateRelevanceScore(template, queryWithDifferentStyle);
      
      expect(scoreMatching).toBeGreaterThan(scoreDifferent);
    });
  });

  describe('processSearchResults', () => {
    it('should apply scoring, filtering, and sorting', () => {
      fc.assert(
        fc.property(
          fc.array(templateSearchResultArb, { minLength: 0, maxLength: 20 }),
          searchQueryArb,
          (templates, query) => {
            const processed = processSearchResults(templates, query);
            
            // Should be sorted in descending order
            for (let i = 0; i < processed.length - 1; i++) {
              expect(processed[i].relevanceScore).toBeGreaterThanOrEqual(processed[i + 1].relevanceScore);
            }
            
            // All should have score > minRelevanceScore
            for (const template of processed) {
              expect(template.relevanceScore).toBeGreaterThan(SEARCH_CONFIG.minRelevanceScore);
            }
            
            // Should respect maxResults
            expect(processed.length).toBeLessThanOrEqual(SEARCH_CONFIG.maxResults);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('searchTemplatesSync', () => {
    it('should return results for any non-empty query', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (query) => {
            const results = searchTemplatesSync(query);
            
            // Should return an array
            expect(Array.isArray(results)).toBe(true);
            
            // Results should be sorted
            for (let i = 0; i < results.length - 1; i++) {
              expect(results[i].relevanceScore).toBeGreaterThanOrEqual(results[i + 1].relevanceScore);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
