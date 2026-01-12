import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';
import { useResume } from '../../resume/ResumeContext';
import { FreeDraggable } from '../../../components/ui/free-draggable';

interface TemplateProps {
    data: ResumeData;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { sectionOrder, sectionVisibility = {}, editMode, elementPositions = {}, fieldLabels = {} } = settings;
    const { t } = useLanguage();
    const { updateBasics, setResumeData, updateElementPosition } = useResume();

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
            proj.id === projId ? { ...proj, techStack: value.split(',').map(s => s.trim()).filter(s => s) } : proj
        );
        setResumeData({ ...data, projects: newProjects });
    };

    // 更新技能数据
    const updateSkill = (skillId: string, field: string, value: string) => {
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

    // 获取元素位置
    const getPosition = (elementId: string) => elementPositions[elementId] || { x: 0, y: 0 };

    // 处理元素位置变化
    const handlePositionChange = (elementId: string, position: { x: number; y: number }) => {
        updateElementPosition(elementId, position);
    };

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
                <FreeDraggable
                    id="basics:name"
                    position={getPosition('basics:name')}
                    onPositionChange={handlePositionChange}
                    editMode={editMode}
                    editable={true}
                    value={basics.name}
                    onValueChange={(value) => updateBasics({ name: value })}
                    editorClassName="text-4xl font-light tracking-widest uppercase text-gray-800"
                >
                    <h1 className="text-4xl font-light tracking-widest uppercase mb-2 text-gray-800">{basics.name}</h1>
                </FreeDraggable>
                <FreeDraggable
                    id="basics:title"
                    position={getPosition('basics:title')}
                    onPositionChange={handlePositionChange}
                    editMode={editMode}
                    editable={true}
                    value={basics.title}
                    onValueChange={(value) => updateBasics({ title: value })}
                    editorClassName="text-lg text-gray-500 font-light tracking-wide"
                >
                    <p className="text-lg text-gray-500 font-light tracking-wide mb-4">{basics.title}</p>
                </FreeDraggable>
                <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-500">
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
                    {basics.phone && <span>•</span>}
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
                    {basics.city && <span>•</span>}
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
                <div className="flex justify-center gap-4 mt-2 text-sm text-gray-400">
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
                            <ExternalLink href={basics.linkedin} className="hover:text-gray-600" />
                        </FreeDraggable>
                    )}
                    {basics.github && (
                        <FreeDraggable
                            id="basics:github"
                            position={getPosition('basics:github')}
                            onPositionChange={handlePositionChange}
                            editMode={editMode}
                            editable={true}
                            value={basics.github}
                            onValueChange={(value) => updateBasics({ github: value })}
                            editorClassName="text-sm"
                        >
                            <ExternalLink href={basics.github} className="hover:text-gray-600" />
                        </FreeDraggable>
                    )}
                </div>
            </div>
        ),
        summary: summary && (
            <div className="mb-8">
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
                    <p className="text-sm leading-relaxed text-gray-600 text-center max-w-2xl mx-auto italic">{summary}</p>
                </FreeDraggable>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 text-center">{getSectionTitle('experience', t.previewExperience)}</h2>
                <div className="space-y-6">
                    {experience.map(exp => (
                        <div key={exp.id} className="text-center">
                            <FreeDraggable
                                id={`experience:${exp.id}:role`}
                                position={getPosition(`experience:${exp.id}:role`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={exp.role}
                                onValueChange={(value) => updateExperience(exp.id, 'role', value)}
                                editorClassName="font-medium text-gray-800"
                            >
                                <h3 className="font-medium text-gray-800">{exp.role}</h3>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`experience:${exp.id}:company`}
                                position={getPosition(`experience:${exp.id}:company`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={`${exp.company} • ${exp.start} - ${exp.current ? t.present : exp.end}`}
                                onValueChange={(value) => {
                                    const parts = value.split('•').map(s => s.trim());
                                    if (parts.length >= 2) {
                                        updateExperience(exp.id, 'company', parts[0]);
                                        const dateParts = parts[1].split('-').map(s => s.trim());
                                        if (dateParts.length >= 2) {
                                            updateExperience(exp.id, 'start', dateParts[0]);
                                            if (dateParts[1] === t.present) {
                                                setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: true, end: '' } : e) });
                                            } else {
                                                setResumeData({ ...data, experience: experience.map(e => e.id === exp.id ? { ...e, current: false, end: dateParts[1] } : e) });
                                            }
                                        }
                                    }
                                }}
                                editorClassName="text-sm text-gray-500"
                            >
                                <p className="text-sm text-gray-500 mb-2">{exp.company} • {exp.start} - {exp.current ? t.present : exp.end}</p>
                            </FreeDraggable>
                            <ul className="text-sm text-gray-600 space-y-1 max-w-xl mx-auto">
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
                    ))}
                </div>
            </div>
        ),
        education: education.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 text-center">{getSectionTitle('education', t.previewEducation)}</h2>
                <div className="space-y-4 text-center">
                    {education.map(edu => (
                        <div key={edu.id}>
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
                                editorClassName="font-medium text-gray-800"
                            >
                                <h3 className="font-medium text-gray-800">{edu.degree} in {edu.major}</h3>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`education:${edu.id}:school`}
                                position={getPosition(`education:${edu.id}:school`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={`${edu.school} • ${edu.start} - ${edu.end}`}
                                onValueChange={(value) => {
                                    const parts = value.split('•').map(s => s.trim());
                                    if (parts.length >= 2) {
                                        updateEducation(edu.id, 'school', parts[0]);
                                        const dateParts = parts[1].split('-').map(s => s.trim());
                                        if (dateParts.length >= 2) {
                                            updateEducation(edu.id, 'start', dateParts[0]);
                                            updateEducation(edu.id, 'end', dateParts[1]);
                                        }
                                    }
                                }}
                                editorClassName="text-sm text-gray-500"
                            >
                                <p className="text-sm text-gray-500">{edu.school} • {edu.start} - {edu.end}</p>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 text-center">{getSectionTitle('projects', t.previewProjects)}</h2>
                <div className="space-y-4 text-center">
                    {projects.map(proj => (
                        <div key={proj.id}>
                            <FreeDraggable
                                id={`projects:${proj.id}:name`}
                                position={getPosition(`projects:${proj.id}:name`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={proj.name}
                                onValueChange={(value) => updateProject(proj.id, 'name', value)}
                                editorClassName="font-medium text-gray-800"
                            >
                                <h3 className="font-medium text-gray-800">{proj.name}</h3>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`projects:${proj.id}:techStack`}
                                position={getPosition(`projects:${proj.id}:techStack`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                                editable={true}
                                value={proj.techStack.join(' • ')}
                                onValueChange={(value) => updateProjectTechStack(proj.id, value.replace(/•/g, ','))}
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
                                onValueChange={(value) => updateProjectHighlight(proj.id, 0, value)}
                                editorClassName="text-sm text-gray-600"
                            >
                                <p className="text-sm text-gray-600">{proj.highlights[0]}</p>
                            </FreeDraggable>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 text-center">{getSectionTitle('skills', t.previewSkills)}</h2>
                <div className="flex flex-wrap justify-center gap-3">
                    {skills.flatMap(group => group.items.map((skill, i) => (
                        <FreeDraggable
                            key={`${group.id}-${i}`}
                            id={`skills:${group.id}:item:${i}`}
                            position={getPosition(`skills:${group.id}:item:${i}`)}
                            onPositionChange={handlePositionChange}
                            editMode={editMode}
                            editable={true}
                            value={skill}
                            onValueChange={(value) => {
                                const newItems = [...group.items];
                                newItems[i] = value;
                                setResumeData({ ...data, skills: skills.map(s => s.id === group.id ? { ...s, items: newItems } : s) });
                            }}
                            editorClassName="text-sm text-gray-600"
                        >
                            <span className="text-sm text-gray-600">{skill}</span>
                        </FreeDraggable>
                    )))}
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
                                    <FreeDraggable
                                        id={`custom:${section.id}:${item.id}:title`}
                                        position={getPosition(`custom:${section.id}:${item.id}:title`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                        editable={true}
                                        value={item.title}
                                        onValueChange={(value) => updateCustomItem(section.id, item.id, 'title', value)}
                                        editorClassName="font-medium text-gray-800"
                                    >
                                        <h3 className="font-medium text-gray-800">{item.title}</h3>
                                    </FreeDraggable>
                                    {item.link && <ExternalLink href={item.link} className="text-xs text-blue-500 hover:underline" />}
                                    {item.subtitle && (
                                        <FreeDraggable
                                            id={`custom:${section.id}:${item.id}:subtitle`}
                                            position={getPosition(`custom:${section.id}:${item.id}:subtitle`)}
                                            onPositionChange={handlePositionChange}
                                            editMode={editMode}
                                            editable={true}
                                            value={item.subtitle}
                                            onValueChange={(value) => updateCustomItem(section.id, item.id, 'subtitle', value)}
                                            editorClassName="text-sm text-gray-500"
                                        >
                                            <p className="text-sm text-gray-500">{item.subtitle}</p>
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
                                            <p className="text-xs text-gray-400">{item.date}</p>
                                        </FreeDraggable>
                                    )}
                                    {item.items.length > 0 && (
                                        <ul className="text-sm text-gray-600 space-y-1 max-w-xl mx-auto mt-1">
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
                            ))}
                        </div>
                    </div>
                ))}
            </>
        ),
    };

    return (
        <div className="font-sans text-gray-800 p-4">
            <div data-section="basics">
                {sectionRenderers.basics}
            </div>
            {sectionOrder.filter(id => id !== 'basics').map(sectionId => {
                if (sectionVisibility[sectionId] === false) return null;
                return <div key={sectionId} data-section={sectionId}>{sectionRenderers[sectionId]}</div>;
            })}
        </div>
    );
};
