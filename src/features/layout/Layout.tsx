import React, { useState } from 'react';
import { Header } from '../header/Header';
import { Editor } from '../editor/Editor';
import { Preview } from '../preview/Preview';
import { Edit2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Layout: React.FC = () => {
    const [zoom, setZoom] = useState(0.8);
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
        <div className="flex flex-col h-screen overflow-hidden font-body print:h-auto print:overflow-visible bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            {/* Header - floating, hidden on print */}
            <div className="print:hidden">
                <Header zoom={zoom} setZoom={setZoom} />
            </div>

            {/* Spacer for floating header */}
            <div className="h-20 shrink-0 print:hidden" />

            {/* Mobile Tab Controls - hidden on print */}
            <div className="md:hidden flex border-b border-gray-200 bg-white/80 backdrop-blur-sm text-sm font-medium shrink-0 print:hidden">
                <button
                    className={cn(
                        "flex-1 py-3 flex items-center justify-center gap-2 border-b-2",
                        "cursor-pointer transition-colors duration-200",
                        mobileTab === 'editor' 
                            ? "border-blue-600 text-blue-600" 
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                    onClick={() => setMobileTab('editor')}
                >
                    <Edit2 className="w-4 h-4" /> Editor
                </button>
                <button
                    className={cn(
                        "flex-1 py-3 flex items-center justify-center gap-2 border-b-2",
                        "cursor-pointer transition-colors duration-200",
                        mobileTab === 'preview' 
                            ? "border-blue-600 text-blue-600" 
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                    onClick={() => setMobileTab('preview')}
                >
                    <Eye className="w-4 h-4" /> Preview
                </button>
            </div>

            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden relative print:block print:overflow-visible">
                {/* Editor Panel - hidden on print */}
                {/* Tablet (768px-1024px): 40% width */}
                {/* Desktop (> 1024px): 33% width */}
                <div className={cn(
                    "w-full",
                    // Responsive widths per design spec
                    "md:w-[40%]",      // Tablet: 40%
                    "lg:w-[33%]",      // Desktop: 33%
                    "flex flex-col",
                    "absolute md:relative inset-0 z-10",
                    "bg-white",
                    "transition-transform duration-300 ease-out",
                    "md:translate-x-0",
                    "print:hidden",
                    // Mobile tab switching
                    mobileTab === 'editor' ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}>
                    <Editor />
                </div>
                
                {/* Preview Panel - full screen on print */}
                {/* Tablet (768px-1024px): 60% width */}
                {/* Desktop (> 1024px): 67% width */}
                <div
                    ref={containerRef}
                    className={cn(
                        "w-full h-full flex-1",
                        // Responsive widths per design spec
                        "md:w-[60%]",     // Tablet: 60%
                        "lg:w-[67%]",     // Desktop: 67%
                        // Gradient background
                        "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50",
                        "relative overflow-hidden",
                        "flex flex-col items-center",
                        "p-4 sm:p-8",
                        "absolute md:relative inset-0 z-0",
                        "transition-opacity duration-300 ease-out",
                        "md:opacity-100",
                        // Print styles
                        "print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:w-auto print:h-auto print:flex-none",
                        // Mobile tab switching
                        mobileTab === 'preview' 
                            ? "opacity-100 z-20" 
                            : "opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
                    )}
                >
                    {/* Scrollable preview container - no horizontal scroll */}
                    <div className="w-full h-full overflow-auto overflow-x-hidden flex justify-center items-start pt-8 pb-20 custom-scrollbar print:overflow-visible print:p-0 print:block print:w-auto print:h-auto">
                        <div 
                            style={{ 
                                transform: `scale(${zoom})`, 
                                transformOrigin: 'top center', 
                                // Smooth zoom animation with ease-out
                                transition: 'transform 200ms ease-out' 
                            }}
                            className="print:!transform-none print:!scale-100"
                        >
                            <Preview />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
