import React, { useRef } from 'react';
import { Button } from '../../components/ui/button';
import { useResume } from '../resume/ResumeContext';
import { useLanguage } from '../../i18n';
import { Download, Upload, Trash2, Printer, Palette, ZoomIn, ZoomOut, FileDown, Globe } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface HeaderProps {
    zoom: number;
    setZoom: (z: number) => void;
}

// Just wrapping Select for simplicity or use native select for now if I didn't create Shadcn one fully.
// I created Select primitive imports but did not create the Select UI component file yet.
// I'll stick to a simple HTML select or buttons to avoid "Select is not exported" error since I didn't verify Select component creation.
// Actually I missed creating `src/components/ui/select.tsx`. 
// I will use simple buttons or native select for robustness now.

export const Header: React.FC<HeaderProps> = ({ zoom, setZoom }) => {
    const { resumeData, setResumeData, resetResume, updateSettings } = useResume();
    const { language, setLanguage, t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'zh' : 'en');
    };

    const handlePrint = () => {
        const element = document.getElementById('resume-preview');
        if (!element) {
            window.print();
            return;
        }

        // 获取所有样式
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');

        // 创建隐藏的 iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.left = '-9999px';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
            window.print();
            return;
        }

        // 写入打印内容
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>简历</title>
                <style>
                    ${styles}
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        background: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    #print-content {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    .print\\:hidden, [class*="ring-2"], button, .cursor-move {
                        display: none !important;
                    }
                </style>
            </head>
            <body>
                <div id="print-content">
                    ${element.innerHTML}
                </div>
            </body>
            </html>
        `);
        iframeDoc.close();

        // 等待 iframe 加载完成后打印
        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.print();
                // 打印完成后移除 iframe
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 100);
            }, 100);
        };

        // 备用触发
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                iframe.contentWindow?.print();
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 100);
            }
        }, 500);
    };

    const handleExportJSON = () => {
        const dataStr = JSON.stringify(resumeData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${resumeData.basics.name.replace(/\s+/g, '-').toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('resume-preview');
        if (!element) return;

        // A4 尺寸常量 (mm)
        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;
        
        // 像素转换比例 (96 DPI)
        const MM_TO_PX = 3.7795275591;
        const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX;
        const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX;

        // 保存当前状态，导出时临时重置
        const wasEditMode = resumeData.settings.editMode;
        const savedPositions = resumeData.settings.elementPositions;
        const savedZoom = zoom;
        
        // 临时关闭编辑模式、清除位置偏移，并重置缩放为100%
        updateSettings({ editMode: false, elementPositions: {} });
        setZoom(1); // 重置缩放为100%以确保PDF正确渲染
        // 等待 React 重新渲染
        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            // 高质量渲染
            const canvas = await html2canvas(element, {
                scale: 3, // 更高的缩放比例获得更清晰的图像
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: element.scrollWidth,
                height: element.scrollHeight,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // 计算图片在 PDF 中的尺寸
            const imgWidth = A4_WIDTH_MM;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // 计算需要多少页
            const pageCount = Math.ceil(imgHeight / A4_HEIGHT_MM);
            
            for (let i = 0; i < pageCount; i++) {
                if (i > 0) {
                    pdf.addPage();
                }
                
                // 计算当前页的 Y 偏移
                const yOffset = -i * A4_HEIGHT_MM;
                
                pdf.addImage(
                    imgData, 
                    'PNG', 
                    0, 
                    yOffset, 
                    imgWidth, 
                    imgHeight,
                    undefined,
                    'FAST'
                );
            }
            
            pdf.save(`resume-${resumeData.basics.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (error) {
            console.error('PDF generation failed', error);
            alert('Failed to generate PDF. Please try the Print option.');
        } finally {
            // 恢复原来的状态
            updateSettings({ 
                editMode: wasEditMode || false, 
                elementPositions: savedPositions 
            });
            setZoom(savedZoom); // 恢复原来的缩放比例
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target?.result as string);
                // Basic validation could go here
                setResumeData(parsed);
            } catch (err) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // reset
    };

    return (
        <header className="h-16 border-b px-4 sm:px-6 flex items-center justify-between bg-background z-50 hide-print shrink-0">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold tracking-tight hidden sm:block">{t.appTitle}</h1>
                <div className="flex items-center gap-2">
                    <select
                        value={resumeData.settings.template}
                        onChange={(e) => updateSettings({ template: e.target.value as any })}
                        className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        title="Select Template"
                    >
                        <option value="classic">{t.classic}</option>
                        <option value="modern">{t.modern}</option>
                        <option value="minimal">{t.minimal}</option>
                        <option value="professional">{t.professional}</option>
                        <option value="elegant">{t.elegant}</option>
                        <option value="creative">{t.creative}</option>
                        <option value="executive">{t.executive}</option>
                        <option value="tech">{t.tech}</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                        <Palette className="w-4 h-4" />
                        <input
                            type="color"
                            value={resumeData.settings.themeColor}
                            onChange={(e) => updateSettings({ themeColor: e.target.value })}
                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                            title="Theme Color"
                        />
                    </label>
                </div>
                <Button variant="outline" size="sm" onClick={toggleLanguage} title="Switch Language">
                    <Globe className="w-4 h-4 mr-1" />
                    {language === 'en' ? '中文' : 'EN'}
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center bg-muted rounded-md p-1 mr-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                        <ZoomOut className="w-3 h-3" />
                    </Button>
                    <span className="text-xs w-8 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                        <ZoomIn className="w-3 h-3" />
                    </Button>
                </div>

                <Button variant="ghost" size="sm" onClick={resetResume} title={t.reset}>
                    <Trash2 className="w-4 h-4" />
                </Button>
                <div className="h-6 w-[1px] bg-border mx-1" />

                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                <Button variant="outline" size="sm" onClick={handleImportClick}>
                    <Upload className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t.import}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportJSON}>
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t.export}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} title={t.downloadPDF}>
                    <FileDown className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t.downloadPDF}</span>
                </Button>
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Printer className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t.print}</span>
                </Button>
            </div>
        </header>
    );
};
