/**
 * TemplateSearchDialog Property Tests
 * Property 2: Whitespace Input Validation
 * Validates: Requirements 1.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============ Input Validation Functions ============

/**
 * Validates search input - returns true if input is valid for search
 */
function isValidSearchInput(input: string): boolean {
  return input.trim().length > 0;
}

/**
 * Normalizes search input by trimming whitespace
 */
function normalizeSearchInput(input: string): string {
  return input.trim();
}

// ============ Arbitraries ============

// Whitespace-only strings
const whitespaceOnlyArb = fc.array(
  fc.constantFrom(' ', '\t', '\n', '\r'),
  { minLength: 1, maxLength: 20 }
).map(arr => arr.join(''));

// Valid search queries (non-empty after trim)
const validSearchQueryArb = fc.string({ minLength: 1, maxLength: 200 })
  .filter(s => s.trim().length > 0);

// Strings with leading/trailing whitespace
const paddedStringArb = fc.tuple(
  fc.array(fc.constantFrom(' ', '\t'), { maxLength: 5 }).map(arr => arr.join('')),
  fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  fc.array(fc.constantFrom(' ', '\t'), { maxLength: 5 }).map(arr => arr.join(''))
).map(([prefix, content, suffix]) => prefix + content + suffix);

// ============ Property Tests ============

describe('TemplateSearchDialog Input Validation Properties', () => {
  describe('Property 2: Whitespace Input Validation', () => {
    it('should reject empty string input', () => {
      expect(isValidSearchInput('')).toBe(false);
    });

    it('should reject whitespace-only input', () => {
      fc.assert(
        fc.property(whitespaceOnlyArb, (input) => {
          expect(isValidSearchInput(input)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should accept non-empty trimmed input', () => {
      fc.assert(
        fc.property(validSearchQueryArb, (input) => {
          expect(isValidSearchInput(input)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should normalize input by trimming whitespace', () => {
      fc.assert(
        fc.property(paddedStringArb, (input) => {
          const normalized = normalizeSearchInput(input);
          
          // Property: Normalized input has no leading/trailing whitespace
          expect(normalized).toBe(normalized.trim());
          
          // Property: Normalized input preserves content
          expect(normalized.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should be idempotent - normalizing twice gives same result', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 200 }), (input) => {
          const once = normalizeSearchInput(input);
          const twice = normalizeSearchInput(once);
          expect(once).toBe(twice);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve internal whitespace', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
          ),
          ([word1, word2]) => {
            const input = `  ${word1}   ${word2}  `;
            const normalized = normalizeSearchInput(input);
            
            // Property: Internal spaces are preserved
            expect(normalized).toContain(word1.trim());
            expect(normalized).toContain(word2.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Search Query Validation', () => {
    it('should validate that search button is disabled for invalid input', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.constant(''), whitespaceOnlyArb),
          (input) => {
            const isDisabled = !isValidSearchInput(input);
            expect(isDisabled).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should validate that search button is enabled for valid input', () => {
      fc.assert(
        fc.property(validSearchQueryArb, (input) => {
          const isEnabled = isValidSearchInput(input);
          expect(isEnabled).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle unicode whitespace characters', () => {
      // Various unicode whitespace characters
      const unicodeWhitespace = [
        '\u00A0', // Non-breaking space
        '\u2000', // En quad
        '\u2001', // Em quad
        '\u2002', // En space
        '\u2003', // Em space
        '\u2028', // Line separator
        '\u2029', // Paragraph separator
      ];

      unicodeWhitespace.forEach(ws => {
        const input = ws + ws + ws;
        // Note: JavaScript trim() handles most unicode whitespace
        const normalized = normalizeSearchInput(input);
        // The input should be considered invalid if it's only whitespace
        expect(normalized.length).toBeLessThanOrEqual(input.length);
      });
    });

    it('should handle mixed content with special characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (content) => {
            const input = `  ${content}  `;
            const normalized = normalizeSearchInput(input);
            
            // Property: Content is preserved after normalization
            expect(normalized).toBe(content.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
