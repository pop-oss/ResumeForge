import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';

interface TemplateProps {
    data: ResumeData;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { sectionOrder, sectionVisibility = {} } = settings;
    const { t } = useLanguage();

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="text-center mb-8 pb-6 border-b border-gray-200">
                {basics.avatarBase64 && (
                    <img
                        src={basics.avatarBase64}
                        alt={basics.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-sm"
                    />
                )}
                <h1 className="text-4xl font-light tracking-widest uppercase mb-2 text-gray-800">{basics.name}</h1>
                <p className="text-lg text-gray-500 font-light tracking-wide mb-4">{basics.title}</p>
                <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-500">
                    {basics.email && <a href={`mailto:${basics.email}`} className="hover:underline">{basics.email}</a>}
                    {basics.phone && <span>•</span>}
                    {basics.phone && <a href={`tel:${basics.phone}`} className="hover:underline">{basics.phone}</a>}
                    {basics.city && <span>•</span>}
                    {basics.city && <span>{basics.city}</span>}
                </div>
                <div className="flex justify-center gap-4 mt-2 text-sm text-gray-400">
                    {basics.linkedin && <ExternalLink href={basics.linkedin} className="hover:text-gray-600" />}
                    {basics.github && <ExternalLink href={basics.github} className="hover:text-gray-600" />}
                </div>
            </div>
        ),
        summary: summary && (
            <div className="mb-8">
                <p className="text-sm leading-relaxed text-gray-600 text-center max-w-2xl mx-auto italic">{summary}</p>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 text-center">{t.previewExperience}</h2>
                <div className="space-y-6">
                    {experience.map(exp => (
                        <div key={exp.id} className="text-center">
                            <h3 className="font-medium text-gray-800">{exp.role}</h3>
                            <p className="text-sm text-gray-500 mb-2">{exp.company} • {exp.start} - {exp.current ? t.present : exp.end}</p>
                            <ul className="text-sm text-gray-600 space-y-1 max-w-xl mx-auto">
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
            <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 text-center">{t.previewEducation}</h2>
                <div className="space-y-4 text-center">
                    {education.map(edu => (
                        <div key={edu.id}>
                            <h3 className="font-medium text-gray-800">{edu.degree} in {edu.major}</h3>
                            <p className="text-sm text-gray-500">{edu.school} • {edu.start} - {edu.end}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 text-center">{t.previewProjects}</h2>
                <div className="space-y-4 text-center">
                    {projects.map(proj => (
                        <div key={proj.id}>
                            <h3 className="font-medium text-gray-800">{proj.name}</h3>
                            <p className="text-xs text-gray-400 mb-1">{proj.techStack.join(' • ')}</p>
                            <p className="text-sm text-gray-600">{proj.highlights[0]}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 text-center">{t.previewSkills}</h2>
                <div className="flex flex-wrap justify-center gap-3">
                    {skills.flatMap(group => group.items).map((skill, i) => (
                        <span key={i} className="text-sm text-gray-600">{skill}</span>
                    ))}
                </div>
            </div>
        ),
        custom: custom.length > 0 && (
            <>
                {custom.map(section => (
                    <div key={section.id} className="mb-8">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 text-center">{section.title}</h2>
                        <div className="space-y-4 text-center">
                            {section.items.map(item => (
                                <div key={item.id}>
                                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                                    {item.link && <ExternalLink href={item.link} className="text-xs text-blue-500 hover:underline" />}
                                    {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
                                    {item.date && <p className="text-xs text-gray-400">{item.date}</p>}
                                    {item.items.length > 0 && (
                                        <ul className="text-sm text-gray-600 space-y-1 max-w-xl mx-auto mt-1">
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
        <div className="font-sans text-gray-800 p-4">
            {sectionRenderers.basics}
            {sectionOrder.filter(id => id !== 'basics').map(sectionId => {
                if (sectionVisibility[sectionId] === false) return null;
                return <div key={sectionId}>{sectionRenderers[sectionId]}</div>;
            })}
        </div>
    );
};
