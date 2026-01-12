/**
 * PDF分页优化类型定义
 * 用于智能分页算法，避免内容在页面分界处被截断
 */

/**
 * 内容块类型
 */
export type ContentBlockType =
  | 'section-header'   // Section标题 (如"工作经历"、"专业技能")
  | 'section-item'     // Section内的条目 (如一条工作经历)
  | 'skill-group'      // 技能组 (如"Frontend: React, TypeScript...")
  | 'highlight-item'   // 条目内的highlight列表项
  | 'section';         // 整个Section容器

/**
 * 内容块信息
 */
export interface ContentBlock {
  /** 唯一标识符 */
  id: string;
  /** DOM元素引用 */
  element: HTMLElement;
  /** 内容块类型 */
  type: ContentBlockType;
  /** 相对于简历顶部的位置 (px) */
  top: number;
  /** 元素高度 (px) */
  height: number;
  /** 是否可以在此元素前分页 */
  canBreak: boolean;
  /** 是否必须与下一个元素保持在同一页 */
  mustKeepWithNext: boolean;
  /** 父级内容块ID */
  parentId?: string;
}

/**
 * 分页计算结果
 */
export interface PageBreakResult {
  /** 分页点位置数组 (px)，表示每页的起始位置 */
  breakPoints: number[];
  /** 总页数 */
  pageCount: number;
  /** 无法避免截断的警告信息 */
  warnings: string[];
}

/**
 * 分页配置
 */
export interface PageBreakConfig {
  /** A4页面高度 (mm) */
  pageHeightMm: number;
  /** A4页面宽度 (mm) */
  pageWidthMm: number;
  /** 页面边距 (mm) */
  marginMm: number;
  /** Section标题后最小空间 (mm) */
  minSectionHeaderSpace: number;
  /** 条目后最小空间 (mm) */
  minItemSpace: number;
}

/**
 * 默认分页配置
 */
export const DEFAULT_PAGE_BREAK_CONFIG: PageBreakConfig = {
  pageHeightMm: 297,
  pageWidthMm: 210,
  marginMm: 12,
  minSectionHeaderSpace: 40,
  minItemSpace: 20,
};

/**
 * PDF渲染选项
 */
export interface PDFRendererOptions {
  /** 渲染缩放比例 */
  scale: number;
  /** 页面宽度 (mm) */
  pageWidth: number;
  /** 页面高度 (mm) */
  pageHeight: number;
  /** 页面边距 (mm) */
  margin: number;
}

/**
 * 默认PDF渲染选项
 */
export const DEFAULT_PDF_RENDERER_OPTIONS: PDFRendererOptions = {
  scale: 3,
  pageWidth: 210,
  pageHeight: 297,
  margin: 12,
};

/**
 * mm转px的转换系数 (96 DPI)
 */
export const MM_TO_PX = 3.7795275591;

/**
 * px转mm的转换系数
 */
export const PX_TO_MM = 1 / MM_TO_PX;
