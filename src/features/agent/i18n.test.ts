/**
 * Property Tests for Internationalization
 * Feature: smart-template-search
 * 
 * Property 12: Internationalization Consistency
 * Validates: Requirements 6.4, 8.1, 8.2, 8.3, 8.4
 */

import { describe, it, expect } from 'vitest';
import { en } from '../../i18n/en';
import { zh } from '../../i18n/zh';
import type { Translations } from '../../i18n/types';

// Template search related keys
const TEMPLATE_SEARCH_KEYS: (keyof Translations)[] = [
  'searchTemplates',
  'searchPlaceholder',
  'searching',
  'noResults',
  'noResultsHint',
  'selectTemplate',
  'importTemplate',
  'importing',
  'importSuccess',
  'importError',
  'templateSource',
  'templateStyle',
  'templateTags',
  'templateAuthor',
  'templateRating',
  'templateDownloads',
  'configureApi',
  'apiKey',
  'apiKeyPlaceholder',
  'saveConfig',
  'cancel',
  'confirm',
  'close',
];

describe('Internationalization Property Tests', () => {
  describe('Property 12: Internationalization Consistency', () => {
    it('all template search keys should exist in both languages', () => {
      for (const key of TEMPLATE_SEARCH_KEYS) {
        expect(en[key]).toBeDefined();
        expect(zh[key]).toBeDefined();
        expect(typeof en[key]).toBe('string');
        expect(typeof zh[key]).toBe('string');
        expect(en[key].length).toBeGreaterThan(0);
        expect(zh[key].length).toBeGreaterThan(0);
      }
    });

    it('English and Chinese translations should have same keys', () => {
      const enKeys = Object.keys(en).sort();
      const zhKeys = Object.keys(zh).sort();
      
      expect(enKeys).toEqual(zhKeys);
    });

    it('all translation values should be non-empty strings', () => {
      for (const [key, value] of Object.entries(en)) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
      
      for (const [key, value] of Object.entries(zh)) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    });

    it('Chinese translations should contain Chinese characters for template search keys', () => {
      const chineseCharRegex = /[\u4e00-\u9fa5]/;
      
      for (const key of TEMPLATE_SEARCH_KEYS) {
        const value = zh[key];
        // Most Chinese translations should contain at least one Chinese character
        // Some may be technical terms that don't need translation
        if (!['API', 'JSON', 'PDF'].some(term => value.includes(term))) {
          expect(chineseCharRegex.test(value)).toBe(true);
        }
      }
    });

    it('English translations should not contain Chinese characters', () => {
      const chineseCharRegex = /[\u4e00-\u9fa5]/;
      
      for (const [key, value] of Object.entries(en)) {
        expect(chineseCharRegex.test(value)).toBe(false);
      }
    });
  });
});
