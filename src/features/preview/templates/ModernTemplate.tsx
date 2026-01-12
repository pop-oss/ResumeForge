import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';
import { EditableSection } from '../components/EditableSection';
import { EditableField } from '../components/EditableField';
import { useResume } from '../../resume/ResumeContext';

interface TemplateProps {
    data: ResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {}, editMode, fieldLabels = {} } = settings;
    const { t } = useLanguage();
    const { updateBasics, setResumeData } = useResume();

    // 获取 section 标题，优先使用自定义标题
    const getSectionTitle = (sectionKey: string, defaultTitle: string) => {
        const labelKey = `section${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`;
        return (fieldLabels as Record<string, string>)[labelKey] || defaultTitle;
    };

    const updateExperience = (expId: string, field: string, value: string) => {
        const newExperience = experience.map(exp => 
            exp.id === expId ? { ...exp, [field]: value } : exp
        );
        setResumeData({ ...data, experience: newExperience });
    };

    const updateEducation = (eduId: string, field: string, value: string) => {
        const newEducation = education.map(edu => 
            edu.id === eduId ? { ...edu, [field]: value } : edu
        );
        setResumeData({ ...data, education: newEducation });
    };

    const updateSummary = (value: string) => {
        setResumeData({ ...data, summary: value });
    };

    const renderBasics = () => (
        <EditableSection sectionId="basics">
            {({ fieldOrder, fieldVisibility }) => (
                <div className="bg-slate-900 text-white p-8 -mx-12 -mt-12 mb-8 flex justify-between items-center">
                    <div>
                        {fieldOrder.map(fieldId => {
                            const isVisible = fieldVisibility[fieldId] !== false;
                            switch (fieldId) {
                                case 'name':
                                    return (
                                        <EditableField
                                            key={fieldId}
                                            fieldId={fieldId}
                                            sectionId="basics"
                                            value={basics.name}
                                            onChange={(v) => updateBasics({ name: v })}
                                            visible={isVisible}
                                            editMode={editMode}
                                            className="text-4xl font-bold tracking-tight mb-2 text-white"
                                            renderContent={(v) => <h1 className="text-4xl font-bold tracking-tight mb-2">{v}</h1>}
                                        />
                                    );
                                case 'title':
                                    return (
                                        <EditableField
                                            key={fieldId}
                                            fieldId={fieldId}
                                            sectionId="basics"
                                            value={basics.title}
                                            onChange={(v) => updateBasics({ title: v })}
                                            visible={isVisible}
                                            editMode={editMode}
                                            className="text-lg text-slate-300 mb-4 font-medium"
                                            renderContent={(v) => <p className="text-lg text-slate-300 mb-4 font-medium">{v}</p>}
                                        />
                                    );
                                case 'email':
                                    return basics.email && (
                                        <EditableField
                                            key={fieldId}
                                            fieldId={fieldId}
                                            sectionId="basics"
                                            value={basics.email}
                                            onChange={(v) => updateBasics({ email: v })}
                                            visible={isVisible}
                                            editMode={editMode}
                                            className="text-sm text-slate-400 hover:text-white"
                                        />
                                    );
                                case 'phone':
                                    return basics.phone && (
                                        <EditableField
                                            key={fieldId}
                                            fieldId={fieldId}
                                            sectionId="basics"
                                            value={basics.phone}
                                            onChange={(v) => updateBasics({ phone: v })}
                                            visible={isVisible}
                                            editMode={editMode}
                                            className="text-sm text-slate-400 hover:text-white"
                                        />
                                    );
                                case 'city':
                                    return basics.city && (
                                        <EditableField
                                            key={fieldId}
                                            fieldId={fieldId}
                                            sectionId="basics"
                                            value={basics.city}
                                            onChange={(v) => updateBasics({ city: v })}
                                            visible={isVisible}
                                            editMode={editMode}
                                            className="text-sm text-slate-400"
                                        />
                                    );
                                case 'linkedin':
                                    return basics.linkedin && (
                                        <EditableField
                                            key={fieldId}
                                            fieldId={fieldId}
                                            sectionId="basics"
                                            value={basics.linkedin || ''}
                                            onChange={(v) => updateBasics({ linkedin: v })}
                                            visible={isVisible}
                                            editMode={editMode}
                                            className="text-sm text-slate-400 hover:text-white"
                                            renderContent={(v) => <ExternalLink href={v} className="hover:text-white" />}
                                        />
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </div>
                    {basics.avatarBase64 && (
                        <img
                            src={basics.avatarBase64}
                            alt={basics.name}
                            className="w-28 h-28 rounded-full object-cover ring-4 ring-white/20 ml-6"
                        />
                    )}
                </div>
            )}
        </EditableSection>
    );

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: renderBasics(),
        summary: summary && (
            <div className="mb-8">
                <h2 className="text-md font-bold uppercase tracking-wider mb-3 text-slate-400">{getSectionTitle('summary', t.previewSummary)}</h2>
                {editMode ? (
                    <EditableField
                        fieldId="summary"
                        sectionId="basics"
                        value={summary}
                        onChange={updateSummary}
                        visible={true}
                        editMode={editMode}
                        multiline={true}
                        className="text-sm leading-relaxed text-slate-700"
                    />
                ) : (
                    <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
                )}
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-8">
                <h2 className="text-md font-bold uppercase tracking-wider mb-4 text-slate-400">{getSectionTitle('experience', t.previewExperience)}</h2>
                <EditableSection sectionId="experience">
                    {({ fieldOrder, fieldVisibility }) => (
                        <div className="space-y-6">
                            {experience.map(exp => (
                                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: themeColor }}>
                                    {fieldOrder.map(fieldId => {
                                        const isVisible = fieldVisibility[fieldId] !== false;
                                        switch (fieldId) {
                                            case 'company':
                                                return (
                                                    <EditableField
                                                        key={fieldId}
                                                        fieldId={`${exp.id}-${fieldId}`}
                                                        sectionId="experience"
                                                        value={exp.company}
                                                        onChange={(v) => updateExperience(exp.id, 'company', v)}
                                                        visible={isVisible}
                                                        editMode={editMode}
                                                        className="font-bold text-slate-800 text-lg"
                                                        renderContent={(v) => <h3 className="font-bold text-slate-800 text-lg">{v}</h3>}
                                                    />
                                                );
                                            case 'role':
                                                return (
                                                    <EditableField
                                                        key={fieldId}
                                                        fieldId={`${exp.id}-${fieldId}`}
                                                        sectionId="experience"
                                                        value={exp.role}
                                                        onChange={(v) => updateExperience(exp.id, 'role', v)}
                                                        visible={isVisible}
                                                        editMode={editMode}
                                                        className="text-sm font-medium text-slate-600 mb-2"
                                                    />
                                                );
                                            case 'dateRange':
                                                return (
                                                    <div key={fieldId} className={!isVisible && !editMode ? 'hidden' : ''}>
                                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                            {exp.start} — {exp.current ? t.present : exp.end}
                                                        </span>
                                                    </div>
                                                );
                                            case 'highlights':
                                                return isVisible && (
                                                    <ul key={fieldId} className="text-sm space-y-1.5 text-slate-600 mt-2">
                                                        {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                                            <li key={i}>{h}</li>
                                                        ))}
                                                    </ul>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </EditableSection>
            </div>
        ),
        education: education.length > 0 && (
            <div className="mb-8">
                <h2 className="text-md font-bold uppercase tracking-wider mb-4 text-slate-400">{getSectionTitle('education', t.previewEducation)}</h2>
                <EditableSection sectionId="education">
                    {({ fieldOrder, fieldVisibility }) => (
                        <div className="grid grid-cols-1 gap-4">
                            {education.map(edu => (
                                <div key={edu.id}>
                                    {fieldOrder.map(fieldId => {
                                        const isVisible = fieldVisibility[fieldId] !== false;
                                        switch (fieldId) {
                                            case 'school':
                                                return (
                                                    <EditableField
                                                        key={fieldId}
                                                        fieldId={`${edu.id}-${fieldId}`}
                                                        sectionId="education"
                                                        value={edu.school}
                                                        onChange={(v) => updateEducation(edu.id, 'school', v)}
                                                        visible={isVisible}
                                                        editMode={editMode}
                                                        className="font-bold text-slate-800"
                                                        renderContent={(v) => <h3 className="font-bold text-slate-800">{v}</h3>}
                                                    />
                                                );
                                            case 'degree':
                                                return (
                                                    <EditableField
                                                        key={fieldId}
                                                        fieldId={`${edu.id}-${fieldId}`}
                                                        sectionId="education"
                                                        value={edu.degree}
                                                        onChange={(v) => updateEducation(edu.id, 'degree', v)}
                                                        visible={isVisible}
                                                        editMode={editMode}
                                                        className="text-sm text-slate-600"
                                                    />
                                                );
                                            case 'major':
                                                return (
                                                    <EditableField
                                                        key={fieldId}
                                                        fieldId={`${edu.id}-${fieldId}`}
                                                        sectionId="education"
                                                        value={edu.major}
                                                        onChange={(v) => updateEducation(edu.id, 'major', v)}
                                                        visible={isVisible}
                                                        editMode={editMode}
                                                        className="text-sm text-slate-600"
                                                    />
                                                );
                                            case 'dateRange':
                                                return (
                                                    <div key={fieldId} className={!isVisible && !editMode ? 'hidden' : ''}>
                                                        <span className="text-sm text-slate-500">{edu.start} — {edu.end}</span>
                                                    </div>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </EditableSection>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-8">
                <h2 className="text-md font-bold uppercase tracking-wider mb-4 text-slate-400">{getSectionTitle('skills', t.previewSkills)}</h2>
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
                <h2 className="text-md font-bold uppercase tracking-wider mb-4 text-slate-400">{getSectionTitle('projects', t.previewProjects)}</h2>
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
        <div className="font-sans text-slate-800 p-12">
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
