/**
 * PDF分页属性测试
 * Feature: smart-page-break-integration
 * 使用 fast-check 进行属性测试
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculatePageSlices } from './pdfRenderer';
import { calculateBreakPoints } from './pageBreakCalculator';
import type { ContentBlock, PageBreakConfig } from './types';
import { DEFAULT_PAGE_BREAK_CONFIG, MM_TO_PX } from './types';

/**
 * 生成随机内容块的辅助函数
 */
function generateContentBlock(
  id: string,
  type: ContentBlock['type'],
  top: number,
  height: number,
  options: Partial<ContentBlock> = {}
): ContentBlock {
  return {
    id,
    element: document.createElement('div'),
    type,
    top,
    height,
    canBreak: options.canBreak ?? true,
    mustKeepWithNext: options.mustKeepWithNext ?? false,
    parentId: options.parentId,
  };
}

/**
 * 生成随机内容块数组的 Arbitrary
 * 生成更符合实际简历结构的数据：section-header 后面跟 section-item
 */
const contentBlocksArbitrary = fc.array(
  fc.record({
    type: fc.constantFrom('section', 'section-header', 'section-item', 'skill-group', 'highlight-item') as fc.Arbitrary<ContentBlock['type']>,
    height: fc.integer({ min: 20, max: 200 }),
  }),
  { minLength: 1, maxLength: 20 }
).map((items) => {
  let currentTop = 0;
  const blocks: ContentBlock[] = [];
  
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    // section-header 的 mustKeepWithNext 只在后面有 section-item 时才有意义
    const nextItem = items[index + 1];
    const hasNextItem = nextItem && (nextItem.type === 'section-item' || nextItem.type === 'skill-group');
    
    const block = generateContentBlock(
      `block-${index}`,
      item.type,
      currentTop,
      item.height,
      {
        canBreak: item.type !== 'section-header' || index > 0,
        // 只有当后面有 section-item 或 skill-group 时，才设置 mustKeepWithNext
        mustKeepWithNext: item.type === 'section-header' && hasNextItem,
      }
    );
    blocks.push(block);
    currentTop += item.height;
  }
  
  return blocks;
});

describe('Property Tests: 分页点一致性', () => {
  /**
   * Property 1: 分页点一致性
   * For any 简历内容，PDF 渲染器生成的页数应该与 calculateBreakPoints 返回的分页点数量一致
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  it('Property 1: calculatePageSlices 生成的切片数量应该与分页点数量一致', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 5000 }), { minLength: 1, maxLength: 10 })
          .map(arr => [...new Set(arr)].sort((a, b) => a - b))
          .filter(arr => arr.length > 0 && arr[0] === 0),
        fc.integer({ min: 1000, max: 10000 }),
        fc.integer({ min: 1, max: 4 }),
        (breakPoints, totalHeight, scale) => {
          const slices = calculatePageSlices(breakPoints, totalHeight, scale);
          
          // 切片数量应该等于分页点数量
          expect(slices.length).toBe(breakPoints.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: 每页切片的范围应该与分页点定义的范围匹配', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 5000 }), { minLength: 1, maxLength: 10 })
          .map(arr => [...new Set(arr)].sort((a, b) => a - b))
          .filter(arr => arr.length > 0 && arr[0] === 0),
        fc.integer({ min: 1000, max: 10000 }),
        fc.integer({ min: 1, max: 4 }),
        (breakPoints, totalHeight, scale) => {
          const slices = calculatePageSlices(breakPoints, totalHeight, scale);
          
          // 验证每个切片的起始位置与分页点匹配
          for (let i = 0; i < slices.length; i++) {
            expect(slices[i].startY).toBe(breakPoints[i] * scale);
          }
          
          // 验证每个切片的结束位置
          for (let i = 0; i < slices.length - 1; i++) {
            expect(slices[i].endY).toBe(breakPoints[i + 1] * scale);
          }
          
          // 最后一个切片应该到达总高度
          expect(slices[slices.length - 1].endY).toBe(totalHeight * scale);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: 切片应该连续无间隙覆盖整个内容', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 5000 }), { minLength: 1, maxLength: 10 })
          .map(arr => [...new Set(arr)].sort((a, b) => a - b))
          .filter(arr => arr.length > 0 && arr[0] === 0),
        fc.integer({ min: 1000, max: 10000 }),
        fc.integer({ min: 1, max: 4 }),
        (breakPoints, totalHeight, scale) => {
          const slices = calculatePageSlices(breakPoints, totalHeight, scale);
          
          // 第一个切片从 0 开始
          expect(slices[0].startY).toBe(0);
          
          // 切片连续无间隙
          for (let i = 0; i < slices.length - 1; i++) {
            expect(slices[i].endY).toBe(slices[i + 1].startY);
          }
          
          // 最后一个切片到达总高度
          expect(slices[slices.length - 1].endY).toBe(totalHeight * scale);
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('Property Tests: 孤儿标题避免', () => {
  /**
   * Property 2: 孤儿标题避免
   * For any Section 标题，如果该标题距离页面底部不足 40mm，则该标题应该出现在下一页
   * Validates: Requirements 2.1, 2.2
   */
  it('Property 2: Section 标题不应该孤立在页面底部', () => {
    fc.assert(
      fc.property(
        contentBlocksArbitrary,
        (blocks) => {
          const config: PageBreakConfig = {
            ...DEFAULT_PAGE_BREAK_CONFIG,
            pageHeightMm: 297,
            marginMm: 12,
          };
          
          const { breakPoints } = calculateBreakPoints(blocks, config);
          const pageContentHeight = (config.pageHeightMm - config.marginMm * 2) * MM_TO_PX;
          const minHeaderSpace = config.minSectionHeaderSpace * MM_TO_PX;
          
          // 对于每个 section-header，检查它是否有足够的后续空间
          for (const block of blocks) {
            if (block.type === 'section-header') {
              // 找到该标题所在的页面
              let pageIndex = 0;
              for (let i = 0; i < breakPoints.length; i++) {
                if (breakPoints[i] <= block.top) {
                  pageIndex = i;
                }
              }
              
              const pageStart = breakPoints[pageIndex];
              const pageEnd = pageStart + pageContentHeight;
              
              // 如果标题在当前页，检查剩余空间
              if (block.top >= pageStart && block.top < pageEnd) {
                const remainingSpace = pageEnd - block.top;
                // 如果剩余空间不足，标题应该被移到下一页（即分页点应该在标题之前）
                if (remainingSpace < minHeaderSpace) {
                  // 应该有一个分页点在标题位置或之前
                  const hasBreakBeforeOrAt = breakPoints.some(bp => bp === block.top);
                  expect(hasBreakBeforeOrAt).toBe(true);
                }
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Section 标题与第一个条目应该在同一页', () => {
    fc.assert(
      fc.property(
        contentBlocksArbitrary,
        (blocks) => {
          const config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG;
          const { breakPoints } = calculateBreakPoints(blocks, config);
          
          // 找到所有 section-header 和它们后面的第一个条目
          for (let i = 0; i < blocks.length - 1; i++) {
            const block = blocks[i];
            if (block.type === 'section-header' && block.mustKeepWithNext) {
              const nextBlock = blocks[i + 1];
              
              // 找到标题所在的页面
              let headerPageIndex = 0;
              for (let j = 0; j < breakPoints.length; j++) {
                if (breakPoints[j] <= block.top) {
                  headerPageIndex = j;
                }
              }
              
              // 找到下一个块所在的页面
              let nextBlockPageIndex = 0;
              for (let j = 0; j < breakPoints.length; j++) {
                if (breakPoints[j] <= nextBlock.top) {
                  nextBlockPageIndex = j;
                }
              }
              
              // 标题和下一个块应该在同一页
              // 这是通过 mustKeepWithNext 属性保证的
              expect(headerPageIndex).toBe(nextBlockPageIndex);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: 内容块完整性', () => {
  /**
   * Property 3: 内容块完整性
   * For any 高度小于页面可用高度的内容块，该内容块不应该被分页截断
   * Validates: Requirements 3.1, 3.2
   */
  it('Property 3: 分页点应该只出现在内容块的边界处', () => {
    fc.assert(
      fc.property(
        contentBlocksArbitrary,
        (blocks) => {
          const config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG;
          const { breakPoints } = calculateBreakPoints(blocks, config);
          
          // 每个分页点（除了第一个）应该是某个内容块的起始位置
          for (let i = 1; i < breakPoints.length; i++) {
            const breakPoint = breakPoints[i];
            const isAtBlockBoundary = blocks.some(block => block.top === breakPoint);
            expect(isAtBlockBoundary).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: 小于页面高度的内容块不应该被截断', () => {
    fc.assert(
      fc.property(
        contentBlocksArbitrary,
        (blocks) => {
          const config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG;
          const { breakPoints } = calculateBreakPoints(blocks, config);
          const pageContentHeight = (config.pageHeightMm - config.marginMm * 2) * MM_TO_PX;
          
          for (const block of blocks) {
            // 只检查高度小于页面高度的块
            if (block.height < pageContentHeight) {
              const blockEnd = block.top + block.height;
              
              // 检查是否有分页点在块的内部（不包括起始位置）
              const hasBreakInside = breakPoints.some(
                bp => bp > block.top && bp < blockEnd
              );
              
              expect(hasBreakInside).toBe(false);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('Property Tests: 超长内容分页合理性', () => {
  /**
   * Property 4: 超长内容分页合理性
   * For any 高度超过页面可用高度的内容块，分页应该发生在子元素之间
   * Validates: Requirements 3.3
   */
  it('Property 4: 超长内容块的分页应该发生在子元素边界', () => {
    // 生成包含超长内容块和子元素的测试数据
    const oversizedBlockArbitrary = fc.record({
      parentHeight: fc.integer({ min: 1500, max: 3000 }), // 超过页面高度
      childCount: fc.integer({ min: 2, max: 10 }),
    }).chain(({ parentHeight, childCount }) => {
      const childHeight = Math.floor(parentHeight / childCount);
      return fc.constant({ parentHeight, childCount, childHeight });
    });

    fc.assert(
      fc.property(
        oversizedBlockArbitrary,
        ({ parentHeight, childCount, childHeight }) => {
          const blocks: ContentBlock[] = [];
          
          // 创建父块
          const parentBlock = generateContentBlock(
            'parent-0',
            'section-item',
            0,
            parentHeight,
            { canBreak: true }
          );
          blocks.push(parentBlock);
          
          // 创建子块
          for (let i = 0; i < childCount; i++) {
            const childBlock = generateContentBlock(
              `child-${i}`,
              'highlight-item',
              i * childHeight,
              childHeight,
              { canBreak: true, parentId: 'parent-0' }
            );
            blocks.push(childBlock);
          }
          
          const config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG;
          const { breakPoints } = calculateBreakPoints(blocks, config);
          
          // 如果有多个分页点，检查它们是否在子元素边界
          if (breakPoints.length > 1) {
            for (let i = 1; i < breakPoints.length; i++) {
              const breakPoint = breakPoints[i];
              // 分页点应该在某个块的起始位置
              const isAtBoundary = blocks.some(block => block.top === breakPoint);
              expect(isAtBoundary).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: 页面布局一致性', () => {
  /**
   * Property 5: 页面布局一致性
   * For any 多页 PDF，每页的上边距应该保持一致
   * Validates: Requirements 4.1, 4.2
   */
  it('Property 5: 所有页面切片应该从分页点开始', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 5000 }), { minLength: 2, maxLength: 10 })
          .map(arr => [...new Set(arr)].sort((a, b) => a - b))
          .filter(arr => arr.length >= 2 && arr[0] === 0),
        fc.integer({ min: 5000, max: 10000 }),
        fc.integer({ min: 1, max: 4 }),
        (breakPoints, totalHeight, scale) => {
          const slices = calculatePageSlices(breakPoints, totalHeight, scale);
          
          // 每个切片的起始位置应该与对应的分页点匹配
          for (let i = 0; i < slices.length; i++) {
            expect(slices[i].startY).toBe(breakPoints[i] * scale);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5: 页面底部空白应该被保留而非填充部分内容', () => {
    fc.assert(
      fc.property(
        contentBlocksArbitrary,
        (blocks) => {
          const config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG;
          const { breakPoints } = calculateBreakPoints(blocks, config);
          const pageContentHeight = (config.pageHeightMm - config.marginMm * 2) * MM_TO_PX;
          
          // 对于每一页，检查是否有内容块被部分截断
          for (let i = 0; i < breakPoints.length; i++) {
            const pageStart = breakPoints[i];
            const pageEnd = i < breakPoints.length - 1
              ? breakPoints[i + 1]
              : blocks[blocks.length - 1].top + blocks[blocks.length - 1].height;
            
            // 检查页面内的所有块
            for (const block of blocks) {
              const blockEnd = block.top + block.height;
              
              // 如果块在当前页开始
              if (block.top >= pageStart && block.top < pageEnd) {
                // 块应该完全在当前页内，或者块的起始位置就是下一页的分页点
                if (blockEnd > pageEnd && block.height < pageContentHeight) {
                  // 如果块超出当前页但小于页面高度，它应该被移到下一页
                  // 即分页点应该在块的起始位置
                  expect(breakPoints).toContain(block.top);
                }
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
