import React, { useRef } from 'react';
import { useResume } from '../resume/ResumeContext';
import type { TemplateType } from '../resume/types';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { ElegantTemplate } from './templates/ElegantTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';
import { TechTemplate } from './templates/TechTemplate';
import { Pencil, Check, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const TEMPLATES: Record<TemplateType, React.FC<{ data: any }>> = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    minimal: MinimalTemplate,
    elegant: ElegantTemplate,
    creative: CreativeTemplate,
    professional: ProfessionalTemplate,
    executive: ExecutiveTemplate,
    tech: TechTemplate,
};

export const Preview: React.FC = () => {
    const { resumeData, updateSettings } = useResume();
    const { template, editMode, elementPositions } = resumeData.settings;
    const containerRef = useRef<HTMLDivElement>(null);
    
    const TemplateComponent = TEMPLATES[template] || ClassicTemplate;

    const toggleEditMode = () => {
        updateSettings({ editMode: !editMode });
    };

    const resetPositions = () => {
        updateSettings({ elementPositions: {} });
    };

    const hasCustomPositions = elementPositions && Object.keys(elementPositions).length > 0;

    return (
        <div className="relative">
            {/* Edit mode toolbar - glassmorphism styling */}
            <div className="mb-4 print:hidden">
                <div className={cn(
                    "inline-flex items-center gap-3",
                    "bg-white/90 backdrop-blur-sm",
                    "border border-gray-200/50 rounded-full",
                    "px-4 py-2",
                    "shadow-sm"
                )}>
                    {/* Edit mode indicator */}
                    {editMode && (
                        <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                            编辑模式：点击内容可直接编辑，拖拽图标可自由移动元素
                        </span>
                    )}
                    
                    <div className="flex items-center gap-2">
                        {/* Reset positions button */}
                        {editMode && hasCustomPositions && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetPositions}
                                className="gap-2 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200"
                            >
                                <RotateCcw className="w-4 h-4" />
                                重置位置
                            </Button>
                        )}
                        
                        {/* Edit mode toggle button */}
                        <Button
                            variant={editMode ? "default" : "outline"}
                            size="sm"
                            onClick={toggleEditMode}
                            className={cn(
                                "gap-2 shrink-0 cursor-pointer",
                                "transition-all duration-200 ease-out"
                            )}
                        >
                            {editMode ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    完成编辑
                                </>
                            ) : (
                                <>
                                    <Pencil className="w-4 h-4" />
                                    编辑排版
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Resume paper with realistic shadow */}
            <div
                id="resume-preview"
                ref={containerRef}
                className={cn(
                    // Base paper styles
                    "bg-white text-left origin-top",
                    // Paper shadow effect
                    "shadow-paper",
                    "ring-1 ring-gray-200/50",
                    // Print styles
                    "print:shadow-none print:ring-0",
                    // Edit mode indicator - blue border
                    editMode && "ring-2 ring-blue-400/50"
                )}
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    transformOrigin: 'top center',
                    // Smooth zoom animation with ease-out
                    transition: 'transform 200ms ease-out',
                }}
            >
                <div className="p-[12mm] min-h-[297mm]">
                    <TemplateComponent data={resumeData} />
                </div>
            </div>
        </div>
    );
};
