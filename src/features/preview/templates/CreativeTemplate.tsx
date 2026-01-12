import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';
import { useResume } from '../../resume/ResumeContext';
import { FreeDraggable } from '../../../components/ui/free-draggable';

interface TemplateProps {
    data: ResumeData;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { themeColor, editMode, elementPositions = {}, fieldLabels = {} } = settings;
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

    // 更新技能数据
    const updateSkillGroup = (skillId: string, field: string, value: string) => {
        const newSkills = skills.map(skill => {
            if (skill.id === skillId) {
                if (field === 'items') {
                    return { ...skill, items: value.split(',').map(s => s.trim()).filter(s => s) };
                }
                return { ...skill, [field]: value };
            }
            return skill;
        });
        setResumeData({ ...data, skills: newSkills });
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
                        <FreeDraggable
                            id="basics:name"
                            position={getPosition('basics:name')}
                            onPositionChange={handlePositionChange}
                            editMode={editMode}
                            editable={true}
                            value={basics.name}
                            onValueChange={(value) => updateBasics({ name: value })}
                            editorClassName="text-6xl font-black tracking-tighter"
                        >
                            <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none mb-2" style={{ color: themeColor }}>
                                {basics.name.split(' ')[0]}
                                <span className="block text-slate-800">{basics.name.split(' ').slice(1).join(' ')}</span>
                            </h1>
                        </FreeDraggable>
                        <FreeDraggable
                            id="basics:title"
                            position={getPosition('basics:title')}
                            onPositionChange={handlePositionChange}
                            editMode={editMode}
                            editable={true}
                            value={basics.title}
                            onValueChange={(value) => updateBasics({ title: value })}
                            editorClassName="text-2xl font-bold text-slate-400 uppercase tracking-widest"
                        >
                            <p className="text-2xl font-bold text-slate-400 uppercase tracking-widest">{basics.title}</p>
                        </FreeDraggable>
                    </div>

                    <div className="text-right space-y-1 text-sm font-bold text-slate-500">
                        {basics.email && (
                            <FreeDraggable
                                id="basics:email"
                                position={getPosition('basics:email')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.email}
                                onValueChange={(value) => updateBasics({ email: value })}
                                editorClassName="text-sm font-bold"
                            >
                                <div><a href={`mailto:${basics.email}`} className="hover:underline">{basics.email}</a></div>
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
                                editorClassName="text-sm font-bold"
                            >
                                <div><a href={`tel:${basics.phone}`} className="hover:underline">{basics.phone}</a></div>
                            </FreeDraggable>
                        )}
                        {basics.website && (
                            <FreeDraggable
                                id="basics:website"
                                position={getPosition('basics:website')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.website}
                                onValueChange={(value) => updateBasics({ website: value })}
                                editorClassName="text-sm"
                            >
                                <div><ExternalLink href={basics.website} className="text-blue-600 hover:underline" /></div>
                            </FreeDraggable>
                        )}
                        {basics.linkedin && (
                            <FreeDraggable
                                id="basics:linkedin"
                                position={getPosition('basics:linkedin')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.linkedin}
                                onValueChange={(value) => updateBasics({ linkedin: value })}
                                editorClassName="text-sm"
                            >
                                <div><ExternalLink href={basics.linkedin} className="text-blue-600 hover:underline" /></div>
                            </FreeDraggable>
                        )}
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
                                            <FreeDraggable
                                                id={`skills:${group.id}:name`}
                                                position={getPosition(`skills:${group.id}:name`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={group.name}
                                                onValueChange={(value) => updateSkillGroup(group.id, 'name', value)}
                                                editorClassName="font-bold text-slate-800"
                                            >
                                                <div className="font-bold text-slate-800 mb-1">{group.name}</div>
                                            </FreeDraggable>
                                            <div className="flex flex-wrap gap-2">
                                                {group.items.map((skill, i) => (
                                                    <FreeDraggable
                                                        key={i}
                                                        id={`skills:${group.id}:item:${i}`}
                                                        position={getPosition(`skills:${group.id}:item:${i}`)}
                                                        onPositionChange={handlePositionChange}
                                                        editMode={editMode}
                                                        editable={true}
                                                        value={skill}
                                                        onValueChange={(value) => {
                                                            const newItems = [...group.items];
                                                            newItems[i] = value;
                                                            updateSkillGroup(group.id, 'items', newItems.join(','));
                                                        }}
                                                        editorClassName="text-xs font-bold"
                                                    >
                                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                                                            {skill}
                                                        </span>
                                                    </FreeDraggable>
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
                                            <FreeDraggable
                                                id={`education:${edu.id}:school`}
                                                position={getPosition(`education:${edu.id}:school`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={edu.school}
                                                onValueChange={(value) => updateEducation(edu.id, 'school', value)}
                                                editorClassName="font-bold text-slate-900"
                                            >
                                                <div className="font-bold text-slate-900">{edu.school}</div>
                                            </FreeDraggable>
                                            <FreeDraggable
                                                id={`education:${edu.id}:degree`}
                                                position={getPosition(`education:${edu.id}:degree`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={edu.degree}
                                                onValueChange={(value) => updateEducation(edu.id, 'degree', value)}
                                                editorClassName="text-sm text-slate-600"
                                            >
                                                <div className="text-sm text-slate-600">{edu.degree}</div>
                                            </FreeDraggable>
                                            <FreeDraggable
                                                id={`education:${edu.id}:date`}
                                                position={getPosition(`education:${edu.id}:date`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={`${edu.start} — ${edu.end}`}
                                                onValueChange={(value) => {
                                                    const parts = value.split('—').map(s => s.trim());
                                                    if (parts.length >= 2) {
                                                        updateEducation(edu.id, 'start', parts[0]);
                                                        updateEducation(edu.id, 'end', parts[1]);
                                                    }
                                                }}
                                                editorClassName="text-xs text-slate-400"
                                            >
                                                <div className="text-xs text-slate-400 mt-1">{edu.start} — {edu.end}</div>
                                            </FreeDraggable>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {summary && (
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-slate-400">{getSectionTitle('summary', t.previewSummary)}</h3>
                                <FreeDraggable
                                    id="summary:content"
                                    position={getPosition('summary:content')}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={summary}
                                    onValueChange={(value) => setResumeData({ ...data, summary: value })}
                                    multiline={true}
                                    editorClassName="text-sm leading-relaxed text-slate-700 font-medium"
                                >
                                    <p className="text-sm leading-relaxed text-slate-700 font-medium">
                                        {summary}
                                    </p>
                                </FreeDraggable>
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
                                                <FreeDraggable
                                                    id={`experience:${exp.id}:role`}
                                                    position={getPosition(`experience:${exp.id}:role`)}
                                                    onPositionChange={handlePositionChange}
                                                    editMode={editMode}
                                                    editable={true}
                                                    value={exp.role}
                                                    onValueChange={(value) => updateExperience(exp.id, 'role', value)}
                                                    editorClassName="text-xl font-bold text-slate-800"
                                                >
                                                    <h4 className="text-xl font-bold text-slate-800">{exp.role}</h4>
                                                </FreeDraggable>
                                                <FreeDraggable
                                                    id={`experience:${exp.id}:date`}
                                                    position={getPosition(`experience:${exp.id}:date`)}
                                                    onPositionChange={handlePositionChange}
                                                    editMode={editMode}
                                                    editable={true}
                                                    value={`${exp.start} — ${exp.current ? t.present : exp.end}`}
                                                    onValueChange={(value) => {
                                                        const parts = value.split('—').map(s => s.trim());
                                                        if (parts.length >= 2) {
                                                            updateExperience(exp.id, 'start', parts[0]);
                                                            if (parts[1] === t.present) {
                                                                setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: true, end: '' } : e) });
                                                            } else {
                                                                setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: false, end: parts[1] } : e) });
                                                            }
                                                        }
                                                    }}
                                                    editorClassName="text-sm font-bold text-slate-500"
                                                >
                                                    <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                                                        {exp.start} — {exp.current ? t.present : exp.end}
                                                    </span>
                                                </FreeDraggable>
                                            </div>
                                            <FreeDraggable
                                                id={`experience:${exp.id}:company`}
                                                position={getPosition(`experience:${exp.id}:company`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={exp.company}
                                                onValueChange={(value) => updateExperience(exp.id, 'company', value)}
                                                editorClassName="text-lg font-medium"
                                            >
                                                <div className="text-lg font-medium text-slate-500 mb-3" style={{ color: themeColor }}>@{exp.company}</div>
                                            </FreeDraggable>
                                            <ul className="space-y-2">
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
                                                        editorClassName="text-slate-600 font-medium"
                                                    >
                                                        <li className="text-slate-600 font-medium leading-relaxed pl-5 relative before:content-['→'] before:absolute before:left-0 before:font-bold" style={{ '--tw-marker-color': themeColor } as any}>
                                                            {h}
                                                        </li>
                                                    </FreeDraggable>
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
                                            <FreeDraggable
                                                id={`projects:${proj.id}:name`}
                                                position={getPosition(`projects:${proj.id}:name`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={proj.name}
                                                onValueChange={(value) => updateProject(proj.id, 'name', value)}
                                                editorClassName="font-bold text-slate-800"
                                            >
                                                <h4 className="font-bold text-slate-800 mb-1">{proj.name}</h4>
                                            </FreeDraggable>
                                            <FreeDraggable
                                                id={`projects:${proj.id}:techStack`}
                                                position={getPosition(`projects:${proj.id}:techStack`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={proj.techStack.join(' • ')}
                                                onValueChange={(value) => updateProjectTechStack(proj.id, value)}
                                                editorClassName="text-xs font-bold text-slate-400 uppercase"
                                            >
                                                <div className="text-xs font-bold text-slate-400 mb-3 uppercase">{proj.techStack.join(' • ')}</div>
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
                                                editorClassName="text-sm text-slate-600"
                                            >
                                                <p className="text-sm text-slate-600 leading-snug">
                                                    {proj.highlights[0]}
                                                </p>
                                            </FreeDraggable>
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
                                                    <FreeDraggable
                                                        id={`custom:${section.id}:${item.id}:title`}
                                                        position={getPosition(`custom:${section.id}:${item.id}:title`)}
                                                        onPositionChange={handlePositionChange}
                                                        editMode={editMode}
                                                        editable={true}
                                                        value={item.title}
                                                        onValueChange={(value) => updateCustomItem(section.id, item.id, 'title', value)}
                                                        editorClassName="text-xl font-bold text-slate-800"
                                                    >
                                                        <h4 className="text-xl font-bold text-slate-800">{item.title}</h4>
                                                    </FreeDraggable>
                                                    {item.link && <ExternalLink href={item.link} className="text-sm text-blue-600 hover:underline" />}
                                                </div>
                                                {item.date && (
                                                    <FreeDraggable
                                                        id={`custom:${section.id}:${item.id}:date`}
                                                        position={getPosition(`custom:${section.id}:${item.id}:date`)}
                                                        onPositionChange={handlePositionChange}
                                                        editMode={editMode}
                                                        editable={true}
                                                        value={item.date}
                                                        onValueChange={(value) => updateCustomItem(section.id, item.id, 'date', value)}
                                                        editorClassName="text-sm font-bold text-slate-500"
                                                    >
                                                        <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                                                            {item.date}
                                                        </span>
                                                    </FreeDraggable>
                                                )}
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
                                                    editorClassName="text-lg font-medium"
                                                >
                                                    <div className="text-lg font-medium text-slate-500 mb-3" style={{ color: themeColor }}>
                                                        {item.subtitle}
                                                    </div>
                                                </FreeDraggable>
                                            )}
                                            {item.items.length > 0 && (
                                                <ul className="space-y-2">
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
                                                            editorClassName="text-slate-600 font-medium"
                                                        >
                                                            <li className="text-slate-600 font-medium leading-relaxed pl-5 relative before:content-['→'] before:absolute before:left-0 before:font-bold">
                                                                {i}
                                                            </li>
                                                        </FreeDraggable>
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
