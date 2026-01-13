/**
 * PDF渲染器
 * 负责将简历内容渲染为PDF，使用智能分页算法避免孤儿标题和文字截断
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { PDFRendererOptions, PageBreakConfig } from './types';
import { DEFAULT_PDF_RENDERER_OPTIONS, DEFAULT_PAGE_BREAK_CONFIG, MM_TO_PX } from './types';
import { analyzeContentBlocks, calculateBreakPoints } from './pageBreakCalculator';

/**
 * 页面切片信息
 */
export interface PageSlice {
  /** 起始 Y 坐标 (px) */
  startY: number;
  /** 结束 Y 坐标 (px) */
  endY: number;
  /** 切片高度 (px) */
  height: number;
}

/**
 * 根据分页点计算每页的切片信息
 * @param breakPoints 分页点数组 (px)，表示每页的起始位置
 * @param totalHeight 总高度 (px)
 * @param scale 渲染缩放比例
 * @returns 页面切片数组
 */
export function calculatePageSlices(
  breakPoints: number[],
  totalHeight: number,
  scale: number
): PageSlice[] {
  const slices: PageSlice[] = [];
  
  // 如果没有分页点或只有一个分页点（起始点），返回单页
  if (breakPoints.length === 0) {
    slices.push({
      startY: 0,
      endY: totalHeight * scale,
      height: totalHeight * scale,
    });
    return slices;
  }

  for (let i = 0; i < breakPoints.length; i++) {
    // 使用 Math.floor 确保分页点是整数，避免浮点数精度问题
    const startY = Math.floor(breakPoints[i] * scale);
    const endY = i < breakPoints.length - 1
      ? Math.floor(breakPoints[i + 1] * scale)
      : Math.ceil(totalHeight * scale);
    
    slices.push({
      startY,
      endY,
      height: endY - startY,
    });
  }

  return slices;
}


/**
 * 渲染PDF（使用智能分页）
 * @param resumeElement 简历DOM元素
 * @param options 渲染选项
 * @returns PDF文档
 */
export async function renderPDF(
  resumeElement: HTMLElement,
  options: Partial<PDFRendererOptions> = {}
): Promise<jsPDF> {
  const opts: PDFRendererOptions = { ...DEFAULT_PDF_RENDERER_OPTIONS, ...options };

  // 边距设置
  const margin = opts.margin || 12;
  const contentWidthMm = opts.pageWidth - margin * 2;
  const contentHeightMm = opts.pageHeight - margin * 2;
  
  // 计算缩放比例：将简历宽度缩放到 PDF 内容区域宽度
  const resumeWidthPx = resumeElement.scrollWidth;
  const scaleToFit = contentWidthMm / resumeWidthPx; // mm/px
  
  // 计算 PDF 页面可用高度对应的简历高度 (px)
  // contentHeightMm 是 PDF 内容区域高度 (mm)
  // scaleToFit 是 mm/px，所以 contentHeightMm / scaleToFit 得到简历像素高度
  const pageHeightInResumePx = contentHeightMm / scaleToFit;

  // 分析内容块并计算智能分页点
  // 注意：analyzeContentBlocks 返回的 top/height 是相对于简历元素的像素值
  // calculateBreakPoints 内部会将 pageHeightMm 转换为像素进行计算
  const blocks = analyzeContentBlocks(resumeElement);
  
  // 将简历像素高度转换回 mm 用于分页配置
  // pageHeightInResumePx 是简历中一页的像素高度
  // 转换为 mm: pageHeightInResumePx * PX_TO_MM，但这不对
  // 实际上我们需要直接使用 PDF 的页面高度配置
  const pageBreakConfig: PageBreakConfig = {
    ...DEFAULT_PAGE_BREAK_CONFIG,
    // 关键修复：分页算法内部使用 (pageHeightMm - marginMm * 2) * MM_TO_PX 计算可用高度
    // 我们需要让这个计算结果等于 pageHeightInResumePx
    // 即: (pageHeightMm - margin * 2) * MM_TO_PX = pageHeightInResumePx
    // 所以: pageHeightMm = pageHeightInResumePx / MM_TO_PX + margin * 2
    pageHeightMm: pageHeightInResumePx / MM_TO_PX + margin * 2,
    pageWidthMm: opts.pageWidth,
    marginMm: margin,
  };
  const { breakPoints } = calculateBreakPoints(blocks, pageBreakConfig);

  // 渲染整个简历为canvas
  const canvas = await html2canvas(resumeElement, {
    scale: opts.scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: resumeElement.scrollWidth,
    height: resumeElement.scrollHeight,
    windowWidth: resumeElement.scrollWidth,
    windowHeight: resumeElement.scrollHeight,
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 计算页面切片（基于分页点）
  const slices = calculatePageSlices(breakPoints, resumeElement.scrollHeight, opts.scale);
  
  // Canvas 尺寸
  const canvasWidth = canvas.width;
  
  // 为每一页创建独立的 canvas 切片并添加到 PDF
  for (let i = 0; i < slices.length; i++) {
    if (i > 0) pdf.addPage();
    
    const slice = slices[i];
    
    // 创建当前页的 canvas
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvasWidth;
    pageCanvas.height = slice.height;
    
    const ctx = pageCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // 填充白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    
    // 从原始 canvas 中裁剪当前页的内容
    ctx.drawImage(
      canvas,
      0, slice.startY,           // 源图像的起始位置
      canvasWidth, slice.height, // 源图像的裁剪尺寸
      0, 0,                      // 目标位置
      canvasWidth, slice.height  // 目标尺寸
    );
    
    // 转换为图片数据
    const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
    
    // 计算当前切片在 PDF 中的高度
    const sliceHeightMm = (slice.height / opts.scale) * scaleToFit;
    
    // 添加到 PDF
    pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidthMm, sliceHeightMm, undefined, 'FAST');
  }

  return pdf;
}


/**
 * 简化版PDF渲染（使用CSS分页）
 * 这个版本依赖浏览器的CSS分页规则，更简单但可能不够精确
 */
export async function renderPDFSimple(
  resumeElement: HTMLElement,
  options: Partial<PDFRendererOptions> = {}
): Promise<jsPDF> {
  const opts: PDFRendererOptions = { ...DEFAULT_PDF_RENDERER_OPTIONS, ...options };

  // 渲染整个简历为canvas
  const canvas = await html2canvas(resumeElement, {
    scale: opts.scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: resumeElement.scrollWidth,
    height: resumeElement.scrollHeight,
    windowWidth: resumeElement.scrollWidth,
    windowHeight: resumeElement.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = opts.pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pageCount = Math.ceil(imgHeight / opts.pageHeight);

  // 分页添加图片
  for (let i = 0; i < pageCount; i++) {
    if (i > 0) pdf.addPage();
    const yOffset = -i * opts.pageHeight;
    pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight, undefined, 'FAST');
  }

  return pdf;
}

export { analyzeContentBlocks, calculateBreakPoints };
