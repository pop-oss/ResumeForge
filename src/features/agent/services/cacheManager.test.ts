/**
 * Property Tests for Cache Manager
 * Feature: smart-template-search
 * 
 * Property 8: Cache Stores Fetched Templates
 * Property 9: Cache Returns Results Within TTL
 * Property 10: Cache Invalidates Expired Entries
 * Property 11: Cache LRU Eviction
 * 
 * Validates: Requirements 5.1, 5.3, 5.4, 5.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  getCachedResults,
  setCachedResults,
  invalidateCache,
  clearCache,
  normalizeQuery,
  isExpired,
  hasCache,
  getCachedQueries,
  loadCacheStore,
} from './cacheManager';
import type { TemplateSearchResult, CacheConfig, CacheEntry } from '../types';

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

const templateSearchResultArb: fc.Arbitrary<TemplateSearchResult> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  previewUrl: fc.constant('https://example.com/preview.png'),
  sourceUrl: fc.constant('https://example.com/source'),
  source: fc.constantFrom('github', 'dribbble', 'behance', 'custom'),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
  style: fc.constantFrom('classic', 'modern', 'minimal', 'creative', 'professional', 'tech'),
  relevanceScore: fc.float({ min: 0, max: 1, noNaN: true }),
  metadata: fc.record({
    author: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    license: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
    downloads: fc.option(fc.nat({ max: 10000 }), { nil: undefined }),
    rating: fc.option(fc.float({ min: 0, max: 5, noNaN: true }), { nil: undefined }),
  }),
});

const queryArb = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)
  .filter(s => !['__proto__', 'constructor', 'prototype'].includes(s.toLowerCase().trim()));

const templatesArb = fc.array(templateSearchResultArb, { minLength: 0, maxLength: 10 });

// ============ Tests ============

describe('Cache Manager Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('normalizeQuery', () => {
    it('should normalize queries consistently', () => {
      fc.assert(
        fc.property(queryArb, (query) => {
          const normalized = normalizeQuery(query);
          // Should be lowercase
          expect(normalized).toBe(normalized.toLowerCase());
          // Should be trimmed
          expect(normalized).toBe(normalized.trim());
          // Should not have multiple spaces
          expect(normalized).not.toMatch(/\s{2,}/);
        }),
        { numRuns: 100 }
      );
    });

    it('should produce same result for equivalent queries', () => {
      fc.assert(
        fc.property(queryArb, (query) => {
          const withSpaces = `  ${query}  `;
          const withUpperCase = query.toUpperCase();
          
          expect(normalizeQuery(withSpaces)).toBe(normalizeQuery(query));
          expect(normalizeQuery(withUpperCase)).toBe(normalizeQuery(query));
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Cache Stores Fetched Templates', () => {
    it('for any successful store operation, cache should contain the entry', () => {
      fc.assert(
        fc.property(queryArb, templatesArb, (query, templates) => {
          clearCache();
          
          // Store templates
          setCachedResults(query, templates);
          
          // Verify cache contains the entry
          expect(hasCache(query)).toBe(true);
          
          // Verify data is retrievable
          const cached = getCachedResults(query);
          expect(cached).not.toBeNull();
          expect(cached).toHaveLength(templates.length);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: Cache Returns Results Within TTL', () => {
    it('for any cached query within TTL, should return cached results', () => {
      fc.assert(
        fc.property(queryArb, templatesArb, (query, templates) => {
          clearCache();
          
          const config: CacheConfig = {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            maxSize: 100,
          };
          
          // Store templates
          setCachedResults(query, templates, config);
          
          // Immediately retrieve (well within TTL)
          const cached = getCachedResults(query, config);
          
          expect(cached).not.toBeNull();
          expect(cached).toHaveLength(templates.length);
          
          // Verify each template is preserved
          if (templates.length > 0 && cached) {
            expect(cached[0].id).toBe(templates[0].id);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Cache Invalidates Expired Entries', () => {
    it('for any cache entry past TTL, should not return that entry', () => {
      fc.assert(
        fc.property(queryArb, templatesArb, (query, templates) => {
          clearCache();
          
          // Use a very short TTL for testing
          const config: CacheConfig = {
            maxAge: 1, // 1 millisecond
            maxSize: 100,
          };
          
          // Store templates
          setCachedResults(query, templates, config);
          
          // Wait for expiration
          const start = Date.now();
          while (Date.now() - start < 5) {
            // Busy wait for 5ms to ensure expiration
          }
          
          // Try to retrieve - should be null due to expiration
          const cached = getCachedResults(query, config);
          expect(cached).toBeNull();
        }),
        { numRuns: 50 } // Fewer runs due to timing sensitivity
      );
    });

    it('isExpired should correctly identify expired entries', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }), // age offset
          (ageOffset) => {
            const config: CacheConfig = { maxAge: 500, maxSize: 100 };
            
            const entry: CacheEntry<string[]> = {
              data: [],
              timestamp: Date.now() - ageOffset,
              query: 'test',
            };
            
            const expired = isExpired(entry, config);
            
            if (ageOffset >= config.maxAge) {
              expect(expired).toBe(true);
            } else {
              expect(expired).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Cache LRU Eviction', () => {
    it('for any cache at max capacity, adding new entry should evict oldest', () => {
      fc.assert(
        fc.property(
          fc.array(queryArb, { minLength: 3, maxLength: 5 }).filter(arr => new Set(arr.map(q => normalizeQuery(q))).size === arr.length),
          templatesArb,
          (queries, templates) => {
            clearCache();
            
            const maxSize = 2;
            const config: CacheConfig = {
              maxAge: 24 * 60 * 60 * 1000,
              maxSize,
            };
            
            // Add entries up to capacity
            for (let i = 0; i < maxSize; i++) {
              setCachedResults(queries[i], templates, config);
            }
            
            // Verify all entries exist
            for (let i = 0; i < maxSize; i++) {
              expect(hasCache(queries[i])).toBe(true);
            }
            
            // Add one more entry (should evict oldest)
            const newQuery = queries[maxSize];
            setCachedResults(newQuery, templates, config);
            
            // First entry should be evicted (LRU)
            expect(hasCache(queries[0])).toBe(false);
            
            // New entry should exist
            expect(hasCache(newQuery)).toBe(true);
            
            // Second entry should still exist
            expect(hasCache(queries[1])).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('accessing an entry should update its position in LRU order', () => {
      clearCache();
      
      const config: CacheConfig = {
        maxAge: 24 * 60 * 60 * 1000,
        maxSize: 2,
      };
      
      // Add two entries
      setCachedResults('query1', [], config);
      setCachedResults('query2', [], config);
      
      // Access query1 to make it more recent
      getCachedResults('query1', config);
      
      // Add a third entry - should evict query2 (now oldest)
      setCachedResults('query3', [], config);
      
      expect(hasCache('query1')).toBe(true);
      expect(hasCache('query2')).toBe(false);
      expect(hasCache('query3')).toBe(true);
    });
  });

  describe('invalidateCache', () => {
    it('should remove specific cache entry', () => {
      fc.assert(
        fc.property(queryArb, templatesArb, (query, templates) => {
          clearCache();
          
          setCachedResults(query, templates);
          expect(hasCache(query)).toBe(true);
          
          invalidateCache(query);
          expect(hasCache(query)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('clearCache', () => {
    it('should remove all cache entries', () => {
      fc.assert(
        fc.property(
          fc.array(queryArb, { minLength: 1, maxLength: 5 }),
          templatesArb,
          (queries, templates) => {
            clearCache();
            
            // Add multiple entries
            for (const query of queries) {
              setCachedResults(query, templates);
            }
            
            // Clear all
            clearCache();
            
            // Verify all are gone
            for (const query of queries) {
              expect(hasCache(query)).toBe(false);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
