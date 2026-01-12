import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';
import { useResume } from '../../resume/ResumeContext';
import { FreeDraggable } from '../../../components/ui/free-draggable';

interface TemplateProps {
    data: ResumeData;
}

export const ElegantTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {}, editMode, elementPositions = {}, fieldLabels = {} } = settings;
    const { t } = useLanguage();
    const { updateBasics, setResumeData, updateElementPosition } = useResume();

    // 获取 section 标题，优先使用自定义标题
    const getSectionTitle = (sectionKey: string, defaultTitle: string) => {
        const labelKey = `section${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`;
        return (fieldLabels as Record<string, string>)[labelKey] || defaultTitle;
    };

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

    // 更新项目的 highlight
    const updateProjectHighlight = (projId: string, index: number, value: string) => {
        const newProjects = projects.map(proj => {
            if (proj.id === projId) {
                const newHighlights = [...proj.highlights];
                newHighlights[index] = value;
                return { ...proj, highlights: newHighlights };
            }
            return proj;
        });
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
                <FreeDraggable
                    id="basics:name"
                    position={getPosition('basics:name')}
                    onPositionChange={handlePositionChange}
                    editMode={editMode}
                    editable={true}
                    value={basics.name}
                    onValueChange={(value) => updateBasics({ name: value })}
                    editorClassName="text-5xl font-serif text-slate-800"
                >
                    <h1 className="text-5xl font-serif text-slate-800 mb-2">{basics.name}</h1>
                </FreeDraggable>
                <FreeDraggable
                    id="basics:title"
                    position={getPosition('basics:title')}
                    onPositionChange={handlePositionChange}
                    editMode={editMode}
                    editable={true}
                    value={basics.title}
                    onValueChange={(value) => updateBasics({ title: value })}
                    editorClassName="text-xl text-slate-600 font-light italic"
                >
                    <p className="text-xl text-slate-600 font-light mb-4 italic">{basics.title}</p>
                </FreeDraggable>
                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 font-serif">
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
                            <ExternalLink href={basics.website} className="text-blue-600 hover:underline" />
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
                            <ExternalLink href={basics.linkedin} className="text-blue-600 hover:underline" />
                        </FreeDraggable>
                    )}
                </div>
            </div>
        ),

        summary: summary && (
            <div className="mb-8 text-center px-10">
                <div className="w-16 h-1 bg-slate-200 mx-auto mb-6" style={{ backgroundColor: themeColor }}></div>
                <FreeDraggable
                    id="summary:content"
                    position={getPosition('summary:content')}
                    onPositionChange={handlePositionChange}
                    editMode={editMode}
                    editable={true}
                    value={summary}
                    onValueChange={(value) => setResumeData({ ...data, summary: value })}
                    multiline={true}
                    editorClassName="text-slate-700 leading-loose font-serif text-lg italic"
                >
                    <p className="text-slate-700 leading-loose font-serif text-lg italic">{summary}</p>
                </FreeDraggable>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-10">
                <h2 className="text-2xl font-serif text-center mb-8 pb-2 border-b-2 inline-block mx-auto w-full max-w-xs" style={{ borderColor: themeColor }}>
                    {getSectionTitle('experience', t.previewExperience)}
                </h2>
                <div className="space-y-10">
                    {experience.map(exp => (
                        <div key={exp.id} className="relative pl-6 border-l-2 border-slate-200 ml-4 py-1">
                            <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-slate-300`} style={{ borderColor: themeColor }}></div>
                            <div className="flex justify-between items-baseline mb-2">
                                <FreeDraggable
                                    id={`experience:${exp.id}:company`}
                                    position={getPosition(`experience:${exp.id}:company`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={exp.company}
                                    onValueChange={(value) => updateExperience(exp.id, 'company', value)}
                                    editorClassName="text-xl font-bold font-serif text-slate-800"
                                >
                                    <h3 className="text-xl font-bold font-serif text-slate-800">{exp.company}</h3>
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
                                    editorClassName="text-sm font-serif italic text-slate-500"
                                >
                                    <span className="text-sm font-serif italic text-slate-500">
                                        {exp.start} — {exp.current ? t.present : exp.end}
                                    </span>
                                </FreeDraggable>
                            </div>
                            <FreeDraggable
                                id={`experience:${exp.id}:role`}
                                position={getPosition(`experience:${exp.id}:role`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={exp.role}
                                onValueChange={(value) => updateExperience(exp.id, 'role', value)}
                                editorClassName="text-md font-medium text-slate-700"
                            >
                                <div className="text-md font-medium text-slate-700 mb-3">{exp.role}</div>
                            </FreeDraggable>
                            <ul className="space-y-2 text-slate-600 font-serif leading-relaxed">
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
                                        editorClassName="text-slate-600 font-serif"
                                    >
                                        <li>{h}</li>
                                    </FreeDraggable>
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
                    {getSectionTitle('education', t.previewEducation)}
                </h2>
                <div className="grid grid-cols-1 gap-6">
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
                                editorClassName="text-xl font-bold font-serif text-slate-800"
                            >
                                <h3 className="text-xl font-bold font-serif text-slate-800">{edu.school}</h3>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`education:${edu.id}:degree`}
                                position={getPosition(`education:${edu.id}:degree`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={`${edu.degree} in ${edu.major}`}
                                onValueChange={(value) => {
                                    const match = value.match(/^(.+?)\s+in\s+(.+)$/);
                                    if (match) {
                                        updateEducation(edu.id, 'degree', match[1]);
                                        updateEducation(edu.id, 'major', match[2]);
                                    } else {
                                        updateEducation(edu.id, 'degree', value);
                                    }
                                }}
                                editorClassName="text-lg text-slate-600 italic"
                            >
                                <div className="text-lg text-slate-600 italic mb-1">{edu.degree} in {edu.major}</div>
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
                                editorClassName="text-sm text-slate-400 font-serif"
                            >
                                <div className="text-sm text-slate-400 font-serif">{edu.start} — {edu.end}</div>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-10">
                <h2 className="text-2xl font-serif text-center mb-8 pb-2 border-b-2 inline-block mx-auto w-full max-w-xs" style={{ borderColor: themeColor }}>
                    {getSectionTitle('projects', t.previewProjects)}
                </h2>
                <div className="space-y-6">
                    {projects.map(proj => (
                        <div key={proj.id} className="text-center">
                            <FreeDraggable
                                id={`projects:${proj.id}:name`}
                                position={getPosition(`projects:${proj.id}:name`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={proj.name}
                                onValueChange={(value) => updateProject(proj.id, 'name', value)}
                                editorClassName="text-lg font-bold font-serif text-slate-800"
                            >
                                <h3 className="text-lg font-bold font-serif text-slate-800">{proj.name}</h3>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`projects:${proj.id}:techStack`}
                                position={getPosition(`projects:${proj.id}:techStack`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={proj.techStack.join(' • ')}
                                onValueChange={(value) => updateProjectTechStack(proj.id, value)}
                                editorClassName="text-sm text-slate-500 font-serif italic"
                            >
                                <div className="text-sm text-slate-500 font-serif mb-2 italic">
                                    {proj.techStack.join(' • ')}
                                </div>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`projects:${proj.id}:highlight:0`}
                                position={getPosition(`projects:${proj.id}:highlight:0`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={proj.highlights[0] || ''}
                                onValueChange={(value) => updateProjectHighlight(proj.id, 0, value)}
                                editorClassName="text-slate-600 font-serif leading-relaxed"
                            >
                                <p className="text-slate-600 font-serif leading-relaxed">{proj.highlights[0]}</p>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),

        skills: skills.length > 0 && (
            <div className="mb-10 text-center">
                <h2 className="text-2xl font-serif text-center mb-8 pb-2 border-b-2 inline-block mx-auto w-full max-w-xs" style={{ borderColor: themeColor }}>
                    {getSectionTitle('skills', t.previewSkills)}
                </h2>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
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
                                editorClassName="font-bold text-slate-700 font-serif"
                            >
                                <h3 className="font-bold text-slate-700 mb-1 font-serif underline decoration-1 underline-offset-4 decoration-slate-300">{group.name}</h3>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`skills:${group.id}:items`}
                                position={getPosition(`skills:${group.id}:items`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={group.items.join(', ')}
                                onValueChange={(value) => updateSkillGroup(group.id, 'items', value)}
                                editorClassName="text-slate-600 font-serif italic"
                            >
                                <div className="text-slate-600 font-serif italic">
                                    {group.items.join(', ')}
                                </div>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),
        custom: custom.length > 0 && (
            <>
                {custom.map(section => (
                    <div key={section.id} className="mb-10">
                        <h2 className="text-2xl font-serif text-center mb-8 pb-2 border-b-2 inline-block mx-auto w-full max-w-xs" style={{ borderColor: themeColor }}>
                            {section.title}
                        </h2>
                        <div className="space-y-6">
                            {section.items.map(item => (
                                <div key={item.id} className="text-center">
                                    <FreeDraggable
                                        id={`custom:${section.id}:${item.id}:title`}
                                        position={getPosition(`custom:${section.id}:${item.id}:title`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                        editable={true}
                                        value={item.title}
                                        onValueChange={(value) => updateCustomItem(section.id, item.id, 'title', value)}
                                        editorClassName="text-lg font-bold font-serif text-slate-800"
                                    >
                                        <h3 className="text-lg font-bold font-serif text-slate-800">{item.title}</h3>
                                    </FreeDraggable>
                                    {item.link && <ExternalLink href={item.link} className="text-sm text-blue-600 hover:underline" />}
                                    {item.subtitle && (
                                        <FreeDraggable
                                            id={`custom:${section.id}:${item.id}:subtitle`}
                                            position={getPosition(`custom:${section.id}:${item.id}:subtitle`)}
                                            onPositionChange={handlePositionChange}
                                            editMode={editMode}
                                            editable={true}
                                            value={item.subtitle}
                                            onValueChange={(value) => updateCustomItem(section.id, item.id, 'subtitle', value)}
                                            editorClassName="text-md text-slate-600 italic"
                                        >
                                            <div className="text-md text-slate-600 italic mb-1">{item.subtitle}</div>
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
                                            editorClassName="text-sm text-slate-400 font-serif"
                                        >
                                            <div className="text-sm text-slate-400 font-serif">{item.date}</div>
                                        </FreeDraggable>
                                    )}
                                    {item.items.length > 0 && (
                                        <ul className="space-y-1 text-slate-600 font-serif leading-relaxed mt-2">
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
                                                    editorClassName="text-slate-600 font-serif"
                                                >
                                                    <li>{i}</li>
                                                </FreeDraggable>
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
