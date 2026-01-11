import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';

interface TemplateProps {
    data: ResumeData;
}

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {} } = settings;
    const { t } = useLanguage();

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="mb-6">
                <div className="flex justify-between items-start border-b-2 pb-4" style={{ borderColor: themeColor }}>
                    <div className="flex items-start gap-4">
                        {basics.avatarBase64 && (
                            <img
                                src={basics.avatarBase64}
                                alt={basics.name}
                                className="w-20 h-24 object-cover rounded shadow-md"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{basics.name}</h1>
                            <p className="text-lg font-medium" style={{ color: themeColor }}>{basics.title}</p>
                        </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                        {basics.email && <p>{basics.email}</p>}
                        {basics.phone && <p>{basics.phone}</p>}
                        {basics.city && <p>{basics.city}</p>}
                        <div className="flex gap-2 justify-end mt-1 text-xs text-gray-400">
                            {basics.linkedin && <span>{basics.linkedin}</span>}
                            {basics.github && <span>{basics.github}</span>}
                        </div>
                    </div>
                </div>
            </div>
        ),
        summary: summary && (
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>{t.previewSummary}</h2>
                <p className="text-sm leading-relaxed text-gray-700 border-l-2 pl-4" style={{ borderColor: themeColor }}>{summary}</p>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: themeColor }}>{t.previewExperience}</h2>
                <div className="space-y-5">
                    {experience.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-gray-900">{exp.role}</h3>
                                <span className="text-sm text-gray-500">{exp.start} – {exp.current ? t.present : exp.end}</span>
                            </div>
                            <p className="text-sm font-medium mb-2" style={{ color: themeColor }}>{exp.company} | {exp.city}</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ),
        education: education.length > 0 && (
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: themeColor }}>{t.previewEducation}</h2>
                <div className="space-y-3">
                    {education.map(edu => (
                        <div key={edu.id} className="flex justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900">{edu.school}</h3>
                                <p className="text-sm text-gray-600">{edu.degree} in {edu.major}</p>
                            </div>
                            <span className="text-sm text-gray-500">{edu.start} – {edu.end}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: themeColor }}>{t.previewProjects}</h2>
                <div className="space-y-4">
                    {projects.map(proj => (
                        <div key={proj.id}>
                            <div className="flex items-baseline gap-2">
                                <h3 className="font-bold text-gray-900">{proj.name}</h3>
                                {proj.link && <a href={proj.link} className="text-xs" style={{ color: themeColor }}>{proj.link}</a>}
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{proj.techStack.join(' | ')}</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {proj.highlights.filter(h => h.trim()).map((h, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: themeColor }}>{t.previewSkills}</h2>
                <div className="space-y-2">
                    {skills.map(skill => (
                        <div key={skill.id} className="flex text-sm">
                            <span className="font-bold text-gray-800 w-28 shrink-0">{skill.name}:</span>
                            <span className="text-gray-600">{skill.items.join(' • ')}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        custom: null,
    };

    return (
        <div className="font-sans text-gray-800 p-2">
            {sectionRenderers.basics}
            {sectionOrder.filter(id => id !== 'basics').map(sectionId => {
                if (sectionVisibility[sectionId] === false) return null;
                return <div key={sectionId}>{sectionRenderers[sectionId]}</div>;
            })}
        </div>
    );
};
