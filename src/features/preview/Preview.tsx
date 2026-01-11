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
            {/* 编辑模式工具栏 - 固定在预览区域上方 */}
            <div className="mb-3 print:hidden">
                <div className="flex items-center justify-between flex-wrap gap-2 py-2">
                    {/* 编辑模式提示 */}
                    {editMode && (
                        <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            编辑模式：点击内容可直接编辑，拖拽图标可自由移动元素
                        </span>
                    )}
                    {!editMode && <div />}
                    
                    <div className="flex items-center gap-2">
                        {/* 重置位置按钮 */}
                        {editMode && hasCustomPositions && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetPositions}
                                className="gap-2 text-gray-500 hover:text-gray-700"
                            >
                                <RotateCcw className="w-4 h-4" />
                                重置位置
                            </Button>
                        )}
                        
                        {/* 编辑模式切换按钮 */}
                        <Button
                            variant={editMode ? "default" : "outline"}
                            size="sm"
                            onClick={toggleEditMode}
                            className="gap-2 shrink-0"
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

            <div
                id="resume-preview"
                ref={containerRef}
                className={`bg-white shadow-2xl print:shadow-none origin-top text-left ${editMode ? 'ring-2 ring-blue-200' : ''}`}
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    transformOrigin: 'top center',
                }}
            >
                <div className="p-[12mm] min-h-[297mm]">
                    <TemplateComponent data={resumeData} />
                </div>
            </div>
        </div>
    );
};
