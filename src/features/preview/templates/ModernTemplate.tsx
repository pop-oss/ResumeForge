import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';

interface TemplateProps {
    data: ResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {} } = settings;
    const { t } = useLanguage();

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="bg-slate-900 text-white p-8 -mx-12 -mt-12 mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">{basics.name}</h1>
                    <p className="text-lg text-slate-300 mb-4 font-medium">{basics.title}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        {basics.email && <a href={`mailto:${basics.email}`} className="hover:text-white">{basics.email}</a>}
                        {basics.phone && <a href={`tel:${basics.phone}`} className="hover:text-white">{basics.phone}</a>}
                        {basics.city && <span>{basics.city}</span>}
                        {basics.linkedin && <ExternalLink href={basics.linkedin} className="hover:text-white" />}
                    </div>
                </div>
                {basics.avatarBase64 && (
                    <img
                        src={basics.avatarBase64}
                        alt={basics.name}
                        className="w-28 h-28 rounded-full object-cover ring-4 ring-white/20 ml-6"
                    />
                )}
            </div>
        ),
        summary: summary && (
            <div className="mb-8">
                <h2 className="text-md font-bold uppercase tracking-wider mb-3 text-slate-400">{t.previewSummary}</h2>
                <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-8">
                <h2 className="text-md font-bold uppercase tracking-wider mb-4 text-slate-400">{t.previewExperience}</h2>
                <div className="space-y-6">
                    {experience.map(exp => (
                        <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: themeColor }}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-slate-800 text-lg">{exp.company}</h3>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {exp.start} — {exp.current ? t.present : exp.end}
                                </span>
                            </div>
                            <div className="text-sm font-medium text-slate-600 mb-2">{exp.role}</div>
                            <ul className="text-sm space-y-1.5 text-slate-600">
                                {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                    <li key={i} className="pl-0">{h}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ),
        education: education.length > 0 && (
            <div className="mb-8">
                <h2 className="text-md font-bold uppercase tracking-wider mb-4 text-slate-400">{t.previewEducation}</h2>
                <div className="grid grid-cols-1 gap-4">
                    {education.map(edu => (
                        <div key={edu.id}>
                            <div className="flex justify-between">
                                <h3 className="font-bold text-slate-800">{edu.school}</h3>
                                <span className="text-sm text-slate-500">{edu.start} — {edu.end}</span>
                            </div>
                            <div className="text-sm text-slate-600">{edu.degree}, {edu.major}</div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-8">
                <h2 className="text-md font-bold uppercase tracking-wider mb-4 text-slate-400">{t.previewSkills}</h2>
                <div className="flex flex-wrap gap-2">
                    {skills.flatMap(group => group.items).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-8">
                <h2 className="text-md font-bold uppercase tracking-wider mb-4 text-slate-400">{t.previewProjects}</h2>
                <div className="space-y-4">
                    {projects.map(proj => (
                        <div key={proj.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-slate-800">{proj.name}</h3>
                                {proj.link && <ExternalLink href={proj.link} className="text-xs text-blue-500 hover:underline" />}
                            </div>
                            <p className="text-sm text-slate-600">{proj.highlights[0]}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
        custom: custom.length > 0 && (
            <>
                {custom.map(section => (
                    <div key={section.id} className="mb-8">
                        <h2 className="text-md font-bold uppercase tracking-wider mb-4 text-slate-400">{section.title}</h2>
                        <div className="space-y-4">
                            {section.items.map(item => (
                                <div key={item.id} className="relative pl-4 border-l-2" style={{ borderColor: themeColor }}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800">{item.title}</h3>
                                            {item.link && <ExternalLink href={item.link} className="text-xs text-blue-500 hover:underline" />}
                                        </div>
                                        {item.date && (
                                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {item.date}
                                            </span>
                                        )}
                                    </div>
                                    {item.subtitle && <div className="text-sm font-medium text-slate-600 mb-2">{item.subtitle}</div>}
                                    {item.items.length > 0 && (
                                        <ul className="text-sm space-y-1.5 text-slate-600">
                                            {item.items.filter(i => i.trim()).map((i, idx) => (
                                                <li key={idx}>{i}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </>
        ),
    };

    return (
        <div className="font-sans text-slate-800 p-1">
            {sectionRenderers.basics}
            <div className="px-8">
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
