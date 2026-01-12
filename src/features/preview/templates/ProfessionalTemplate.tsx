import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';
import { useResume } from '../../resume/ResumeContext';
import { FreeDraggable } from '../../../components/ui/free-draggable';

interface TemplateProps {
    data: ResumeData;
}

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ data }) => {
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
            proj.id === projId ? { ...proj, techStack: value.split(/[,|•]/).map(s => s.trim()).filter(s => s) } : proj
        );
        setResumeData({ ...data, projects: newProjects });
    };

    // 更新技能数据
    const updateSkillGroup = (skillId: string, field: string, value: string) => {
        const newSkills = skills.map(skill => {
            if (skill.id === skillId) {
                if (field === 'items') {
                    return { ...skill, items: value.split(/[,•]/).map(s => s.trim()).filter(s => s) };
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

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="mb-6">
                <div className="flex justify-between items-start border-b-2 pb-4" style={{ borderColor: themeColor }}>
                    <div className="flex items-start gap-4">
                        {basics.avatarBase64 && (
                            <img
                                src={basics.avatarBase64}
                                alt={basics.name}
                                className="w-20 h-24 object-cover rounded shadow-md"
                            />
                        )}
                        <div>
                            <FreeDraggable
                                id="basics:name"
                                position={getPosition('basics:name')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.name}
                                onValueChange={(value) => updateBasics({ name: value })}
                                editorClassName="text-3xl font-bold text-gray-900"
                            >
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">{basics.name}</h1>
                            </FreeDraggable>
                            <FreeDraggable
                                id="basics:title"
                                position={getPosition('basics:title')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={basics.title}
                                onValueChange={(value) => updateBasics({ title: value })}
                                editorClassName="text-lg font-medium"
                            >
                                <p className="text-lg font-medium" style={{ color: themeColor }}>{basics.title}</p>
                            </FreeDraggable>
                        </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
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
                                <p><a href={`mailto:${basics.email}`} className="hover:underline">{basics.email}</a></p>
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
                                <p><a href={`tel:${basics.phone}`} className="hover:underline">{basics.phone}</a></p>
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
                                <p>{basics.city}</p>
                            </FreeDraggable>
                        )}
                        <div className="flex gap-2 justify-end mt-1 text-xs text-gray-400">
                            {basics.linkedin && <ExternalLink href={basics.linkedin} className="text-blue-600 hover:underline" />}
                            {basics.github && <ExternalLink href={basics.github} className="text-blue-600 hover:underline" />}
                        </div>
                    </div>
                </div>
            </div>
        ),
        summary: summary && (
            <div className="mb-6 resume-section">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2 resume-section-header" style={{ color: themeColor }}>{getSectionTitle('summary', t.previewSummary)}</h2>
                <FreeDraggable
                    id="summary:content"
                    position={getPosition('summary:content')}
                    onPositionChange={handlePositionChange}
                    editMode={editMode}
                    editable={true}
                    value={summary}
                    onValueChange={(value) => setResumeData({ ...data, summary: value })}
                    multiline={true}
                    editorClassName="text-sm leading-relaxed text-gray-700"
                >
                    <p className="text-sm leading-relaxed text-gray-700 border-l-2 pl-4" style={{ borderColor: themeColor }}>{summary}</p>
                </FreeDraggable>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-6 resume-section">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 resume-section-header" style={{ color: themeColor }}>{getSectionTitle('experience', t.previewExperience)}</h2>
                <div className="space-y-5">
                    {experience.map(exp => (
                        <div key={exp.id} className="resume-item">
                            <div className="flex justify-between items-baseline">
                                <FreeDraggable
                                    id={`experience:${exp.id}:role`}
                                    position={getPosition(`experience:${exp.id}:role`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={exp.role}
                                    onValueChange={(value) => updateExperience(exp.id, 'role', value)}
                                    editorClassName="font-bold text-gray-900"
                                >
                                    <h3 className="font-bold text-gray-900">{exp.role}</h3>
                                </FreeDraggable>
                                <FreeDraggable
                                    id={`experience:${exp.id}:date`}
                                    position={getPosition(`experience:${exp.id}:date`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                    editable={true}
                                    value={`${exp.start} – ${exp.current ? t.present : exp.end}`}
                                    onValueChange={(value) => {
                                        const parts = value.split('–').map(s => s.trim());
                                        if (parts.length >= 2) {
                                            updateExperience(exp.id, 'start', parts[0]);
                                            if (parts[1] === t.present) {
                                                setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: true, end: '' } : e) });
                                            } else {
                                                setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: false, end: parts[1] } : e) });
                                            }
                                        }
                                    }}
                                    editorClassName="text-sm text-gray-500"
                                >
                                    <span className="text-sm text-gray-500">{exp.start} – {exp.current ? t.present : exp.end}</span>
                                </FreeDraggable>
                            </div>
                            <FreeDraggable
                                id={`experience:${exp.id}:company`}
                                position={getPosition(`experience:${exp.id}:company`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={`${exp.company} | ${exp.city}`}
                                onValueChange={(value) => {
                                    const parts = value.split('|').map(s => s.trim());
                                    updateExperience(exp.id, 'company', parts[0] || '');
                                    if (parts.length > 1) {
                                        updateExperience(exp.id, 'city', parts[1]);
                                    }
                                }}
                                editorClassName="text-sm font-medium"
                            >
                                <p className="text-sm font-medium mb-2" style={{ color: themeColor }}>{exp.company} | {exp.city}</p>
                            </FreeDraggable>
                            <ul className="text-sm text-gray-600 space-y-1">
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
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                                            {h}
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
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 resume-section-header" style={{ color: themeColor }}>{getSectionTitle('education', t.previewEducation)}</h2>
                <div className="space-y-3">
                    {education.map(edu => (
                        <div key={edu.id} className="flex justify-between resume-item">
                            <div>
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
                                    editorClassName="text-sm text-gray-600"
                                >
                                    <p className="text-sm text-gray-600">{edu.degree} in {edu.major}</p>
                                </FreeDraggable>
                            </div>
                            <FreeDraggable
                                id={`education:${edu.id}:date`}
                                position={getPosition(`education:${edu.id}:date`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={`${edu.start} – ${edu.end}`}
                                onValueChange={(value) => {
                                    const parts = value.split('–').map(s => s.trim());
                                    if (parts.length >= 2) {
                                        updateEducation(edu.id, 'start', parts[0]);
                                        updateEducation(edu.id, 'end', parts[1]);
                                    }
                                }}
                                editorClassName="text-sm text-gray-500"
                            >
                                <span className="text-sm text-gray-500">{edu.start} – {edu.end}</span>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-6 resume-section">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 resume-section-header" style={{ color: themeColor }}>{getSectionTitle('projects', t.previewProjects)}</h2>
                <div className="space-y-4">
                    {projects.map(proj => (
                        <div key={proj.id} className="resume-item">
                            <div className="flex items-baseline gap-2">
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
                                {proj.link && <ExternalLink href={proj.link} className="text-xs" />}
                            </div>
                            <FreeDraggable
                                id={`projects:${proj.id}:techStack`}
                                position={getPosition(`projects:${proj.id}:techStack`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={proj.techStack.join(' | ')}
                                onValueChange={(value) => updateProjectTechStack(proj.id, value)}
                                editorClassName="text-xs text-gray-500"
                            >
                                <p className="text-xs text-gray-500 mb-1">{proj.techStack.join(' | ')}</p>
                            </FreeDraggable>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {proj.highlights.filter(h => h.trim()).map((h, i) => (
                                    <FreeDraggable
                                        key={i}
                                        id={`projects:${proj.id}:highlight:${i}`}
                                        position={getPosition(`projects:${proj.id}:highlight:${i}`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                        editable={true}
                                        value={h}
                                        onValueChange={(value) => updateProjectHighlight(proj.id, i, value)}
                                        editorClassName="text-sm text-gray-600"
                                    >
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                                            {h}
                                        </li>
                                    </FreeDraggable>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-6 resume-section">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 resume-section-header" style={{ color: themeColor }}>{getSectionTitle('skills', t.previewSkills)}</h2>
                <div className="space-y-2">
                    {skills.map(skill => (
                        <div key={skill.id} className="flex text-sm">
                            <FreeDraggable
                                id={`skills:${skill.id}:name`}
                                position={getPosition(`skills:${skill.id}:name`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={skill.name}
                                onValueChange={(value) => updateSkillGroup(skill.id, 'name', value)}
                                editorClassName="font-bold text-gray-800"
                            >
                                <span className="font-bold text-gray-800 w-28 shrink-0">{skill.name}:</span>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`skills:${skill.id}:items`}
                                position={getPosition(`skills:${skill.id}:items`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={skill.items.join(' • ')}
                                onValueChange={(value) => updateSkillGroup(skill.id, 'items', value)}
                                editorClassName="text-gray-600"
                            >
                                <span className="text-gray-600">{skill.items.join(' • ')}</span>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),
        custom: custom.length > 0 && (
            <>
                {custom.map(section => (
                    <div key={section.id} className="mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: themeColor }}>{section.title}</h2>
                        <div className="space-y-4">
                            {section.items.map(item => (
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline">
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
                                        {item.date && (
                                            <FreeDraggable
                                                id={`custom:${section.id}:${item.id}:date`}
                                                position={getPosition(`custom:${section.id}:${item.id}:date`)}
                                                onPositionChange={handlePositionChange}
                                                editMode={editMode}
                                                editable={true}
                                                value={item.date}
                                                onValueChange={(value) => updateCustomItem(section.id, item.id, 'date', value)}
                                                editorClassName="text-sm text-gray-500"
                                            >
                                                <span className="text-sm text-gray-500">{item.date}</span>
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
                                            editorClassName="text-sm font-medium"
                                        >
                                            <p className="text-sm font-medium mb-2" style={{ color: themeColor }}>{item.subtitle}</p>
                                        </FreeDraggable>
                                    )}
                                    {item.items.length > 0 && (
                                        <ul className="text-sm text-gray-600 space-y-1">
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
                                                    <li className="flex items-start gap-2">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
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
            </>
        ),
    };

    return (
        <div className="font-sans text-gray-800 p-2">
            {sectionRenderers.basics}
            {sectionOrder.filter(id => id !== 'basics').map(sectionId => {
                if (sectionVisibility[sectionId] === false) return null;
                return <div key={sectionId}>{sectionRenderers[sectionId]}</div>;
            })}
        </div>
    );
};
