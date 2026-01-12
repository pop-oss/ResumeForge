/**
 * PDF渲染器
 * 负责将简历内容渲染为PDF，支持智能分页
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { PDFRendererOptions, PageBreakConfig } from './types';
import { DEFAULT_PDF_RENDERER_OPTIONS, DEFAULT_PAGE_BREAK_CONFIG, MM_TO_PX } from './types';
import { analyzeContentBlocks, calculateBreakPoints } from './pageBreakCalculator';

/**
 * 渲染PDF
 * @param resumeElement 简历DOM元素
 * @param options 渲染选项
 * @param config 分页配置
 * @returns PDF文档
 */
export async function renderPDF(
  resumeElement: HTMLElement,
  options: Partial<PDFRendererOptions> = {},
  config: Partial<PageBreakConfig> = {}
): Promise<jsPDF> {
  const opts: PDFRendererOptions = { ...DEFAULT_PDF_RENDERER_OPTIONS, ...options };
  const cfg: PageBreakConfig = { ...DEFAULT_PAGE_BREAK_CONFIG, ...config };

  // 分析内容块并计算分页点
  const blocks = analyzeContentBlocks(resumeElement);
  const { breakPoints, warnings } = calculateBreakPoints(blocks, cfg);

  // 输出警告
  if (warnings.length > 0) {
    console.warn('PDF分页警告:', warnings);
  }

  // 计算页面尺寸
  const pageContentHeight = (cfg.pageHeightMm - cfg.marginMm * 2) * MM_TO_PX;
  const totalHeight = resumeElement.scrollHeight;
  
  // 如果内容在一页内，使用简单渲染
  if (breakPoints.length <= 1 || totalHeight <= pageContentHeight) {
    return renderSinglePage(resumeElement, opts);
  }

  // 多页渲染
  return renderMultiplePages(resumeElement, breakPoints, opts, cfg);
}

/**
 * 渲染单页PDF
 */
async function renderSinglePage(
  resumeElement: HTMLElement,
  options: PDFRendererOptions
): Promise<jsPDF> {
  const canvas = await html2canvas(resumeElement, {
    scale: options.scale,
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

  const imgWidth = options.pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

  return pdf;
}

/**
 * 渲染多页PDF（智能分页）
 */
async function renderMultiplePages(
  resumeElement: HTMLElement,
  breakPoints: number[],
  options: PDFRendererOptions,
  config: PageBreakConfig
): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageContentHeightPx = (config.pageHeightMm - config.marginMm * 2) * MM_TO_PX;
  const totalHeight = resumeElement.scrollHeight;

  // 为每个分页点渲染一页
  for (let i = 0; i < breakPoints.length; i++) {
    const startY = breakPoints[i];
    const endY = i < breakPoints.length - 1 
      ? breakPoints[i + 1] 
      : totalHeight;
    
    const pageHeight = Math.min(endY - startY, pageContentHeightPx);

    if (i > 0) {
      pdf.addPage();
    }

    // 渲染当前页
    await renderPageSection(
      pdf,
      resumeElement,
      startY,
      pageHeight,
      options,
      config
    );
  }

  return pdf;
}

/**
 * 渲染PDF的一个页面区域
 */
async function renderPageSection(
  pdf: jsPDF,
  resumeElement: HTMLElement,
  startY: number,
  height: number,
  options: PDFRendererOptions,
  config: PageBreakConfig
): Promise<void> {
  // 创建临时容器来裁剪内容
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${resumeElement.scrollWidth}px`;
  container.style.height = `${height}px`;
  container.style.overflow = 'hidden';
  container.style.backgroundColor = '#ffffff';

  // 克隆简历内容
  const clone = resumeElement.cloneNode(true) as HTMLElement;
  clone.style.position = 'relative';
  clone.style.top = `-${startY}px`;
  clone.style.margin = '0';
  clone.style.padding = `${config.marginMm}mm`;
  
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // 渲染为canvas
    const canvas = await html2canvas(container, {
      scale: options.scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: resumeElement.scrollWidth,
      height: height,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const imgWidth = options.pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 添加到PDF，保持边距
    pdf.addImage(
      imgData,
      'PNG',
      0,
      0,
      imgWidth,
      Math.min(imgHeight, options.pageHeight),
      undefined,
      'FAST'
    );
  } finally {
    // 清理临时元素
    document.body.removeChild(container);
  }
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
