/**
 * PDF渲染器
 * 负责将简历内容渲染为PDF
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { PDFRendererOptions } from './types';
import { DEFAULT_PDF_RENDERER_OPTIONS } from './types';
import { analyzeContentBlocks, calculateBreakPoints } from './pageBreakCalculator';

/**
 * 渲染PDF
 * @param resumeElement 简历DOM元素
 * @param options 渲染选项
 * @returns PDF文档
 */
export async function renderPDF(
  resumeElement: HTMLElement,
  options: Partial<PDFRendererOptions> = {}
): Promise<jsPDF> {
  const opts: PDFRendererOptions = { ...DEFAULT_PDF_RENDERER_OPTIONS, ...options };

  // 先渲染整个简历为canvas
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

  // 边距设置
  const margin = opts.margin || 18; // 默认18mm边距，更美观
  const contentWidth = opts.pageWidth - margin * 2; // 内容区域宽度 (186mm)
  const contentHeight = opts.pageHeight - margin * 2; // 内容区域高度 (273mm)
  
  // 计算缩放比例
  const scale = contentWidth / resumeElement.scrollWidth;
  const totalHeightMm = resumeElement.scrollHeight * scale;
  
  const pageCount = Math.ceil(totalHeightMm / contentHeight);
  
  // 每页内容在原始canvas中的高度（像素）
  const contentHeightPx = contentHeight / scale;

  // 分页渲染
  for (let i = 0; i < pageCount; i++) {
    if (i > 0) pdf.addPage();
    
    // 计算当前页在canvas中的起始位置和高度
    const startY = i * contentHeightPx * opts.scale;
    const sliceHeight = Math.min(contentHeightPx * opts.scale, canvas.height - startY);
    
    // 创建当前页的canvas切片
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      // 填充白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      // 从原canvas复制当前页的内容
      ctx.drawImage(
        canvas,
        0, startY, canvas.width, sliceHeight,  // 源区域
        0, 0, canvas.width, sliceHeight         // 目标区域
      );
    }
    
    const imgData = pageCanvas.toDataURL('image/png', 1.0);
    const imgHeightMm = (sliceHeight / opts.scale) * scale;
    
    // 添加到PDF，带边距
    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeightMm, undefined, 'FAST');
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
