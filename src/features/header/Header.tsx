import React, { useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { useResume } from '../resume/ResumeContext';
import { useLanguage } from '../../i18n';
import { Download, Upload, Trash2, Printer, Palette, ZoomIn, ZoomOut, FileDown, Globe, Menu, X } from 'lucide-react';
import { renderPDF } from '../../lib/pdf/pdfRenderer';

interface HeaderProps {
    zoom: number;
    setZoom: (z: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ zoom, setZoom }) => {
    const { resumeData, setResumeData, resetResume, updateSettings } = useResume();
    const { language, setLanguage, t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'zh' : 'en');
    };

    const handlePrint = () => {
        const element = document.getElementById('resume-preview');
        if (!element) {
            window.print();
            return;
        }

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

        // 智能分页CSS样式
        const pageBreakStyles = `
            /* 智能分页控制 */
            .resume-section {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            .resume-section-header {
                page-break-after: avoid !important;
                break-after: avoid !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            .resume-item {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            .skill-group {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            .highlight-item {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
        `;

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

        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>简历</title>
                <style>
                    ${styles}
                    ${pageBreakStyles}
                    @page { size: A4; margin: 12mm; }
                    html, body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    #print-content { width: 210mm; min-height: 297mm; margin: 0; padding: 12mm; background: white; box-sizing: border-box; }
                    .print\\:hidden, [class*="ring-2"], button, .cursor-move { display: none !important; }
                </style>
            </head>
            <body><div id="print-content">${element.innerHTML}</div></body>
            </html>
        `);
        iframeDoc.close();

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.print();
                setTimeout(() => { document.body.removeChild(iframe); }, 100);
            }, 100);
        };

        setTimeout(() => {
            if (document.body.contains(iframe)) {
                iframe.contentWindow?.print();
                setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 100);
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

        const wasEditMode = resumeData.settings.editMode;
        const savedPositions = resumeData.settings.elementPositions;
        const savedZoom = zoom;
        
        // 临时禁用编辑模式和重置缩放
        updateSettings({ editMode: false, elementPositions: {} });
        setZoom(1);
        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            // 使用智能分页PDF渲染器
            const pdf = await renderPDF(element, {
                scale: 3,
                pageWidth: 210,
                pageHeight: 297,
                margin: 12,
            });
            
            pdf.save(`resume-${resumeData.basics.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (error) {
            console.error('PDF generation failed', error);
            alert('Failed to generate PDF. Please try the Print option.');
        } finally {
            updateSettings({ editMode: wasEditMode || false, elementPositions: savedPositions });
            setZoom(savedZoom);
        }
    };

    const handleImportClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target?.result as string);
                setResumeData(parsed);
            } catch (err) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <header className="fixed top-4 left-4 right-4 z-50 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg shadow-gray-200/50 px-4 md:px-6 py-3 hide-print">
            <div className="flex items-center justify-between">
                {/* Left section: Logo, Template, Theme, Language */}
                <div className="flex items-center gap-2 md:gap-4">
                    <h1 className="text-lg font-bold tracking-tight font-heading hidden md:block">{t.appTitle}</h1>
                    
                    {/* Template selector */}
                    <select
                        value={resumeData.settings.template}
                        onChange={(e) => updateSettings({ template: e.target.value as any })}
                        className="h-9 w-28 md:w-32 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200 hidden md:block" />

                    {/* Theme color picker */}
                    <label className="flex items-center gap-1 cursor-pointer transition-colors duration-200 hover:bg-gray-100 rounded-lg p-1.5">
                        <Palette className="w-4 h-4 text-gray-600" />
                        <input
                            type="color"
                            value={resumeData.settings.themeColor}
                            onChange={(e) => updateSettings({ themeColor: e.target.value })}
                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                            title="Theme Color"
                        />
                    </label>

                    {/* Language toggle */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toggleLanguage} 
                        title="Switch Language"
                        className="cursor-pointer transition-colors duration-200"
                    >
                        <Globe className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">{language === 'en' ? '中文' : 'EN'}</span>
                    </Button>
                </div>

                {/* Right section: Actions */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Zoom controls */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 cursor-pointer transition-colors duration-200" 
                            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs w-10 text-center font-medium">{Math.round(zoom * 100)}%</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 cursor-pointer transition-colors duration-200" 
                            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Reset button */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetResume} 
                        title={t.reset}
                        className="cursor-pointer transition-colors duration-200"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200 mx-1" />

                    {/* Import/Export buttons */}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleImportClick}
                        className="cursor-pointer transition-colors duration-200"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        {t.import}
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExportJSON}
                        className="cursor-pointer transition-colors duration-200"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {t.export}
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDownloadPDF} 
                        title={t.downloadPDF}
                        className="cursor-pointer transition-colors duration-200"
                    >
                        <FileDown className="w-4 h-4 mr-2" />
                        {t.downloadPDF}
                    </Button>
                    <Button 
                        onClick={handlePrint} 
                        className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors duration-200"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        {t.print}
                    </Button>
                </div>

                {/* Mobile menu button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden cursor-pointer transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
            </div>

            {/* Mobile dropdown menu */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-3 pt-3 border-t border-gray-200/50 space-y-2">
                    {/* Zoom controls */}
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 cursor-pointer transition-colors duration-200" 
                            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm w-14 text-center font-medium">{Math.round(zoom * 100)}%</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 cursor-pointer transition-colors duration-200" 
                            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Action buttons grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleImportClick}
                            className="w-full cursor-pointer transition-colors duration-200"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {t.import}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleExportJSON}
                            className="w-full cursor-pointer transition-colors duration-200"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {t.export}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDownloadPDF}
                            className="w-full cursor-pointer transition-colors duration-200"
                        >
                            <FileDown className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={resetResume}
                            className="w-full cursor-pointer transition-colors duration-200"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t.reset}
                        </Button>
                    </div>

                    {/* Print button full width */}
                    <Button 
                        onClick={handlePrint} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors duration-200"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        {t.print}
                    </Button>
                </div>
            )}
        </header>
    );
};
