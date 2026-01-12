import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';

interface TemplateProps {
    data: ResumeData;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { themeColor, fieldLabels = {} } = settings;
    const { t } = useLanguage();

    // 获取 section 标题，优先使用自定义标题
    const getSectionTitle = (sectionKey: string, defaultTitle: string) => {
        const labelKey = `section${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`;
        return (fieldLabels as Record<string, string>)[labelKey] || defaultTitle;
    };

    // Creative: Split header with huge name, colorful splotches or shapes.
    // Let's do a left-heavy header with a big colored block.

    return (
        <div className="h-full bg-white font-sans overflow-hidden relative">
            {/* Background shape */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-bl-full opacity-10 -z-0" style={{ backgroundColor: themeColor }}></div>

            <div className="relative z-10 p-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-end mb-12 border-b-4 pb-6" style={{ borderColor: themeColor }}>
                    <div>
                        <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none mb-2" style={{ color: themeColor }}>
                            {basics.name.split(' ')[0]}
                            <span className="block text-slate-800">{basics.name.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-2xl font-bold text-slate-400 uppercase tracking-widest">{basics.title}</p>
                    </div>

                    <div className="text-right space-y-1 text-sm font-bold text-slate-500">
                        {basics.email && <div><a href={`mailto:${basics.email}`} className="hover:underline">{basics.email}</a></div>}
                        {basics.phone && <div><a href={`tel:${basics.phone}`} className="hover:underline">{basics.phone}</a></div>}
                        {basics.website && <div><ExternalLink href={basics.website} className="text-blue-600 hover:underline" /></div>}
                        {basics.linkedin && <div><ExternalLink href={basics.linkedin} className="text-blue-600 hover:underline" /></div>}
                    </div>

                    {basics.avatarBase64 && (
                        <div className="absolute top-10 right-10 w-28 h-28 rounded-2xl rotate-3 overflow-hidden shadow-xl">
                            <img src={basics.avatarBase64} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-12 gap-8 flex-1">
                    {/* Left Column (Narrow) */}
                    <div className="col-span-4 space-y-10">
                        {skills.length > 0 && (
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-l-4 pl-2" style={{ borderColor: themeColor }}>{getSectionTitle('skills', t.previewSkills)}</h3>
                                <div className="space-y-4">
                                    {skills.map(group => (
                                        <div key={group.id}>
                                            <div className="font-bold text-slate-800 mb-1">{group.name}</div>
                                            <div className="flex flex-wrap gap-2">
                                                {group.items.map((skill, i) => (
                                                    <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {education.length > 0 && (
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-l-4 pl-2" style={{ borderColor: themeColor }}>{getSectionTitle('education', t.previewEducation)}</h3>
                                <div className="space-y-4">
                                    {education.map(edu => (
                                        <div key={edu.id}>
                                            <div className="font-bold text-slate-900">{edu.school}</div>
                                            <div className="text-sm text-slate-600">{edu.degree}</div>
                                            <div className="text-xs text-slate-400 mt-1">{edu.start} — {edu.end}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {summary && (
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-slate-400">{getSectionTitle('summary', t.previewSummary)}</h3>
                                <p className="text-sm leading-relaxed text-slate-700 font-medium">
                                    {summary}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Wide) */}
                    <div className="col-span-8 space-y-10">
                        {experience.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <span className="w-8 h-1 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                    {getSectionTitle('experience', t.previewExperience)}
                                </h3>
                                <div className="space-y-8">
                                    {experience.map(exp => (
                                        <div key={exp.id} className="relative">
                                            <div className="flex justify-between items-baseline mb-2">
                                                <h4 className="text-xl font-bold text-slate-800">{exp.role}</h4>
                                                <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                                                    {exp.start} — {exp.current ? t.present : exp.end}
                                                </span>
                                            </div>
                                            <div className="text-lg font-medium text-slate-500 mb-3" style={{ color: themeColor }}>@{exp.company}</div>
                                            <ul className="space-y-2">
                                                {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                                    <li key={i} className="text-slate-600 font-medium leading-relaxed pl-5 relative before:content-['→'] before:absolute before:left-0 before:font-bold" style={{ '--tw-marker-color': themeColor } as any}>
                                                        {h}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {projects.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <span className="w-8 h-1 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                    {getSectionTitle('projects', t.previewProjects)}
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    {projects.map(proj => (
                                        <div key={proj.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <h4 className="font-bold text-slate-800 mb-1">{proj.name}</h4>
                                            <div className="text-xs font-bold text-slate-400 mb-3 uppercase">{proj.techStack.join(' • ')}</div>
                                            <p className="text-sm text-slate-600 leading-snug">
                                                {proj.highlights[0]}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {custom.length > 0 && custom.map(section => (
                            <div key={section.id}>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <span className="w-8 h-1 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                    {section.title}
                                </h3>
                                <div className="space-y-6">
                                    {section.items.map(item => (
                                        <div key={item.id} className="relative">
                                            <div className="flex justify-between items-baseline mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xl font-bold text-slate-800">{item.title}</h4>
                                                    {item.link && <ExternalLink href={item.link} className="text-sm text-blue-600 hover:underline" />}
                                                </div>
                                                {item.date && (
                                                    <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                                                        {item.date}
                                                    </span>
                                                )}
                                            </div>
                                            {item.subtitle && (
                                                <div className="text-lg font-medium text-slate-500 mb-3" style={{ color: themeColor }}>
                                                    {item.subtitle}
                                                </div>
                                            )}
                                            {item.items.length > 0 && (
                                                <ul className="space-y-2">
                                                    {item.items.filter(i => i.trim()).map((i, idx) => (
                                                        <li key={idx} className="text-slate-600 font-medium leading-relaxed pl-5 relative before:content-['→'] before:absolute before:left-0 before:font-bold">
                                                            {i}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
