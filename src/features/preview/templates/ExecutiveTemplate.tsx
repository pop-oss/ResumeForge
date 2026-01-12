import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';
import { useResume } from '../../resume/ResumeContext';
import { FreeDraggable } from '../../../components/ui/free-draggable';

interface TemplateProps {
    data: ResumeData;
}

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {}, editMode, elementPositions = {}, fieldLabels = {} } = settings;
    const { t } = useLanguage();
    const { updateBasics, setResumeData, updateElementPosition } = useResume();

    // 获取元素位置
    const getPosition = (elementId: string) => elementPositions[elementId] || { x: 0, y: 0 };

    // 处理元素位置变化
    const handlePositionChange = (elementId: string, position: { x: number; y: number }) => {
        updateElementPosition(elementId, position);
    };

    // 更新经验数据
    const updateExperience = (expId: string, field: string, value: string) => {
        const newExperience = experience.map(exp => 
            exp.id === expId ? { ...exp, [field]: value } : exp
        );
        setResumeData({ ...data, experience: newExperience });
    };

    // 更新经验的 highlight
    const updateExperienceHighlight = (expId: string, index: number, value: string) => {
        const newExperience = experience.map(exp => {
            if (exp.id === expId) {
                const newHighlights = [...exp.highlights];
                newHighlights[index] = value;
                return { ...exp, highlights: newHighlights };
            }
            return exp;
        });
        setResumeData({ ...data, experience: newExperience });
    };

    // 更新教育数据
    const updateEducation = (eduId: string, field: string, value: string) => {
        const newEducation = education.map(edu => 
            edu.id === eduId ? { ...edu, [field]: value } : edu
        );
        setResumeData({ ...data, education: newEducation });
    };

    // 更新项目数据
    const updateProject = (projId: string, field: string, value: string) => {
        const newProjects = projects.map(proj => 
            proj.id === projId ? { ...proj, [field]: value } : proj
        );
        setResumeData({ ...data, projects: newProjects });
    };

    // 更新项目的 techStack
    const updateProjectTechStack = (projId: string, value: string) => {
        const newProjects = projects.map(proj => 
            proj.id === projId ? { ...proj, techStack: value.split(/[,•]/).map(s => s.trim()).filter(s => s) } : proj
        );
        setResumeData({ ...data, projects: newProjects });
    };

    // 更新自定义部分数据
    const updateCustomItem = (sectionId: string, itemId: string, field: string, value: string) => {
        const newCustom = custom.map(section => {
            if (section.id === sectionId) {
                const newItems = section.items.map(item => 
                    item.id === itemId ? { ...item, [field]: value } : item
                );
                return { ...section, items: newItems };
            }
            return section;
        });
        setResumeData({ ...data, custom: newCustom });
    };

    // 更新自定义部分的 highlight
    const updateCustomItemHighlight = (sectionId: string, itemId: string, index: number, value: string) => {
        const newCustom = custom.map(section => {
            if (section.id === sectionId) {
                const newItems = section.items.map(item => {
                    if (item.id === itemId) {
                        const newItemItems = [...item.items];
                        newItemItems[index] = value;
                        return { ...item, items: newItemItems };
                    }
                    return item;
                });
                return { ...section, items: newItems };
            }
            return section;
        });
        setResumeData({ ...data, custom: newCustom });
    };

    // 获取 section 标题，优先使用自定义标题
    const getSectionTitle = (sectionKey: string, defaultTitle: string) => {
        const labelKey = `section${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`;
        return (fieldLabels as Record<string, string>)[labelKey] || defaultTitle;
    };

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
                    <FreeDraggable
                        id="basics:name"
                        position={getPosition('basics:name')}
                        onPositionChange={handlePositionChange}
                        editMode={editMode}
                        editable={true}
                        value={basics.name}
                        onValueChange={(value) => updateBasics({ name: value })}
                        editorClassName="text-4xl font-bold tracking-wide text-gray-900"
                    >
                        <h1 className="text-4xl font-bold tracking-wide text-gray-900 mb-2">{basics.name}</h1>
                    </FreeDraggable>
                    <FreeDraggable
                        id="basics:title"
                        position={getPosition('basics:title')}
                        onPositionChange={handlePositionChange}
                        editMode={editMode}
                        editable={true}
                        value={basics.title}
                        onValueChange={(value) => updateBasics({ title: value })}
                        editorClassName="text-lg uppercase tracking-[0.2em] text-gray-500 font-light"
                    >
                        <p className="text-lg uppercase tracking-[0.2em] text-gray-500 font-light">{basics.title}</p>
                    </FreeDraggable>
                </div>
                <div className="flex justify-center gap-8 mt-6 text-sm text-gray-600">
                    {basics.email && (
                        <FreeDraggable
                            id="basics:email"
                            position={getPosition('basics:email')}
                            onPositionChange={handlePositionChange}
                            editMode={editMode}
                            editable={true}
                            value={basics.email}
                            onValueChange={(value) => updateBasics({ email: value })}
                            editorClassName="text-sm"
                        >
                            <a href={`mailto:${basics.email}`} className="hover:underline">{basics.email}</a>
                        </FreeDraggable>
                    )}
                    {basics.phone && (
                        <FreeDraggable
                            id="basics:phone"
                            position={getPosition('basics:phone')}
                            onPositionChange={handlePositionChange}
                            editMode={editMode}
                            editable={true}
                            value={basics.phone}
                            onValueChange={(value) => updateBasics({ phone: value })}
                            editorClassName="text-sm"
                        >
                            <a href={`tel:${basics.phone}`} className="hover:underline">{basics.phone}</a>
                        </FreeDraggable>
                    )}
                    {basics.city && (
                        <FreeDraggable
                            id="basics:city"
                            position={getPosition('basics:city')}
                            onPositionChange={handlePositionChange}
                            editMode={editMode}
                            editable={true}
                            value={basics.city}
                            onValueChange={(value) => updateBasics({ city: value })}
                            editorClassName="text-sm"
                        >
                            <span>{basics.city}</span>
                        </FreeDraggable>
                    )}
                </div>
            </div>
        ),
        summary: summary && (
            <div className="mb-8 max-w-3xl mx-auto">
                <div className="relative py-4">
                    <div className="absolute left-0 top-0 text-6xl leading-none opacity-10" style={{ color: themeColor }}>"</div>
                    <FreeDraggable
                        id="summary:content"
                        position={getPosition('summary:content')}
                        onPositionChange={handlePositionChange}
                        editMode={editMode}
                        editable={true}
                        value={summary}
                        onValueChange={(value) => setResumeData({ ...data, summary: value })}
                        multiline={true}
                        editorClassName="text-sm leading-relaxed text-gray-600 text-center italic"
                    >
                        <p className="text-sm leading-relaxed text-gray-600 text-center px-8 italic">{summary}</p>
                    </FreeDraggable>
                    <div className="absolute right-0 bottom-0 text-6xl leading-none opacity-10 rotate-180" style={{ color: themeColor }}>"</div>
                </div>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>{getSectionTitle('experience', t.previewExperience)}</h2>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="space-y-6">
                    {experience.map(exp => (
                        <div key={exp.id} className="grid grid-cols-[140px_1fr] gap-6">
                            <div className="text-right">
                                <FreeDraggable
                                    id={`experience:${exp.id}:start`}
                                    position={getPosition(`experience:${exp.id}:start`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={exp.start}
                                    onValueChange={(value) => updateExperience(exp.id, 'start', value)}
                                    editorClassName="text-sm font-medium text-gray-500"
                                >
                                    <p className="text-sm font-medium text-gray-500">{exp.start}</p>
                                </FreeDraggable>
                                <FreeDraggable
                                    id={`experience:${exp.id}:end`}
                                    position={getPosition(`experience:${exp.id}:end`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={exp.current ? t.present : exp.end}
                                    onValueChange={(value) => {
                                        if (value === t.present) {
                                            setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: true, end: '' } : e) });
                                        } else {
                                            setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: false, end: value } : e) });
                                        }
                                    }}
                                    editorClassName="text-sm text-gray-400"
                                >
                                    <p className="text-sm text-gray-400">{exp.current ? t.present : exp.end}</p>
                                </FreeDraggable>
                            </div>
                            <div className="border-l-2 pl-6 pb-4" style={{ borderColor: themeColor }}>
                                <FreeDraggable
                                    id={`experience:${exp.id}:role`}
                                    position={getPosition(`experience:${exp.id}:role`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={exp.role}
                                    onValueChange={(value) => updateExperience(exp.id, 'role', value)}
                                    editorClassName="font-bold text-gray-900 text-lg"
                                >
                                    <h3 className="font-bold text-gray-900 text-lg">{exp.role}</h3>
                                </FreeDraggable>
                                <FreeDraggable
                                    id={`experience:${exp.id}:company`}
                                    position={getPosition(`experience:${exp.id}:company`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={exp.company}
                                    onValueChange={(value) => updateExperience(exp.id, 'company', value)}
                                    editorClassName="text-sm font-medium"
                                >
                                    <p className="text-sm font-medium mb-3" style={{ color: themeColor }}>{exp.company}</p>
                                </FreeDraggable>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                        <FreeDraggable
                                            key={i}
                                            id={`experience:${exp.id}:highlight:${i}`}
                                            position={getPosition(`experience:${exp.id}:highlight:${i}`)}
                                            onPositionChange={handlePositionChange}
                                            editMode={editMode}
                                            editable={true}
                                            value={h}
                                            onValueChange={(value) => updateExperienceHighlight(exp.id, i, value)}
                                            editorClassName="text-sm text-gray-600"
                                        >
                                            <li>{h}</li>
                                        </FreeDraggable>
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
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>{getSectionTitle('education', t.previewEducation)}</h2>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    {education.map(edu => (
                        <div key={edu.id} className="text-center p-4 border border-gray-100 rounded">
                            <FreeDraggable
                                id={`education:${edu.id}:school`}
                                position={getPosition(`education:${edu.id}:school`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={edu.school}
                                onValueChange={(value) => updateEducation(edu.id, 'school', value)}
                                editorClassName="font-bold text-gray-900"
                            >
                                <h3 className="font-bold text-gray-900">{edu.school}</h3>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`education:${edu.id}:degree`}
                                position={getPosition(`education:${edu.id}:degree`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={edu.degree}
                                onValueChange={(value) => updateEducation(edu.id, 'degree', value)}
                                editorClassName="text-sm"
                            >
                                <p className="text-sm" style={{ color: themeColor }}>{edu.degree}</p>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`education:${edu.id}:major`}
                                position={getPosition(`education:${edu.id}:major`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={edu.major}
                                onValueChange={(value) => updateEducation(edu.id, 'major', value)}
                                editorClassName="text-sm text-gray-500"
                            >
                                <p className="text-sm text-gray-500">{edu.major}</p>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`education:${edu.id}:date`}
                                position={getPosition(`education:${edu.id}:date`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={`${edu.start} - ${edu.end}`}
                                onValueChange={(value) => {
                                    const parts = value.split('-').map(s => s.trim());
                                    if (parts.length >= 2) {
                                        updateEducation(edu.id, 'start', parts[0]);
                                        updateEducation(edu.id, 'end', parts[1]);
                                    }
                                }}
                                editorClassName="text-xs text-gray-400"
                            >
                                <p className="text-xs text-gray-400 mt-2">{edu.start} - {edu.end}</p>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>{getSectionTitle('projects', t.previewProjects)}</h2>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="space-y-4">
                    {projects.map(proj => (
                        <div key={proj.id} className="flex gap-4 items-start">
                            <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: themeColor }}></div>
                            <div>
                                <FreeDraggable
                                    id={`projects:${proj.id}:name`}
                                    position={getPosition(`projects:${proj.id}:name`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={proj.name}
                                    onValueChange={(value) => updateProject(proj.id, 'name', value)}
                                    editorClassName="font-bold text-gray-900"
                                >
                                    <h3 className="font-bold text-gray-900">{proj.name}</h3>
                                </FreeDraggable>
                                <FreeDraggable
                                    id={`projects:${proj.id}:techStack`}
                                    position={getPosition(`projects:${proj.id}:techStack`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={proj.techStack.join(' • ')}
                                    onValueChange={(value) => updateProjectTechStack(proj.id, value)}
                                    editorClassName="text-xs text-gray-400"
                                >
                                    <p className="text-xs text-gray-400 mb-1">{proj.techStack.join(' • ')}</p>
                                </FreeDraggable>
                                <FreeDraggable
                                    id={`projects:${proj.id}:highlight:0`}
                                    position={getPosition(`projects:${proj.id}:highlight:0`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={proj.highlights[0] || ''}
                                    onValueChange={(value) => {
                                        const newProjects = projects.map(p => {
                                            if (p.id === proj.id) {
                                                const newHighlights = [...p.highlights];
                                                newHighlights[0] = value;
                                                return { ...p, highlights: newHighlights };
                                            }
                                            return p;
                                        });
                                        setResumeData({ ...data, projects: newProjects });
                                    }}
                                    editorClassName="text-sm text-gray-600"
                                >
                                    <p className="text-sm text-gray-600">{proj.highlights[0]}</p>
                                </FreeDraggable>
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
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>{getSectionTitle('skills', t.previewSkills)}</h2>
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
        custom: custom.length > 0 && (
            <>
                {custom.map(section => (
                    <div key={section.id} className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: themeColor }}>{section.title}</h2>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                        <div className="space-y-4">
                            {section.items.map(item => (
                                <div key={item.id} className="flex gap-4 items-start">
                                    <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: themeColor }}></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <FreeDraggable
                                                id={`custom:${section.id}:${item.id}:title`}
                                                position={getPosition(`custom:${section.id}:${item.id}:title`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={item.title}
                                                onValueChange={(value) => updateCustomItem(section.id, item.id, 'title', value)}
                                                editorClassName="font-bold text-gray-900"
                                            >
                                                <h3 className="font-bold text-gray-900">{item.title}</h3>
                                            </FreeDraggable>
                                            {item.link && <ExternalLink href={item.link} className="text-xs text-blue-600 hover:underline" />}
                                        </div>
                                        {item.subtitle && (
                                            <FreeDraggable
                                                id={`custom:${section.id}:${item.id}:subtitle`}
                                                position={getPosition(`custom:${section.id}:${item.id}:subtitle`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={item.subtitle}
                                                onValueChange={(value) => updateCustomItem(section.id, item.id, 'subtitle', value)}
                                                editorClassName="text-sm"
                                            >
                                                <p className="text-sm" style={{ color: themeColor }}>{item.subtitle}</p>
                                            </FreeDraggable>
                                        )}
                                        {item.date && (
                                            <FreeDraggable
                                                id={`custom:${section.id}:${item.id}:date`}
                                                position={getPosition(`custom:${section.id}:${item.id}:date`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={item.date}
                                                onValueChange={(value) => updateCustomItem(section.id, item.id, 'date', value)}
                                                editorClassName="text-xs text-gray-400"
                                            >
                                                <p className="text-xs text-gray-400 mb-1">{item.date}</p>
                                            </FreeDraggable>
                                        )}
                                        {item.items.length > 0 && (
                                            <ul className="text-sm text-gray-600 space-y-1 mt-1">
                                                {item.items.filter(i => i.trim()).map((i, idx) => (
                                                    <FreeDraggable
                                                        key={idx}
                                                        id={`custom:${section.id}:${item.id}:item:${idx}`}
                                                        position={getPosition(`custom:${section.id}:${item.id}:item:${idx}`)}
                                                        onPositionChange={handlePositionChange}
                                                        editMode={editMode}
                                                        editable={true}
                                                        value={i}
                                                        onValueChange={(value) => updateCustomItemHighlight(section.id, item.id, idx, value)}
                                                        editorClassName="text-sm text-gray-600"
                                                    >
                                                        <li>{i}</li>
                                                    </FreeDraggable>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </>
        ),
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
