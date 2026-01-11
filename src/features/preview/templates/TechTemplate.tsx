import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';

interface TemplateProps {
    data: ResumeData;
}

export const TechTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {} } = settings;
    const { t } = useLanguage();

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white -mx-3 -mt-3">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-slate-400 ml-2 font-mono">~/resume/{basics.name.toLowerCase().replace(/\s+/g, '-')}</span>
                </div>
                <div className="flex justify-between items-start">
                    <div className="font-mono flex-1">
                        <p className="text-slate-400 text-sm">
                            <span className="text-green-400">const</span> <span className="text-blue-400">developer</span> = {'{'}
                        </p>
                        <p className="text-sm pl-4">
                            <span className="text-purple-400">name</span>: <span className="text-yellow-300">"{basics.name}"</span>,
                        </p>
                        <p className="text-sm pl-4">
                            <span className="text-purple-400">title</span>: <span className="text-yellow-300">"{basics.title}"</span>,
                        </p>
                        <p className="text-sm pl-4">
                            <span className="text-purple-400">contact</span>: {'['}<span className="text-yellow-300">"{basics.email}"</span>, <span className="text-yellow-300">"{basics.phone}"</span>{']'},
                        </p>
                        <p className="text-sm pl-4">
                            <span className="text-purple-400">location</span>: <span className="text-yellow-300">"{basics.city}"</span>
                        </p>
                        <p className="text-slate-400 text-sm">{'}'}</p>
                    </div>
                    {basics.avatarBase64 && (
                        <img
                            src={basics.avatarBase64}
                            alt={basics.name}
                            className="w-20 h-20 rounded-lg object-cover ring-2 ring-slate-600 ml-4"
                        />
                    )}
                </div>
            </div>
        ),
        summary: summary && (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border-l-4" style={{ borderColor: themeColor }}>
                <p className="text-sm text-slate-600 font-mono">
                    <span className="text-slate-400">// </span>{summary}
                </p>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold mb-4 font-mono flex items-center gap-2">
                    <span style={{ color: themeColor }}>{'<'}</span>
                    {t.previewExperience}
                    <span style={{ color: themeColor }}>{'/>'}</span>
                </h2>
                <div className="space-y-4">
                    {experience.map(exp => (
                        <div key={exp.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-800">{exp.role}</h3>
                                    <p className="text-sm" style={{ color: themeColor }}>{exp.company}</p>
                                </div>
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                    {exp.start} → {exp.current ? t.present : exp.end}
                                </code>
                            </div>
                            <ul className="text-sm text-slate-600 space-y-1 font-mono">
                                {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span style={{ color: themeColor }}>→</span> {h}
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
                <h2 className="text-lg font-bold mb-4 font-mono flex items-center gap-2">
                    <span style={{ color: themeColor }}>{'<'}</span>
                    {t.previewEducation}
                    <span style={{ color: themeColor }}>{'/>'}</span>
                </h2>
                <div className="space-y-3">
                    {education.map(edu => (
                        <div key={edu.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <div>
                                <h3 className="font-bold text-slate-800">{edu.school}</h3>
                                <p className="text-sm text-slate-600">{edu.degree} • {edu.major}</p>
                            </div>
                            <code className="text-xs text-slate-500">{edu.start}~{edu.end}</code>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold mb-4 font-mono flex items-center gap-2">
                    <span style={{ color: themeColor }}>{'<'}</span>
                    {t.previewProjects}
                    <span style={{ color: themeColor }}>{'/>'}</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {projects.map(proj => (
                        <div key={proj.id} className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                <h3 className="font-bold text-slate-800">{proj.name}</h3>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {proj.techStack.map((tech, i) => (
                                    <code key={i} className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: themeColor }}>{tech}</code>
                                ))}
                            </div>
                            <p className="text-xs text-slate-600">{proj.highlights[0]}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold mb-4 font-mono flex items-center gap-2">
                    <span style={{ color: themeColor }}>{'<'}</span>
                    {t.previewSkills}
                    <span style={{ color: themeColor }}>{'/>'}</span>
                </h2>
                <div className="p-4 bg-slate-900 rounded-lg font-mono text-sm">
                    <p className="text-slate-400 mb-2">
                        <span className="text-green-400">const</span> <span className="text-blue-400">skills</span> = {'{'}
                    </p>
                    {skills.map((skill, idx) => (
                        <p key={skill.id} className="text-slate-300 pl-4">
                            <span className="text-purple-400">{skill.name.toLowerCase().replace(/\s+/g, '_')}</span>: [
                            {skill.items.map((item, i) => (
                                <span key={i}>
                                    <span className="text-yellow-300">"{item}"</span>
                                    {i < skill.items.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                            ]{idx < skills.length - 1 ? ',' : ''}
                        </p>
                    ))}
                    <p className="text-slate-400">{'}'}</p>
                </div>
            </div>
        ),
        custom: null,
    };

    return (
        <div className="font-sans text-slate-800 p-3">
            {sectionRenderers.basics}
            {sectionOrder.filter(id => id !== 'basics').map(sectionId => {
                if (sectionVisibility[sectionId] === false) return null;
                return <div key={sectionId}>{sectionRenderers[sectionId]}</div>;
            })}
        </div>
    );
};
