import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';

interface TemplateProps {
    data: ResumeData;
}

export const ElegantTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {} } = settings;
    const { t } = useLanguage();

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="text-center mb-10 border-b pb-8">
                {basics.avatarBase64 && (
                    <img
                        src={basics.avatarBase64}
                        alt={basics.name}
                        className="w-28 h-28 rounded-full object-cover mx-auto mb-4 shadow-lg"
                    />
                )}
                <h1 className="text-5xl font-serif text-slate-800 mb-2">{basics.name}</h1>
                <p className="text-xl text-slate-600 font-light mb-4 italic">{basics.title}</p>
                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 font-serif">
                    {basics.email && <span>{basics.email}</span>}
                    {basics.phone && <span>{basics.phone}</span>}
                    {basics.city && <span>{basics.city}</span>}
                    {basics.website && <span>{basics.website.replace(/^https?:\/\//, '')}</span>}
                    {basics.linkedin && <span>{basics.linkedin.replace(/^https?:\/\//, '')}</span>}
                </div>
            </div>
        ),
        summary: summary && (
            <div className="mb-8 text-center px-10">
                <div className="w-16 h-1 bg-slate-200 mx-auto mb-6" style={{ backgroundColor: themeColor }}></div>
                <p className="text-slate-700 leading-loose font-serif text-lg italic">{summary}</p>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-10">
                <h2 className="text-2xl font-serif text-center mb-8 pb-2 border-b-2 inline-block mx-auto w-full max-w-xs" style={{ borderColor: themeColor }}>
                    {t.previewExperience}
                </h2>
                <div className="space-y-10">
                    {experience.map(exp => (
                        <div key={exp.id} className="relative pl-6 border-l-2 border-slate-200 ml-4 py-1">
                            <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-slate-300`} style={{ borderColor: themeColor }}></div>
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="text-xl font-bold font-serif text-slate-800">{exp.company}</h3>
                                <span className="text-sm font-serif italic text-slate-500">
                                    {exp.start} — {exp.current ? t.present : exp.end}
                                </span>
                            </div>
                            <div className="text-md font-medium text-slate-700 mb-3">{exp.role}</div>
                            <ul className="space-y-2 text-slate-600 font-serif leading-relaxed">
                                {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ),
        education: education.length > 0 && (
            <div className="mb-10 text-center">
                <h2 className="text-2xl font-serif text-center mb-8 pb-2 border-b-2 inline-block mx-auto w-full max-w-xs" style={{ borderColor: themeColor }}>
                    {t.previewEducation}
                </h2>
                <div className="grid grid-cols-1 gap-6">
                    {education.map(edu => (
                        <div key={edu.id}>
                            <h3 className="text-xl font-bold font-serif text-slate-800">{edu.school}</h3>
                            <div className="text-lg text-slate-600 italic mb-1">{edu.degree} in {edu.major}</div>
                            <div className="text-sm text-slate-400 font-serif">{edu.start} — {edu.end}</div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-10">
                <h2 className="text-2xl font-serif text-center mb-8 pb-2 border-b-2 inline-block mx-auto w-full max-w-xs" style={{ borderColor: themeColor }}>
                    {t.previewProjects}
                </h2>
                <div className="space-y-6">
                    {projects.map(proj => (
                        <div key={proj.id} className="text-center">
                            <h3 className="text-lg font-bold font-serif text-slate-800">{proj.name}</h3>
                            <div className="text-sm text-slate-500 font-serif mb-2 italic">
                                {proj.techStack.join(' • ')}
                            </div>
                            <p className="text-slate-600 font-serif leading-relaxed">{proj.highlights[0]}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-10 text-center">
                <h2 className="text-2xl font-serif text-center mb-8 pb-2 border-b-2 inline-block mx-auto w-full max-w-xs" style={{ borderColor: themeColor }}>
                    {t.previewSkills}
                </h2>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                    {skills.map(group => (
                        <div key={group.id}>
                            <h3 className="font-bold text-slate-700 mb-1 font-serif underline decoration-1 underline-offset-4 decoration-slate-300">{group.name}</h3>
                            <div className="text-slate-600 font-serif italic">
                                {group.items.join(', ')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    };

    return (
        <div className="font-serif text-slate-800 p-8 max-w-[210mm] mx-auto min-h-full bg-stone-50">
            {sectionRenderers.basics}
            <div className="px-4">
                {sectionOrder.filter(id => id !== 'basics').map(sectionId => {
                    if (sectionVisibility[sectionId] === false) return null;
                    return (
                        <div key={sectionId}>
                            {sectionRenderers[sectionId]}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
