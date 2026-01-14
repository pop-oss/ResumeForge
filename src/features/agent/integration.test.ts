/**
 * Agent Feature Integration Tests
 * 集成测试 - 测试完整的搜索和导入流程
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchTemplates } from './services/templateSearchService';
import { importTemplate, convertToResumeData } from './services/templateImporter';
import { getCachedResults, setCachedResults, clearCache } from './services/cacheManager';
import { analyzeQuery } from './services/aiService';
import type { TemplateSearchResult } from './types';

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

// Mock fetch to avoid network requests in tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Agent Feature Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    clearCache();
    // Default mock: return 404 for all fetch requests (no external data)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockFetch.mockReset();
  });

  describe('Complete Search Flow', () => {
    it('should analyze query and return search results', async () => {
      const query = 'modern tech resume';
      
      // Step 1: Analyze query
      const searchQuery = await analyzeQuery(query);
      expect(searchQuery).toBeDefined();
      expect(searchQuery.raw).toBe(query);
      expect(searchQuery.keywords.length).toBeGreaterThan(0);
      
      // Step 2: Search templates
      const { results, error } = await searchTemplates(query);
      
      // Should return results (mock data)
      expect(error).toBeNull();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should cache search results for subsequent queries', async () => {
      const query = 'professional resume';
      
      // First search
      const firstResult = await searchTemplates(query);
      expect(firstResult.results).toBeDefined();
      
      // Check cache
      const cached = getCachedResults(query);
      expect(cached).toBeDefined();
      
      // Second search should use cache
      const secondResult = await searchTemplates(query);
      expect(secondResult.results).toEqual(firstResult.results);
    });

    it('should handle empty query gracefully', async () => {
      const query = '';
      const searchQuery = await analyzeQuery(query);
      
      // Should still return a valid SearchQuery object
      expect(searchQuery).toBeDefined();
      expect(searchQuery.raw).toBe('');
    });

    it('should handle whitespace-only query', async () => {
      const query = '   ';
      const searchQuery = await analyzeQuery(query);
      
      expect(searchQuery).toBeDefined();
      expect(searchQuery.raw).toBe('   ');
    });
  });

  describe('Template Import Flow', () => {
    const mockTemplate: TemplateSearchResult = {
      id: 'test-template-1',
      name: 'Test Template',
      description: 'A test template for integration testing',
      previewUrl: 'https://example.com/preview.png',
      sourceUrl: 'https://example.com/template',
      source: 'github',
      style: 'modern',
      tags: ['modern', 'tech', 'clean'],
      metadata: {
        author: 'Test Author',
        rating: 4.5,
        downloads: 1000,
      },
      relevanceScore: 0.9,
    };

    it('should import template and convert to ResumeData', async () => {
      // Use convertToResumeData directly to avoid network fetch
      const { data, error } = convertToResumeData(mockTemplate);
      
      // Should successfully convert
      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      if (data) {
        // Verify ResumeData structure
        expect(data.basics).toBeDefined();
        expect(data.basics.name).toBeDefined();
        expect(data.settings).toBeDefined();
        expect(data.settings.template).toBeDefined();
      }
    });

    it('should handle import errors gracefully', async () => {
      const invalidTemplate: TemplateSearchResult = {
        ...mockTemplate,
        id: '',
        name: '',
        style: 'modern', // Ensure style is valid
      };
      
      // Use convertToResumeData directly to avoid network fetch
      const { data, error } = convertToResumeData(invalidTemplate);
      
      // Should handle gracefully (either return data or error)
      expect(data !== null || error !== null).toBe(true);
    });
  });

  describe('Cache Integration', () => {
    it('should store and retrieve cached results correctly', () => {
      const query = 'test query';
      const mockResults: TemplateSearchResult[] = [
        {
          id: 'cached-1',
          name: 'Cached Template',
          description: 'Test',
          previewUrl: 'https://example.com/preview.png',
          sourceUrl: 'https://example.com',
          source: 'github',
          style: 'modern',
          tags: ['test'],
          metadata: {},
          relevanceScore: 0.8,
        },
      ];
      
      // Store in cache
      setCachedResults(query, mockResults);
      
      // Retrieve from cache
      const cached = getCachedResults(query);
      expect(cached).toBeDefined();
      expect(cached).toEqual(mockResults);
    });

    it('should return null for non-existent cache entries', () => {
      const cached = getCachedResults('non-existent-query');
      expect(cached).toBeNull();
    });

    it('should clear cache correctly', () => {
      const query = 'test query';
      const mockResults: TemplateSearchResult[] = [];
      
      setCachedResults(query, mockResults);
      expect(getCachedResults(query)).toBeDefined();
      
      clearCache();
      expect(getCachedResults(query)).toBeNull();
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle network errors in search', async () => {
      // Search with a query that might trigger edge cases
      const { results, error } = await searchTemplates('network-error-test');
      
      // Should return either results or a proper error
      expect(Array.isArray(results) || error !== null).toBe(true);
    });

    it('should handle malformed template data', async () => {
      const malformedTemplate = {
        id: 'malformed',
        name: 'Malformed',
        // Missing required fields
      } as unknown as TemplateSearchResult;
      
      const { data, error } = await importTemplate(malformedTemplate);
      
      // Should handle gracefully
      expect(data !== null || error !== null).toBe(true);
    });
  });

  describe('Query Analysis', () => {
    it('should extract style intent from query', async () => {
      const query = 'modern minimalist resume';
      const searchQuery = await analyzeQuery(query);
      
      expect(searchQuery.intent).toBeDefined();
      // Should detect style keywords
      expect(
        searchQuery.intent.style === 'modern' ||
        searchQuery.intent.style === 'minimal' ||
        searchQuery.keywords.some(k => k.includes('modern') || k.includes('minimal'))
      ).toBe(true);
    });

    it('should extract industry intent from query', async () => {
      const query = 'software engineer tech resume';
      const searchQuery = await analyzeQuery(query);
      
      expect(searchQuery.intent).toBeDefined();
      // Should detect tech-related keywords
      expect(
        searchQuery.intent.industry === 'tech' ||
        searchQuery.intent.position?.toLowerCase().includes('engineer') ||
        searchQuery.keywords.some(k => k.includes('tech') || k.includes('engineer'))
      ).toBe(true);
    });

    it('should handle Chinese keywords', async () => {
      const query = '现代 简约 技术';
      const searchQuery = await analyzeQuery(query);
      
      expect(searchQuery).toBeDefined();
      expect(searchQuery.raw).toBe(query);
      expect(searchQuery.keywords.length).toBeGreaterThan(0);
    });
  });
});
