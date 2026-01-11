import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';

interface TemplateProps {
    data: ResumeData;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {} } = settings;
    const { t } = useLanguage();

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="mb-6 border-b-2 pb-4 flex justify-between items-start" style={{ borderColor: themeColor }}>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold uppercase tracking-wide mb-2" style={{ color: themeColor }}>{basics.name}</h1>
                    <p className="text-xl font-medium mb-2">{basics.title}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        {basics.email && <span>{basics.email}</span>}
                        {basics.phone && <span>{basics.phone}</span>}
                        {basics.city && <span>{basics.city}</span>}
                        {basics.website && <span>{basics.website}</span>}
                        {basics.linkedin && <span>{basics.linkedin}</span>}
                        {basics.github && <span>{basics.github}</span>}
                    </div>
                </div>
                {basics.avatarBase64 && (
                    <img
                        src={basics.avatarBase64}
                        alt={basics.name}
                        className="w-24 h-32 object-cover rounded shadow-md ml-4"
                    />
                )}
            </div>
        ),
        summary: summary && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-2 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewSummary}</h2>
                <p className="text-sm leading-relaxed">{summary}</p>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewExperience}</h2>
                <div className="space-y-4">
                    {experience.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-gray-800">{exp.company}</h3>
                                <span className="text-sm text-gray-600 font-medium">
                                    {exp.start} – {exp.current ? t.present : exp.end}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold italic text-gray-700">{exp.role}</span>
                                <span className="text-xs text-gray-500">{exp.city}</span>
                            </div>
                            <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-700">
                                {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                    <li key={i} className="leading-snug">{h}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ),
        education: education.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewEducation}</h2>
                <div className="space-y-3">
                    {education.map(edu => (
                        <div key={edu.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-gray-800">{edu.school}</h3>
                                <span className="text-sm text-gray-600 font-medium">
                                    {edu.start} – {edu.end}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-gray-700">{edu.degree}, {edu.major}</span>
                            </div>
                            {edu.highlights.length > 0 && (
                                <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-700 mt-1">
                                    {edu.highlights.filter(h => h.trim()).map((h, i) => (
                                        <li key={i}>{h}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewProjects}</h2>
                <div className="space-y-3">
                    {projects.map(proj => (
                        <div key={proj.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-800">{proj.name}</h3>
                                    {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">{proj.link}</a>}
                                </div>
                            </div>
                            {proj.techStack.length > 0 && (
                                <div className="text-xs text-gray-600 mb-1 font-medium">
                                    <span className="italic">{t.techStack}:</span> {proj.techStack.join(', ')}
                                </div>
                            )}
                            <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-700">
                                {proj.highlights.filter(h => h.trim()).map((h, i) => (
                                    <li key={i} className="leading-snug">{h}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewSkills}</h2>
                <div className="grid grid-cols-1 gap-2">
                    {skills.map(skill => (
                        <div key={skill.id} className="flex text-sm">
                            <span className="font-bold w-32 shrink-0 text-gray-800">{skill.name}:</span>
                            <span className="text-gray-700 flex-1">{skill.items.join(', ')}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        custom: null,
    };

    // Ensure basics is top if not in order (though editor handles order, logic here should respect it)
    // But usually basics is Header. If 'basics' is in sectionOrder, render it there? 
    // Standard resume has header at top always. 
    // Let's filter out 'basics' from draggable order loop and always put it top, 
    // OR allow it to be placed anywhere?
    // User Prompt: "Modules draggable (At least: Work... Skills)". Doesn't explicitly say Basics is draggable.
    // Standard behavior: Header is fixed. 
    // Let's keep Header fixed at top for classic template.

    return (
        <div className="font-sans text-gray-800 p-1">
            {sectionRenderers.basics}
            {sectionOrder.filter(id => id !== 'basics').map(sectionId => {
                if (sectionVisibility[sectionId] === false) return null;
                return (
                    <div key={sectionId}>
                        {sectionRenderers[sectionId]}
                    </div>
                );
            })}
        </div>
    );
};
