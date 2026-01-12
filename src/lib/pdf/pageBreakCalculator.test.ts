/**
 * PageBreakCalculator 单元测试
 * Feature: pdf-page-break-optimization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  analyzeContentBlocks,
  calculateBreakPoints,
  resetIdCounter,
} from './pageBreakCalculator';
import type { ContentBlock, PageBreakConfig } from './types';
import { MM_TO_PX } from './types';

// Mock DOM环境
function createMockElement(
  className: string,
  top: number,
  height: number,
  children: HTMLElement[] = []
): HTMLElement {
  const element = document.createElement('div');
  element.className = className;
  
  // Mock getBoundingClientRect
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    top,
    left: 0,
    right: 210,
    bottom: top + height,
    width: 210,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  });

  children.forEach(child => element.appendChild(child));
  
  // Mock querySelectorAll
  vi.spyOn(element, 'querySelectorAll').mockImplementation((selector: string) => {
    const results: HTMLElement[] = [];
    const findElements = (el: HTMLElement) => {
      if (el.className.includes(selector.replace('.', ''))) {
        results.push(el);
      }
      Array.from(el.children).forEach(child => findElements(child as HTMLElement));
    };
    children.forEach(child => findElements(child));
    return results as unknown as NodeListOf<Element>;
  });

  // Mock querySelector
  vi.spyOn(element, 'querySelector').mockImplementation((selector: string) => {
    const findElement = (el: HTMLElement): HTMLElement | null => {
      if (el.className.includes(selector.replace('.', ''))) {
        return el;
      }
      for (const child of Array.from(el.children)) {
        const found = findElement(child as HTMLElement);
        if (found) return found;
      }
      return null;
    };
    for (const child of children) {
      const found = findElement(child);
      if (found) return found;
    }
    return null;
  });

  return element;
}

describe('PageBreakCalculator', () => {
  beforeEach(() => {
    resetIdCounter();
    vi.clearAllMocks();
  });

  describe('analyzeContentBlocks', () => {
    it('should return empty array for empty resume', () => {
      const resume = createMockElement('resume', 0, 500);
      const blocks = analyzeContentBlocks(resume);
      expect(blocks).toEqual([]);
    });

    it('should identify section containers', () => {
      const section = createMockElement('resume-section', 100, 200);
      const resume = createMockElement('resume', 0, 500, [section]);
      
      // Override querySelectorAll for resume
      vi.spyOn(resume, 'querySelectorAll').mockImplementation((selector: string) => {
        if (selector === '.resume-section') {
          return [section] as unknown as NodeListOf<Element>;
        }
        return [] as unknown as NodeListOf<Element>;
      });

      const blocks = analyzeContentBlocks(resume);
      
      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks[0].type).toBe('section');
      expect(blocks[0].top).toBe(100);
      expect(blocks[0].height).toBe(200);
    });

    it('should identify section headers with mustKeepWithNext=true', () => {
      const header = createMockElement('resume-section-header', 100, 30);
      const section = createMockElement('resume-section', 100, 200, [header]);
      const resume = createMockElement('resume', 0, 500, [section]);
      
      vi.spyOn(resume, 'querySelectorAll').mockImplementation((selector: string) => {
        if (selector === '.resume-section') {
          return [section] as unknown as NodeListOf<Element>;
        }
        return [] as unknown as NodeListOf<Element>;
      });

      vi.spyOn(section, 'querySelector').mockImplementation((selector: string) => {
        if (selector === '.resume-section-header') {
          return header;
        }
        return null;
      });

      vi.spyOn(section, 'querySelectorAll').mockImplementation((selector: string) => {
        if (selector === '.resume-section-header') {
          return [header] as unknown as NodeListOf<Element>;
        }
        return [] as unknown as NodeListOf<Element>;
      });

      const blocks = analyzeContentBlocks(resume);
      
      const headerBlock = blocks.find(b => b.type === 'section-header');
      expect(headerBlock).toBeDefined();
      expect(headerBlock?.mustKeepWithNext).toBe(true);
    });

    it('should sort blocks by position', () => {
      const section1 = createMockElement('resume-section', 200, 100);
      const section2 = createMockElement('resume-section', 50, 100);
      const resume = createMockElement('resume', 0, 500, [section1, section2]);
      
      vi.spyOn(resume, 'querySelectorAll').mockImplementation((selector: string) => {
        if (selector === '.resume-section') {
          return [section1, section2] as unknown as NodeListOf<Element>;
        }
        return [] as unknown as NodeListOf<Element>;
      });

      const blocks = analyzeContentBlocks(resume);
      
      // Should be sorted by top position
      for (let i = 1; i < blocks.length; i++) {
        expect(blocks[i].top).toBeGreaterThanOrEqual(blocks[i - 1].top);
      }
    });
  });

  describe('calculateBreakPoints', () => {
    const defaultConfig: PageBreakConfig = {
      pageHeightMm: 297,
      pageWidthMm: 210,
      marginMm: 12,
      minSectionHeaderSpace: 40,
      minItemSpace: 20,
    };

    it('should return single page for content within one page', () => {
      const pageContentHeight = (297 - 12 * 2) * MM_TO_PX;
      
      const blocks: ContentBlock[] = [
        {
          id: 'section-1',
          element: document.createElement('div'),
          type: 'section',
          top: 0,
          height: pageContentHeight / 2,
          canBreak: true,
          mustKeepWithNext: false,
        },
      ];

      const result = calculateBreakPoints(blocks, defaultConfig);
      
      expect(result.pageCount).toBe(1);
      expect(result.breakPoints).toEqual([0]);
      expect(result.warnings).toHaveLength(0);
    });

    it('should add break point when content exceeds page height', () => {
      const pageContentHeight = (297 - 12 * 2) * MM_TO_PX;
      
      const blocks: ContentBlock[] = [
        {
          id: 'section-1',
          element: document.createElement('div'),
          type: 'section',
          top: 0,
          height: pageContentHeight / 2,
          canBreak: true,
          mustKeepWithNext: false,
        },
        {
          id: 'section-2',
          element: document.createElement('div'),
          type: 'section',
          top: pageContentHeight - 50,
          height: 200,
          canBreak: true,
          mustKeepWithNext: false,
        },
      ];

      const result = calculateBreakPoints(blocks, defaultConfig);
      
      expect(result.pageCount).toBeGreaterThan(1);
      expect(result.breakPoints.length).toBeGreaterThan(1);
    });

    it('should not break before items with canBreak=false', () => {
      const pageContentHeight = (297 - 12 * 2) * MM_TO_PX;
      
      const blocks: ContentBlock[] = [
        {
          id: 'header-1',
          element: document.createElement('div'),
          type: 'section-header',
          top: pageContentHeight - 100,
          height: 30,
          canBreak: true,
          mustKeepWithNext: true,
        },
        {
          id: 'item-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: pageContentHeight - 70,
          height: 150,
          canBreak: false, // First item cannot break from header
          mustKeepWithNext: false,
        },
      ];

      const result = calculateBreakPoints(blocks, defaultConfig);
      
      // Should break before the header, not between header and first item
      if (result.breakPoints.length > 1) {
        const breakPoint = result.breakPoints[1];
        expect(breakPoint).toBeLessThanOrEqual(blocks[0].top);
      }
    });

    it('should move section header to next page if not enough space after it', () => {
      const pageContentHeight = (297 - 12 * 2) * MM_TO_PX;
      const minHeaderSpace = 40 * MM_TO_PX;
      
      const blocks: ContentBlock[] = [
        {
          id: 'content-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: 0,
          height: pageContentHeight - minHeaderSpace + 50, // Leave less than minHeaderSpace
          canBreak: true,
          mustKeepWithNext: false,
        },
        {
          id: 'header-1',
          element: document.createElement('div'),
          type: 'section-header',
          top: pageContentHeight - minHeaderSpace + 50,
          height: 30,
          canBreak: true,
          mustKeepWithNext: true,
        },
      ];

      const result = calculateBreakPoints(blocks, defaultConfig);
      
      // Header should be moved to next page
      if (result.breakPoints.length > 1) {
        expect(result.breakPoints[1]).toBeLessThanOrEqual(blocks[1].top);
      }
    });

    it('should generate warning for oversized content', () => {
      const pageContentHeight = (297 - 12 * 2) * MM_TO_PX;
      
      const blocks: ContentBlock[] = [
        {
          id: 'oversized-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: 0,
          height: pageContentHeight * 1.5, // Larger than one page
          canBreak: true,
          mustKeepWithNext: false,
        },
      ];

      const result = calculateBreakPoints(blocks, defaultConfig);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('超过页面可用高度');
    });
  });
});
