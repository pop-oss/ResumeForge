import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';

interface TemplateProps {
    data: ResumeData;
}

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {} } = settings;
    const { t } = useLanguage();

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="mb-8 text-center">
                {basics.avatarBase64 && (
                    <img
                        src={basics.avatarBase64}
                        alt={basics.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-lg"
                    />
                )}
                <div className="inline-block px-12 py-6 border-t-4 border-b-4" style={{ borderColor: themeColor }}>
                    <h1 className="text-4xl font-bold tracking-wide text-gray-900 mb-2">{basics.name}</h1>
                    <p className="text-lg uppercase tracking-[0.2em] text-gray-500 font-light">{basics.title}</p>
                </div>
                <div className="flex justify-center gap-8 mt-6 text-sm text-gray-600">
                    {basics.email && <span>{basics.email}</span>}
                    {basics.phone && <span>{basics.phone}</span>}
                    {basics.city && <span>{basics.city}</span>}
                </div>
            </div>
        ),
        summary: summary && (
            <div className="mb-8 max-w-3xl mx-auto">
                <div className="relative py-4">
                    <div className="absolute left-0 top-0 text-6xl leading-none opacity-10" style={{ color: themeColor }}>"</div>
                    <p className="text-sm leading-relaxed text-gray-600 text-center px-8 italic">{summary}</p>
                    <div className="absolute right-0 bottom-0 text-6xl leading-none opacity-10 rotate-180" style={{ color: themeColor }}>"</div>
                </div>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>{t.previewExperience}</h2>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="space-y-6">
                    {experience.map(exp => (
                        <div key={exp.id} className="grid grid-cols-[140px_1fr] gap-6">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500">{exp.start}</p>
                                <p className="text-sm text-gray-400">{exp.current ? t.present : exp.end}</p>
                            </div>
                            <div className="border-l-2 pl-6 pb-4" style={{ borderColor: themeColor }}>
                                <h3 className="font-bold text-gray-900 text-lg">{exp.role}</h3>
                                <p className="text-sm font-medium mb-3" style={{ color: themeColor }}>{exp.company}</p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                        <li key={i}>{h}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        education: education.length > 0 && (
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>{t.previewEducation}</h2>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    {education.map(edu => (
                        <div key={edu.id} className="text-center p-4 border border-gray-100 rounded">
                            <h3 className="font-bold text-gray-900">{edu.school}</h3>
                            <p className="text-sm" style={{ color: themeColor }}>{edu.degree}</p>
                            <p className="text-sm text-gray-500">{edu.major}</p>
                            <p className="text-xs text-gray-400 mt-2">{edu.start} - {edu.end}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>{t.previewProjects}</h2>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                    {projects.map(proj => (
                        <div key={proj.id} className="flex gap-4 items-start">
                            <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: themeColor }}></div>
                            <div>
                                <h3 className="font-bold text-gray-900">{proj.name}</h3>
                                <p className="text-xs text-gray-400 mb-1">{proj.techStack.join(' • ')}</p>
                                <p className="text-sm text-gray-600">{proj.highlights[0]}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>{t.previewSkills}</h2>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {skills.flatMap(group => group.items).map((skill, i) => (
                        <span key={i} className="px-4 py-1.5 text-sm border rounded-sm" style={{ borderColor: themeColor, color: themeColor }}>
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        ),
        custom: null,
    };

    return (
        <div className="font-serif text-gray-800 p-2">
            {sectionRenderers.basics}
            {sectionOrder.filter(id => id !== 'basics').map(sectionId => {
                if (sectionVisibility[sectionId] === false) return null;
                return <div key={sectionId}>{sectionRenderers[sectionId]}</div>;
            })}
        </div>
    );
};
