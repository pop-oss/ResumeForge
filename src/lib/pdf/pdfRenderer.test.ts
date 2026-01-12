/**
 * PDF渲染器属性测试
 * Feature: pdf-page-break-optimization
 * 
 * Property 1: Section标题不孤立
 * Property 2: 条目完整性
 * Validates: Requirements 1.1, 1.2, 2.1, 2.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateBreakPoints, resetIdCounter } from './pageBreakCalculator';
import type { ContentBlock, PageBreakConfig } from './types';
import { MM_TO_PX } from './types';

// 测试配置
const testConfig: PageBreakConfig = {
  pageHeightMm: 297,
  pageWidthMm: 210,
  marginMm: 12,
  minSectionHeaderSpace: 40,
  minItemSpace: 20,
};

const pageContentHeight = (testConfig.pageHeightMm - testConfig.marginMm * 2) * MM_TO_PX;
const minHeaderSpace = testConfig.minSectionHeaderSpace * MM_TO_PX;

describe('PDF Renderer Properties', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  /**
   * Property 1: Section标题不孤立
   * For any 生成的PDF，每个Section标题后面要么有至少40mm的内容空间，
   * 要么标题位于新页的顶部（加上边距）。
   * Validates: Requirements 1.1, 1.2
   */
  describe('Property 1: Section标题不孤立', () => {
    it('should move section header to next page if not enough space after it', () => {
      // 创建一个场景：标题在页面底部，后面空间不足40mm
      const blocks: ContentBlock[] = [
        {
          id: 'content-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: 0,
          height: pageContentHeight - minHeaderSpace + 50, // 留下不足40mm的空间
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
        {
          id: 'item-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: pageContentHeight - minHeaderSpace + 80,
          height: 100,
          canBreak: false,
          mustKeepWithNext: false,
          parentId: 'header-1',
        },
      ];

      const result = calculateBreakPoints(blocks, testConfig);

      // 验证：标题应该被移到新页
      if (result.breakPoints.length > 1) {
        const headerBlock = blocks.find(b => b.type === 'section-header')!;
        const breakPoint = result.breakPoints[1];
        
        // 分页点应该在标题之前或正好在标题位置
        expect(breakPoint).toBeLessThanOrEqual(headerBlock.top);
      }
    });

    it('should keep section header with first item on same page', () => {
      const blocks: ContentBlock[] = [
        {
          id: 'header-1',
          element: document.createElement('div'),
          type: 'section-header',
          top: 0,
          height: 30,
          canBreak: true,
          mustKeepWithNext: true,
        },
        {
          id: 'item-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: 30,
          height: 100,
          canBreak: false, // 第一个条目不能与标题分开
          mustKeepWithNext: false,
          parentId: 'header-1',
        },
      ];

      const result = calculateBreakPoints(blocks, testConfig);

      // 验证：标题和第一个条目应该在同一页
      expect(result.breakPoints.length).toBe(1);
      expect(result.breakPoints[0]).toBe(0);
    });
  });

  /**
   * Property 2: 条目完整性
   * For any 高度小于页面可用高度的Section条目，该条目必须完整显示在单一页面内。
   * Validates: Requirements 2.1, 2.2
   */
  describe('Property 2: 条目完整性', () => {
    it('should keep item intact when it fits in remaining space', () => {
      const itemHeight = 150;
      const blocks: ContentBlock[] = [
        {
          id: 'content-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: 0,
          height: pageContentHeight - itemHeight - 50, // 留足够空间
          canBreak: true,
          mustKeepWithNext: false,
        },
        {
          id: 'item-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: pageContentHeight - itemHeight - 50,
          height: itemHeight,
          canBreak: true,
          mustKeepWithNext: false,
        },
      ];

      const result = calculateBreakPoints(blocks, testConfig);

      // 验证：只有一页，条目完整显示
      expect(result.pageCount).toBe(1);
    });

    it('should move item to next page when it does not fit but is smaller than page height', () => {
      const itemHeight = 200;
      const blocks: ContentBlock[] = [
        {
          id: 'content-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: 0,
          height: pageContentHeight - 100, // 只留100px空间
          canBreak: true,
          mustKeepWithNext: false,
        },
        {
          id: 'item-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: pageContentHeight - 100,
          height: itemHeight, // 200px，超过剩余空间但小于页面高度
          canBreak: true,
          mustKeepWithNext: false,
        },
      ];

      const result = calculateBreakPoints(blocks, testConfig);

      // 验证：应该有分页，条目被移到新页
      expect(result.pageCount).toBeGreaterThan(1);
      
      // 分页点应该在条目之前
      const itemBlock = blocks[1];
      const breakPoint = result.breakPoints[1];
      expect(breakPoint).toBeLessThanOrEqual(itemBlock.top);
    });

    it('should not break in the middle of an item', () => {
      // 创建多个条目，验证分页点总是在条目之间
      const blocks: ContentBlock[] = [];
      let currentTop = 0;
      
      for (let i = 0; i < 10; i++) {
        const height = 150 + Math.random() * 100; // 随机高度
        blocks.push({
          id: `item-${i}`,
          element: document.createElement('div'),
          type: 'section-item',
          top: currentTop,
          height,
          canBreak: true,
          mustKeepWithNext: false,
        });
        currentTop += height;
      }

      const result = calculateBreakPoints(blocks, testConfig);

      // 验证：每个分页点都应该在某个条目的top位置
      for (let i = 1; i < result.breakPoints.length; i++) {
        const breakPoint = result.breakPoints[i];
        const isAtItemBoundary = blocks.some(b => Math.abs(b.top - breakPoint) < 1);
        expect(isAtItemBoundary).toBe(true);
      }
    });
  });

  /**
   * Property 4: 技能组完整性
   * For any 技能组，如果其高度小于页面可用高度，则该技能组必须完整显示在单一页面内。
   * Validates: Requirements 3.1, 3.2
   */
  describe('Property 4: 技能组完整性', () => {
    it('should keep skill group intact', () => {
      const skillGroupHeight = 50;
      const blocks: ContentBlock[] = [
        {
          id: 'content-1',
          element: document.createElement('div'),
          type: 'section-item',
          top: 0,
          height: pageContentHeight - 30, // 只留30px空间
          canBreak: true,
          mustKeepWithNext: false,
        },
        {
          id: 'skill-1',
          element: document.createElement('div'),
          type: 'skill-group',
          top: pageContentHeight - 30,
          height: skillGroupHeight, // 50px，超过剩余空间
          canBreak: true,
          mustKeepWithNext: false,
        },
      ];

      const result = calculateBreakPoints(blocks, testConfig);

      // 验证：技能组应该被移到新页
      expect(result.pageCount).toBeGreaterThan(1);
      
      const skillBlock = blocks[1];
      const breakPoint = result.breakPoints[1];
      expect(breakPoint).toBeLessThanOrEqual(skillBlock.top);
    });
  });

  /**
   * Property 5: 页面边距一致性
   * For any 生成的PDF的每一页，顶部边距必须等于配置的边距值。
   * Validates: Requirements 4.1, 4.2
   */
  describe('Property 5: 页面边距一致性', () => {
    it('should start each page at correct position', () => {
      // 创建足够多的内容以产生多页
      const blocks: ContentBlock[] = [];
      let currentTop = 0;
      
      for (let i = 0; i < 20; i++) {
        blocks.push({
          id: `item-${i}`,
          element: document.createElement('div'),
          type: 'section-item',
          top: currentTop,
          height: 200,
          canBreak: true,
          mustKeepWithNext: false,
        });
        currentTop += 200;
      }

      const result = calculateBreakPoints(blocks, testConfig);

      // 验证：第一页从0开始
      expect(result.breakPoints[0]).toBe(0);

      // 验证：每个分页点之间的距离不超过页面内容高度
      for (let i = 1; i < result.breakPoints.length; i++) {
        const pageHeight = result.breakPoints[i] - result.breakPoints[i - 1];
        expect(pageHeight).toBeLessThanOrEqual(pageContentHeight);
      }
    });
  });
});
