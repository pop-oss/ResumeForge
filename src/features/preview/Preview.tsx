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
    const { resumeData } = useResume();
    const { template } = resumeData.settings;
    const containerRef = useRef<HTMLDivElement>(null);
    
    const TemplateComponent = TEMPLATES[template] || ClassicTemplate;

    return (
        <div
            id="resume-preview"
            ref={containerRef}
            className="bg-white shadow-2xl print:shadow-none print:fixed print:inset-0 print:z-[99999] origin-top text-left"
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
    );
};
