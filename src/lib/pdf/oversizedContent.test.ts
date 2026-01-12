/**
 * 超长内容属性测试
 * Feature: pdf-page-break-optimization
 * 
 * Property 3: 超长条目分页点合理性
 * Validates: Requirements 2.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateBreakPoints, resetIdCounter } from './pageBreakCalculator';
import type { ContentBlock, PageBreakConfig } from './types';
import { MM_TO_PX, PX_TO_MM } from './types';

// 测试配置
const testConfig: PageBreakConfig = {
  pageHeightMm: 297,
  pageWidthMm: 210,
  marginMm: 12,
  minSectionHeaderSpace: 40,
  minItemSpace: 20,
};

const pageContentHeight = (testConfig.pageHeightMm - testConfig.marginMm * 2) * MM_TO_PX;

describe('Property 3: 超长条目分页点合理性', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  /**
   * 验证超长内容会生成警告
   */
  it('should generate warning for oversized content', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'oversized-item',
        element: document.createElement('div'),
        type: 'section-item',
        top: 0,
        height: pageContentHeight * 1.5, // 超过一页高度
        canBreak: true,
        mustKeepWithNext: false,
      },
    ];

    const result = calculateBreakPoints(blocks, testConfig);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('超过页面可用高度');
  });

  /**
   * 验证超长内容在highlight列表项之间分页
   */
  it('should break between highlight items for oversized content', () => {
    // 创建一个超长条目，包含多个highlight
    const itemTop = 0;
    const itemHeight = pageContentHeight * 1.5;
    const highlightHeight = 100;
    
    const blocks: ContentBlock[] = [
      {
        id: 'oversized-item',
        element: document.createElement('div'),
        type: 'section-item',
        top: itemTop,
        height: itemHeight,
        canBreak: true,
        mustKeepWithNext: false,
      },
    ];

    // 添加highlight子元素
    let currentTop = itemTop + 50; // 条目标题后
    for (let i = 0; i < 15; i++) {
      blocks.push({
        id: `highlight-${i}`,
        element: document.createElement('div'),
        type: 'highlight-item',
        top: currentTop,
        height: highlightHeight,
        canBreak: true,
        mustKeepWithNext: false,
        parentId: 'oversized-item',
      });
      currentTop += highlightHeight;
    }

    const result = calculateBreakPoints(blocks, testConfig);

    // 验证有分页
    expect(result.pageCount).toBeGreaterThan(1);

    // 验证分页点在highlight之间（而非在文字中间）
    for (let i = 1; i < result.breakPoints.length; i++) {
      const breakPoint = result.breakPoints[i];
      
      // 分页点应该在某个元素的top位置
      const isAtElementBoundary = blocks.some(b => 
        Math.abs(b.top - breakPoint) < 1
      );
      
      expect(isAtElementBoundary).toBe(true);
    }
  });

  /**
   * 验证超长内容的分页点不会在单个highlight内部
   */
  it('should not break inside a single highlight item', () => {
    const highlightHeight = 80;
    const blocks: ContentBlock[] = [];
    
    // 创建多个highlight，总高度超过一页
    let currentTop = 0;
    for (let i = 0; i < 20; i++) {
      blocks.push({
        id: `highlight-${i}`,
        element: document.createElement('div'),
        type: 'highlight-item',
        top: currentTop,
        height: highlightHeight,
        canBreak: true,
        mustKeepWithNext: false,
      });
      currentTop += highlightHeight;
    }

    const result = calculateBreakPoints(blocks, testConfig);

    // 验证每个分页点都在highlight的边界上
    for (let i = 1; i < result.breakPoints.length; i++) {
      const breakPoint = result.breakPoints[i];
      
      // 检查分页点是否在某个highlight的top位置
      const matchingBlock = blocks.find(b => Math.abs(b.top - breakPoint) < 1);
      expect(matchingBlock).toBeDefined();
    }
  });

  /**
   * 验证警告信息包含有用的尺寸信息
   */
  it('should include size information in warning message', () => {
    const oversizedHeight = pageContentHeight * 2;
    const blocks: ContentBlock[] = [
      {
        id: 'oversized-item',
        element: document.createElement('div'),
        type: 'section-item',
        top: 0,
        height: oversizedHeight,
        canBreak: true,
        mustKeepWithNext: false,
      },
    ];

    const result = calculateBreakPoints(blocks, testConfig);

    expect(result.warnings.length).toBeGreaterThan(0);
    
    // 警告应该包含高度信息（mm）
    const warning = result.warnings[0];
    expect(warning).toContain('mm');
    expect(warning).toContain('section-item');
  });

  /**
   * 验证正常大小的内容不会生成警告
   */
  it('should not generate warning for normal sized content', () => {
    const blocks: ContentBlock[] = [
      {
        id: 'normal-item',
        element: document.createElement('div'),
        type: 'section-item',
        top: 0,
        height: pageContentHeight * 0.5, // 半页高度
        canBreak: true,
        mustKeepWithNext: false,
      },
    ];

    const result = calculateBreakPoints(blocks, testConfig);

    expect(result.warnings.length).toBe(0);
  });
});
