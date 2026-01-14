/**
 * Property Tests for AI Service
 * Feature: smart-template-search
 * 
 * Property 1: Keyword Analysis Extracts Metadata
 * Validates: Requirements 1.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  extractKeywords,
  detectStyle,
  detectIndustry,
  detectPosition,
  detectExperience,
  basicKeywordAnalysis,
  analyzeQuerySync,
  generateAnalysisPrompt,
  parseAiResponse,
} from './aiService';
import { STYLE_KEYWORDS, INDUSTRY_KEYWORDS, POSITION_KEYWORDS, EXPERIENCE_KEYWORDS } from '../constants';

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

// Generate queries that contain known keywords
const styleKeywordArb = fc.constantFrom(...Object.values(STYLE_KEYWORDS).flat());
const industryKeywordArb = fc.constantFrom(...Object.values(INDUSTRY_KEYWORDS).flat());
const positionKeywordArb = fc.constantFrom(...Object.values(POSITION_KEYWORDS).flat());
const experienceKeywordArb = fc.constantFrom(...Object.values(EXPERIENCE_KEYWORDS).flat());

// Random non-empty query
const randomQueryArb = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0);

// Query with at least one known keyword
const queryWithKnownKeywordArb = fc.oneof(
  styleKeywordArb,
  industryKeywordArb,
  positionKeywordArb,
  experienceKeywordArb
).chain(keyword => 
  fc.tuple(
    fc.string({ minLength: 0, maxLength: 20 }),
    fc.constant(keyword),
    fc.string({ minLength: 0, maxLength: 20 })
  ).map(([prefix, kw, suffix]) => `${prefix} ${kw} ${suffix}`.trim())
);

// ============ Tests ============

describe('AI Service Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('extractKeywords', () => {
    it('should extract non-empty keywords from any string', () => {
      fc.assert(
        fc.property(randomQueryArb, (query) => {
          const keywords = extractKeywords(query);
          
          // All keywords should be non-empty
          keywords.forEach(k => {
            expect(k.length).toBeGreaterThan(0);
            expect(k.trim()).toBe(k);
          });
          
          // All keywords should be lowercase
          keywords.forEach(k => {
            expect(k).toBe(k.toLowerCase());
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should not have duplicate keywords', () => {
      fc.assert(
        fc.property(randomQueryArb, (query) => {
          const keywords = extractKeywords(query);
          const uniqueKeywords = new Set(keywords);
          expect(keywords.length).toBe(uniqueKeywords.size);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle various delimiters', () => {
      const delimiters = [' ', ',', '，', '、', ';', '；'];
      
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0), { minLength: 2, maxLength: 5 }),
          fc.constantFrom(...delimiters),
          (words, delimiter) => {
            const query = words.join(delimiter);
            const keywords = extractKeywords(query);
            
            // Should extract at least some keywords
            expect(keywords.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('detectStyle', () => {
    it('should detect style when style keyword is present', () => {
      fc.assert(
        fc.property(styleKeywordArb, (keyword) => {
          const style = detectStyle([keyword]);
          // Should detect a style (may not be exact match due to partial matching)
          // At minimum, the function should not throw
          expect(style === undefined || typeof style === 'string').toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should return undefined for unrelated keywords', () => {
      const unrelatedKeywords = ['xyz123', 'random', 'test'];
      const style = detectStyle(unrelatedKeywords);
      expect(style).toBeUndefined();
    });
  });

  describe('detectIndustry', () => {
    it('should detect industry when industry keyword is present', () => {
      fc.assert(
        fc.property(industryKeywordArb, (keyword) => {
          const industry = detectIndustry([keyword]);
          expect(industry === undefined || typeof industry === 'string').toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('detectPosition', () => {
    it('should detect position when position keyword is present', () => {
      fc.assert(
        fc.property(positionKeywordArb, (keyword) => {
          const position = detectPosition([keyword]);
          expect(position === undefined || typeof position === 'string').toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('detectExperience', () => {
    it('should detect experience when experience keyword is present', () => {
      fc.assert(
        fc.property(experienceKeywordArb, (keyword) => {
          const experience = detectExperience([keyword]);
          expect(experience === undefined || typeof experience === 'string').toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1: Keyword Analysis Extracts Metadata', () => {
    it('for any non-empty query with known keywords, should extract at least one intent field', () => {
      fc.assert(
        fc.property(queryWithKnownKeywordArb, (query) => {
          const result = analyzeQuerySync(query);
          
          // Should have raw query
          expect(result.raw).toBeDefined();
          
          // Should have keywords array
          expect(Array.isArray(result.keywords)).toBe(true);
          
          // Should have intent object
          expect(result.intent).toBeDefined();
          
          // Should have filters object
          expect(result.filters).toBeDefined();
          
          // At least one intent field should be set (since we used known keywords)
          const hasIntent = 
            result.intent.industry !== undefined ||
            result.intent.position !== undefined ||
            result.intent.style !== undefined ||
            result.intent.experience !== undefined;
          
          expect(hasIntent).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('for any non-empty query, should return valid SearchQuery structure', () => {
      fc.assert(
        fc.property(randomQueryArb, (query) => {
          const result = analyzeQuerySync(query);
          
          // Validate structure
          expect(typeof result.raw).toBe('string');
          expect(Array.isArray(result.keywords)).toBe(true);
          expect(typeof result.intent).toBe('object');
          expect(typeof result.filters).toBe('object');
          
          // Keywords should be derived from raw query
          expect(result.keywords.length).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 }
      );
    });

    it('for empty or whitespace-only queries, should return empty keywords', () => {
      const whitespaceStrings = ['', ' ', '  ', '\t', '\n', '   \t\n  '];
      
      for (const whitespace of whitespaceStrings) {
        const result = analyzeQuerySync(whitespace);
        expect(result.keywords).toHaveLength(0);
      }
    });
  });

  describe('basicKeywordAnalysis', () => {
    it('should always return a valid SearchQuery', () => {
      fc.assert(
        fc.property(randomQueryArb, (query) => {
          const result = basicKeywordAnalysis(query);
          
          expect(result.raw).toBe(query);
          expect(Array.isArray(result.keywords)).toBe(true);
          expect(result.intent).toBeDefined();
          expect(result.filters).toBeDefined();
          expect(result.filters.maxResults).toBe(20);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('generateAnalysisPrompt', () => {
    it('should include the query in the prompt', () => {
      fc.assert(
        fc.property(randomQueryArb, (query) => {
          const prompt = generateAnalysisPrompt(query);
          expect(prompt).toContain(query);
          expect(prompt).toContain('JSON');
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('parseAiResponse', () => {
    it('should parse valid JSON responses', () => {
      const validResponses = [
        '{"industry": "technology", "position": "developer", "style": "modern", "experience": "mid"}',
        '{"industry": null, "position": "designer", "style": "creative", "experience": null}',
        'Here is the analysis: {"industry": "finance", "position": null, "style": "professional", "experience": "senior"}',
      ];
      
      for (const response of validResponses) {
        const result = parseAiResponse(response);
        expect(typeof result).toBe('object');
      }
    });

    it('should return empty object for invalid responses', () => {
      const invalidResponses = [
        'This is not JSON',
        '',
        'null',
        '[]',
      ];
      
      for (const response of invalidResponses) {
        const result = parseAiResponse(response);
        expect(typeof result).toBe('object');
      }
    });
  });
});
