import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';
import { useResume } from '../../resume/ResumeContext';
import { FreeDraggable } from '../../../components/ui/free-draggable';

interface TemplateProps {
    data: ResumeData;
}

export const TechTemplate: React.FC<TemplateProps> = ({ data }) => {
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
    const updateProjectTechStack = (projId: string, index: number, value: string) => {
        const newProjects = projects.map(proj => {
            if (proj.id === projId) {
                const newTechStack = [...proj.techStack];
                newTechStack[index] = value;
                return { ...proj, techStack: newTechStack };
            }
            return proj;
        });
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

    // 更新技能项
    const updateSkillItem = (skillId: string, index: number, value: string) => {
        const newSkills = skills.map(skill => {
            if (skill.id === skillId) {
                const newItems = [...skill.items];
                newItems[index] = value;
                return { ...skill, items: newItems };
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
                            <span className="text-purple-400">name</span>: <FreeDraggable
                                id="basics:name"
                                position={getPosition('basics:name')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.name}
                                onValueChange={(value) => updateBasics({ name: value })}
                                editorClassName="text-yellow-300"
                            >
                                <span className="text-yellow-300">"{basics.name}"</span>
                            </FreeDraggable>,
                        </p>
                        <p className="text-sm pl-4">
                            <span className="text-purple-400">title</span>: <FreeDraggable
                                id="basics:title"
                                position={getPosition('basics:title')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.title}
                                onValueChange={(value) => updateBasics({ title: value })}
                                editorClassName="text-yellow-300"
                            >
                                <span className="text-yellow-300">"{basics.title}"</span>
                            </FreeDraggable>,
                        </p>
                        <p className="text-sm pl-4">
                            <span className="text-purple-400">contact</span>: {'['}<FreeDraggable
                                id="basics:email"
                                position={getPosition('basics:email')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.email}
                                onValueChange={(value) => updateBasics({ email: value })}
                                editorClassName="text-yellow-300"
                            >
                                <span className="text-yellow-300">"{basics.email}"</span>
                            </FreeDraggable>, <FreeDraggable
                                id="basics:phone"
                                position={getPosition('basics:phone')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.phone}
                                onValueChange={(value) => updateBasics({ phone: value })}
                                editorClassName="text-yellow-300"
                            >
                                <span className="text-yellow-300">"{basics.phone}"</span>
                            </FreeDraggable>{']'},
                        </p>
                        <p className="text-sm pl-4">
                            <span className="text-purple-400">location</span>: <FreeDraggable
                                id="basics:city"
                                position={getPosition('basics:city')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.city}
                                onValueChange={(value) => updateBasics({ city: value })}
                                editorClassName="text-yellow-300"
                            >
                                <span className="text-yellow-300">"{basics.city}"</span>
                            </FreeDraggable>
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
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border-l-4 resume-section" style={{ borderColor: themeColor }}>
                <FreeDraggable
                    id="summary:content"
                    position={getPosition('summary:content')}
                    onPositionChange={handlePositionChange}
                    editMode={editMode}
                    editable={true}
                    value={summary}
                    onValueChange={(value) => setResumeData({ ...data, summary: value })}
                    multiline={true}
                    editorClassName="text-sm text-slate-600 font-mono"
                >
                    <p className="text-sm text-slate-600 font-mono">
                        <span className="text-slate-400">// </span>{summary}
                    </p>
                </FreeDraggable>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-6 resume-section">
                <h2 className="text-lg font-bold mb-4 font-mono flex items-center gap-2 resume-section-header">
                    <span style={{ color: themeColor }}>{'<'}</span>
                    {getSectionTitle('experience', t.previewExperience)}
                    <span style={{ color: themeColor }}>{'/>'}</span>
                </h2>
                <div className="space-y-4">
                    {experience.map(exp => (
                        <div key={exp.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors resume-item">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <FreeDraggable
                                        id={`experience:${exp.id}:role`}
                                        position={getPosition(`experience:${exp.id}:role`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                        editable={true}
                                        value={exp.role}
                                        onValueChange={(value) => updateExperience(exp.id, 'role', value)}
                                        editorClassName="font-bold text-slate-800"
                                    >
                                        <h3 className="font-bold text-slate-800">{exp.role}</h3>
                                    </FreeDraggable>
                                    <FreeDraggable
                                        id={`experience:${exp.id}:company`}
                                        position={getPosition(`experience:${exp.id}:company`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                        editable={true}
                                        value={exp.company}
                                        onValueChange={(value) => updateExperience(exp.id, 'company', value)}
                                        editorClassName="text-sm"
                                    >
                                        <p className="text-sm" style={{ color: themeColor }}>{exp.company}</p>
                                    </FreeDraggable>
                                </div>
                                <FreeDraggable
                                    id={`experience:${exp.id}:date`}
                                    position={getPosition(`experience:${exp.id}:date`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={`${exp.start} → ${exp.current ? t.present : exp.end}`}
                                    onValueChange={(value) => {
                                        const parts = value.split('→').map(s => s.trim());
                                        if (parts.length >= 2) {
                                            updateExperience(exp.id, 'start', parts[0]);
                                            if (parts[1] === t.present) {
                                                setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: true, end: '' } : e) });
                                            } else {
                                                setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: false, end: parts[1] } : e) });
                                            }
                                        }
                                    }}
                                    editorClassName="text-xs text-slate-600"
                                >
                                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                        {exp.start} → {exp.current ? t.present : exp.end}
                                    </code>
                                </FreeDraggable>
                            </div>
                            <ul className="text-sm text-slate-600 space-y-1 font-mono">
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
                                        editorClassName="text-sm text-slate-600 font-mono"
                                    >
                                        <li className="flex items-start gap-2">
                                            <span style={{ color: themeColor }}>→</span> {h}
                                        </li>
                                    </FreeDraggable>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ),
        education: education.length > 0 && (
            <div className="mb-6 resume-section">
                <h2 className="text-lg font-bold mb-4 font-mono flex items-center gap-2 resume-section-header">
                    <span style={{ color: themeColor }}>{'<'}</span>
                    {getSectionTitle('education', t.previewEducation)}
                    <span style={{ color: themeColor }}>{'/>'}</span>
                </h2>
                <div className="space-y-3">
                    {education.map(edu => (
                        <div key={edu.id} className="flex justify-between items-center p-3 bg-slate-50 rounded resume-item">
                            <div>
                                <FreeDraggable
                                    id={`education:${edu.id}:school`}
                                    position={getPosition(`education:${edu.id}:school`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={edu.school}
                                    onValueChange={(value) => updateEducation(edu.id, 'school', value)}
                                    editorClassName="font-bold text-slate-800"
                                >
                                    <h3 className="font-bold text-slate-800">{edu.school}</h3>
                                </FreeDraggable>
                                <FreeDraggable
                                    id={`education:${edu.id}:degree`}
                                    position={getPosition(`education:${edu.id}:degree`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={`${edu.degree} • ${edu.major}`}
                                    onValueChange={(value) => {
                                        const parts = value.split('•').map(s => s.trim());
                                        if (parts.length >= 2) {
                                            updateEducation(edu.id, 'degree', parts[0]);
                                            updateEducation(edu.id, 'major', parts[1]);
                                        } else {
                                            updateEducation(edu.id, 'degree', value);
                                        }
                                    }}
                                    editorClassName="text-sm text-slate-600"
                                >
                                    <p className="text-sm text-slate-600">{edu.degree} • {edu.major}</p>
                                </FreeDraggable>
                            </div>
                            <FreeDraggable
                                id={`education:${edu.id}:date`}
                                position={getPosition(`education:${edu.id}:date`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={`${edu.start}~${edu.end}`}
                                onValueChange={(value) => {
                                    const parts = value.split('~').map(s => s.trim());
                                    if (parts.length >= 2) {
                                        updateEducation(edu.id, 'start', parts[0]);
                                        updateEducation(edu.id, 'end', parts[1]);
                                    }
                                }}
                                editorClassName="text-xs text-slate-500"
                            >
                                <code className="text-xs text-slate-500">{edu.start}~{edu.end}</code>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-6 resume-section">
                <h2 className="text-lg font-bold mb-4 font-mono flex items-center gap-2 resume-section-header">
                    <span style={{ color: themeColor }}>{'<'}</span>
                    {getSectionTitle('projects', t.previewProjects)}
                    <span style={{ color: themeColor }}>{'/>'}</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {projects.map(proj => (
                        <div key={proj.id} className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 resume-item">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
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
                                    <h3 className="font-bold text-slate-800">{proj.name}</h3>
                                </FreeDraggable>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {proj.techStack.map((tech, i) => (
                                    <FreeDraggable
                                        key={i}
                                        id={`projects:${proj.id}:tech:${i}`}
                                        position={getPosition(`projects:${proj.id}:tech:${i}`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                        editable={true}
                                        value={tech}
                                        onValueChange={(value) => updateProjectTechStack(proj.id, i, value)}
                                        editorClassName="text-xs text-white"
                                    >
                                        <code className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: themeColor }}>{tech}</code>
                                    </FreeDraggable>
                                ))}
                            </div>
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
                                editorClassName="text-xs text-slate-600"
                            >
                                <p className="text-xs text-slate-600">{proj.highlights[0]}</p>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-6 resume-section">
                <h2 className="text-lg font-bold mb-4 font-mono flex items-center gap-2 resume-section-header">
                    <span style={{ color: themeColor }}>{'<'}</span>
                    {getSectionTitle('skills', t.previewSkills)}
                    <span style={{ color: themeColor }}>{'/>'}</span>
                </h2>
                <div className="p-4 bg-slate-900 rounded-lg font-mono text-sm">
                    <p className="text-slate-400 mb-2">
                        <span className="text-green-400">const</span> <span className="text-blue-400">skills</span> = {'{'}
                    </p>
                    {skills.map((skill, idx) => (
                        <p key={skill.id} className="text-slate-300 pl-4">
                            <FreeDraggable
                                id={`skills:${skill.id}:name`}
                                position={getPosition(`skills:${skill.id}:name`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={skill.name}
                                onValueChange={(value) => updateSkillGroup(skill.id, 'name', value)}
                                editorClassName="text-purple-400"
                            >
                                <span className="text-purple-400">{skill.name.toLowerCase().replace(/\s+/g, '_')}</span>
                            </FreeDraggable>: [
                            {skill.items.map((item, i) => (
                                <span key={i}>
                                    <FreeDraggable
                                        id={`skills:${skill.id}:item:${i}`}
                                        position={getPosition(`skills:${skill.id}:item:${i}`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                        editable={true}
                                        value={item}
                                        onValueChange={(value) => updateSkillItem(skill.id, i, value)}
                                        editorClassName="text-yellow-300"
                                    >
                                        <span className="text-yellow-300">"{item}"</span>
                                    </FreeDraggable>
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
        custom: custom.length > 0 && (
            <>
                {custom.map(section => (
                    <div key={section.id} className="mb-6">
                        <h2 className="text-lg font-bold mb-4 font-mono flex items-center gap-2">
                            <span style={{ color: themeColor }}>{'<'}</span>
                            {section.title}
                            <span style={{ color: themeColor }}>{'/>'}</span>
                        </h2>
                        <div className="space-y-3">
                            {section.items.map(item => (
                                <div key={item.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
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
                                                    editorClassName="font-bold text-slate-800"
                                                >
                                                    <h3 className="font-bold text-slate-800">{item.title}</h3>
                                                </FreeDraggable>
                                                {item.link && <ExternalLink href={item.link} className="text-xs text-blue-500 hover:underline" />}
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
                                                editorClassName="text-xs text-slate-600"
                                            >
                                                <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                                    {item.date}
                                                </code>
                                            </FreeDraggable>
                                        )}
                                    </div>
                                    {item.items.length > 0 && (
                                        <ul className="text-sm text-slate-600 space-y-1 font-mono">
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
                                                    editorClassName="text-sm text-slate-600 font-mono"
                                                >
                                                    <li className="flex items-start gap-2">
                                                        <span style={{ color: themeColor }}>→</span> {i}
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
            </>
        ),
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
