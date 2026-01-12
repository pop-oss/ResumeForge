/**
 * 分页计算器
 * 负责分析简历DOM结构，识别内容块，计算最优分页点
 */

import type {
  ContentBlock,
  ContentBlockType,
  PageBreakResult,
  PageBreakConfig,
} from './types';
import {
  DEFAULT_PAGE_BREAK_CONFIG,
  MM_TO_PX,
  PX_TO_MM,
} from './types';

/**
 * CSS类名选择器配置
 */
const SELECTORS = {
  section: '.resume-section',
  sectionHeader: '.resume-section-header',
  sectionItem: '.resume-item',
  skillGroup: '.skill-group',
  highlightItem: '.highlight-item',
};

/**
 * 生成唯一ID
 */
let idCounter = 0;
function generateId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * 重置ID计数器（用于测试）
 */
export function resetIdCounter(): void {
  idCounter = 0;
}

/**
 * 分析简历DOM，识别所有内容块
 * @param resumeElement 简历根元素
 * @returns 内容块数组，按位置排序
 */
export function analyzeContentBlocks(resumeElement: HTMLElement): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const resumeRect = resumeElement.getBoundingClientRect();
  const resumeTop = resumeRect.top;

  // 查找所有section
  const sections = resumeElement.querySelectorAll(SELECTORS.section);
  
  sections.forEach((section) => {
    const sectionEl = section as HTMLElement;
    const sectionRect = sectionEl.getBoundingClientRect();
    const sectionId = generateId('section');

    // 添加section容器
    blocks.push({
      id: sectionId,
      element: sectionEl,
      type: 'section',
      top: sectionRect.top - resumeTop,
      height: sectionRect.height,
      canBreak: true,
      mustKeepWithNext: false,
    });

    // 查找section标题
    const header = sectionEl.querySelector(SELECTORS.sectionHeader) as HTMLElement;
    if (header) {
      const headerRect = header.getBoundingClientRect();
      blocks.push({
        id: generateId('header'),
        element: header,
        type: 'section-header',
        top: headerRect.top - resumeTop,
        height: headerRect.height,
        canBreak: true,
        mustKeepWithNext: true, // 标题必须与后续内容在同一页
        parentId: sectionId,
      });
    }

    // 查找section内的条目
    const items = sectionEl.querySelectorAll(SELECTORS.sectionItem);
    items.forEach((item, index) => {
      const itemEl = item as HTMLElement;
      const itemRect = itemEl.getBoundingClientRect();
      const itemId = generateId('item');

      blocks.push({
        id: itemId,
        element: itemEl,
        type: 'section-item',
        top: itemRect.top - resumeTop,
        height: itemRect.height,
        canBreak: index > 0, // 第一个条目不能与标题分开
        mustKeepWithNext: false,
        parentId: sectionId,
      });

      // 查找条目内的highlight
      const highlights = itemEl.querySelectorAll(SELECTORS.highlightItem);
      highlights.forEach((highlight) => {
        const highlightEl = highlight as HTMLElement;
        const highlightRect = highlightEl.getBoundingClientRect();
        blocks.push({
          id: generateId('highlight'),
          element: highlightEl,
          type: 'highlight-item',
          top: highlightRect.top - resumeTop,
          height: highlightRect.height,
          canBreak: true,
          mustKeepWithNext: false,
          parentId: itemId,
        });
      });
    });

    // 查找技能组
    const skillGroups = sectionEl.querySelectorAll(SELECTORS.skillGroup);
    skillGroups.forEach((group, index) => {
      const groupEl = group as HTMLElement;
      const groupRect = groupEl.getBoundingClientRect();
      blocks.push({
        id: generateId('skill'),
        element: groupEl,
        type: 'skill-group',
        top: groupRect.top - resumeTop,
        height: groupRect.height,
        canBreak: index > 0, // 第一个技能组不能与标题分开
        mustKeepWithNext: false,
        parentId: sectionId,
      });
    });
  });

  // 按位置排序
  blocks.sort((a, b) => a.top - b.top);

  return blocks;
}

/**
 * 计算最优分页点
 * @param blocks 内容块数组
 * @param config 分页配置
 * @returns 分页结果
 */
export function calculateBreakPoints(
  blocks: ContentBlock[],
  config: PageBreakConfig = DEFAULT_PAGE_BREAK_CONFIG
): PageBreakResult {
  const warnings: string[] = [];
  const breakPoints: number[] = [0]; // 第一页从0开始

  // 计算页面可用高度 (px)
  const pageContentHeight = (config.pageHeightMm - config.marginMm * 2) * MM_TO_PX;
  const minHeaderSpace = config.minSectionHeaderSpace * MM_TO_PX;
  // 页面底部安全边距 (至少留15mm空白)
  const bottomSafeMargin = 15 * MM_TO_PX;

  let currentPageStart = 0;
  let currentPageEnd = pageContentHeight;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockEnd = block.top + block.height;

    // 检查section标题是否有足够的后续空间（提前检查，在超出页面之前）
    if (block.type === 'section-header' || block.type === 'section') {
      const remainingSpace = currentPageEnd - block.top;
      // 如果剩余空间不足以放下标题+至少一个条目（minHeaderSpace），则提前分页
      if (remainingSpace < minHeaderSpace + bottomSafeMargin) {
        breakPoints.push(block.top);
        currentPageStart = block.top;
        currentPageEnd = block.top + pageContentHeight;
        continue;
      }
    }

    // 检查当前块是否超出当前页
    if (blockEnd > currentPageEnd) {
      // 需要分页
      let breakPoint = findBestBreakPoint(
        blocks,
        i,
        currentPageStart,
        currentPageEnd,
        minHeaderSpace,
        pageContentHeight,
        bottomSafeMargin
      );

      // 如果找不到合适的分页点，强制在当前位置分页
      if (breakPoint === null) {
        breakPoint = block.top;
      }

      breakPoints.push(breakPoint);
      currentPageStart = breakPoint;
      currentPageEnd = breakPoint + pageContentHeight;

      // 重新检查当前块是否仍然超出（超长内容）
      if (block.height > pageContentHeight) {
        warnings.push(
          `内容块 "${block.type}" 高度(${Math.round(block.height * PX_TO_MM)}mm)超过页面可用高度(${Math.round(pageContentHeight * PX_TO_MM)}mm)，可能需要精简内容`
        );
        
        // 超长内容，需要在内部分页
        const internalBreaks = handleOversizedBlock(
          block,
          blocks,
          i,
          currentPageStart,
          pageContentHeight
        );
        
        if (internalBreaks.length > 0) {
          breakPoints.push(...internalBreaks);
          currentPageStart = internalBreaks[internalBreaks.length - 1];
          currentPageEnd = currentPageStart + pageContentHeight;
        }
      }
    }
  }

  return {
    breakPoints,
    pageCount: breakPoints.length,
    warnings,
  };
}

/**
 * 查找最佳分页点
 */
function findBestBreakPoint(
  blocks: ContentBlock[],
  currentIndex: number,
  pageStart: number,
  pageEnd: number,
  minHeaderSpace: number,
  pageContentHeight: number,
  bottomSafeMargin: number
): number | null {
  // 从当前块向前查找可以分页的位置
  for (let i = currentIndex; i >= 0; i--) {
    const block = blocks[i];
    
    // 跳过不能分页的块
    if (!block.canBreak) continue;
    
    // 检查前一个块是否必须与当前块在同一页
    if (i > 0 && blocks[i - 1].mustKeepWithNext) continue;

    // 检查分页点是否在当前页范围内（留出底部安全边距）
    if (block.top >= pageStart && block.top <= pageEnd - bottomSafeMargin) {
      // 检查是否是section或section标题，需要确保有足够空间
      if (block.type === 'section-header' || block.type === 'section') {
        const remainingSpace = pageEnd - block.top;
        if (remainingSpace < minHeaderSpace + bottomSafeMargin) {
          continue; // 空间不足，继续向前查找
        }
      }
      
      return block.top;
    }
  }

  return null;
}

/**
 * 处理超长内容块
 * 在highlight列表项之间进行分页
 */
function handleOversizedBlock(
  block: ContentBlock,
  allBlocks: ContentBlock[],
  blockIndex: number,
  pageStart: number,
  pageContentHeight: number
): number[] {
  const internalBreaks: number[] = [];
  
  // 查找该块内的子元素（highlight items）
  const childBlocks = allBlocks.filter(b => b.parentId === block.id);
  
  if (childBlocks.length === 0) {
    // 没有子元素，无法在内部分页
    return internalBreaks;
  }

  let currentEnd = pageStart + pageContentHeight;

  for (const child of childBlocks) {
    const childEnd = child.top + child.height;
    
    if (childEnd > currentEnd && child.canBreak) {
      // 在此子元素前分页
      internalBreaks.push(child.top);
      currentEnd = child.top + pageContentHeight;
    }
  }

  return internalBreaks;
}

/**
 * 获取元素相对于简历的位置信息
 */
export function getElementPosition(
  element: HTMLElement,
  resumeElement: HTMLElement
): { top: number; height: number } {
  const resumeRect = resumeElement.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  
  return {
    top: elementRect.top - resumeRect.top,
    height: elementRect.height,
  };
}
