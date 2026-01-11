import React, { useState } from 'react';
import { Header } from '../header/Header';
import { Editor } from '../editor/Editor';
import { Preview } from '../preview/Preview';
import { Edit2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Layout: React.FC = () => {
    const [zoom, setZoom] = useState(0.8); // Default slightly zoomed out
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Initial Auto-Fit
    React.useEffect(() => {
        if (containerRef.current) {
            const { clientWidth } = containerRef.current;
            const desiredWidth = 840;
            const calculatedZoom = Math.min(1.2, (clientWidth - 40) / desiredWidth);
            setZoom(Math.max(0.4, calculatedZoom));
        }
    }, []);

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden font-sans print:h-auto print:overflow-visible">
            {/* Header - 打印时隐藏 */}
            <div className="print:hidden">
                <Header zoom={zoom} setZoom={setZoom} />
            </div>

            {/* Mobile Tab Controls - 打印时隐藏 */}
            <div className="md:hidden flex border-b bg-muted/40 text-sm font-medium shrink-0 print:hidden">
                <button
                    className={cn("flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors", mobileTab === 'editor' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}
                    onClick={() => setMobileTab('editor')}
                >
                    <Edit2 className="w-4 h-4" /> Editor
                </button>
                <button
                    className={cn("flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors", mobileTab === 'preview' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}
                    onClick={() => setMobileTab('preview')}
                >
                    <Eye className="w-4 h-4" /> Preview
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden relative print:block print:overflow-visible">
                {/* Editor - 打印时隐藏 */}
                <div className={cn(
                    "w-full md:w-5/12 lg:w-1/3 border-r bg-muted/30 flex flex-col absolute md:relative inset-0 z-10 bg-background transition-transform duration-300 md:translate-x-0 print:hidden",
                    mobileTab === 'editor' ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}>
                    <Editor />
                </div>
                
                {/* Preview - 打印时全屏显示 */}
                <div
                    ref={containerRef}
                    className={cn(
                        "w-full h-full flex-1 bg-slate-100/50 relative overflow-hidden flex flex-col items-center p-4 sm:p-8 absolute md:relative inset-0 z-0 transition-opacity duration-300 md:opacity-100",
                        "print:absolute print:inset-0 print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-auto print:h-auto",
                        mobileTab === 'preview' ? "opacity-100 z-20 bg-slate-100/50" : "opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
                    )}>
                    <div className="w-full h-full overflow-auto flex justify-center items-start pt-8 pb-20 custom-scrollbar print:overflow-visible print:p-0 print:block">
                        <div 
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}
                            className="print:!transform-none"
                        >
                            <Preview />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
