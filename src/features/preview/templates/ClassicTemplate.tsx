import React from 'react';
import type { ResumeData } from '../../resume/types';
import { useLanguage } from '../../../i18n';
import { ExternalLink } from '../../../components/ui/linkify';
import { useResume } from '../../resume/ResumeContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggablePreviewSection } from '../components/DraggablePreviewSection';
import { FreeDraggable } from '../../../components/ui/free-draggable';

interface TemplateProps {
    data: ResumeData;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {}, editMode, elementPositions = {} } = settings;
    const { t } = useLanguage();
    const { reorderSections, updateElementPosition } = useResume();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = sectionOrder.indexOf(active.id as string);
            const newIndex = sectionOrder.indexOf(over?.id as string);
            reorderSections(arrayMove(sectionOrder, oldIndex, newIndex));
        }
    };

    // 获取元素位置
    const getPosition = (elementId: string) => elementPositions[elementId] || { x: 0, y: 0 };

    // 处理元素位置变化
    const handlePositionChange = (elementId: string, position: { x: number; y: number }) => {
        updateElementPosition(elementId, position);
    };

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="mb-6 border-b-2 pb-4 flex justify-between items-start" style={{ borderColor: themeColor }}>
                <div className="flex-1">
                    <FreeDraggable
                        id="basics:name"
                        position={getPosition('basics:name')}
                        onPositionChange={handlePositionChange}
                        editMode={editMode}
                    >
                        <h1 className="text-3xl font-bold uppercase tracking-wide mb-2" style={{ color: themeColor }}>{basics.name}</h1>
                    </FreeDraggable>
                    <FreeDraggable
                        id="basics:title"
                        position={getPosition('basics:title')}
                        onPositionChange={handlePositionChange}
                        editMode={editMode}
                    >
                        <p className="text-xl font-medium mb-2">{basics.title}</p>
                    </FreeDraggable>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        {basics.email && (
                            <FreeDraggable
                                id="basics:email"
                                position={getPosition('basics:email')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
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
                            >
                                <ExternalLink href={basics.linkedin} className="text-blue-600 hover:underline" />
                            </FreeDraggable>
                        )}
                        {basics.github && (
                            <FreeDraggable
                                id="basics:github"
                                position={getPosition('basics:github')}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                            >
                                <ExternalLink href={basics.github} className="text-blue-600 hover:underline" />
                            </FreeDraggable>
                        )}
                    </div>
                </div>
                {basics.avatarBase64 && (
                    <FreeDraggable
                        id="basics:avatar"
                        position={getPosition('basics:avatar')}
                        onPositionChange={handlePositionChange}
                        editMode={editMode}
                    >
                        <img
                            src={basics.avatarBase64}
                            alt={basics.name}
                            className="w-24 h-32 object-cover rounded shadow-md ml-4"
                        />
                    </FreeDraggable>
                )}
            </div>
        ),
        summary: summary && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-2 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewSummary}</h2>
                <FreeDraggable
                    id="summary:content"
                    position={getPosition('summary:content')}
                    onPositionChange={handlePositionChange}
                    editMode={editMode}
                >
                    <p className="text-sm leading-relaxed">{summary}</p>
                </FreeDraggable>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewExperience}</h2>
                <div className="space-y-4">
                    {experience.map(exp => (
                        <div key={exp.id} className="relative">
                            <FreeDraggable
                                id={`experience:${exp.id}:company`}
                                position={getPosition(`experience:${exp.id}:company`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-800">{exp.company}</h3>
                                    <span className="text-sm text-gray-600 font-medium">
                                        {exp.start} – {exp.current ? t.present : exp.end}
                                    </span>
                                </div>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`experience:${exp.id}:role`}
                                position={getPosition(`experience:${exp.id}:role`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold italic text-gray-700">{exp.role}</span>
                                    <span className="text-xs text-gray-500">{exp.city}</span>
                                </div>
                            </FreeDraggable>
                            <div className="ml-4 text-sm space-y-1 text-gray-700">
                                {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                    <FreeDraggable
                                        key={i}
                                        id={`experience:${exp.id}:highlight:${i}`}
                                        position={getPosition(`experience:${exp.id}:highlight:${i}`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                    >
                                        <div className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span className="leading-snug">{h}</span>
                                        </div>
                                    </FreeDraggable>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        education: education.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewEducation}</h2>
                <div className="space-y-3">
                    {education.map(edu => (
                        <div key={edu.id} className="relative">
                            <FreeDraggable
                                id={`education:${edu.id}:school`}
                                position={getPosition(`education:${edu.id}:school`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-800">{edu.school}</h3>
                                    <span className="text-sm text-gray-600 font-medium">
                                        {edu.start} – {edu.end}
                                    </span>
                                </div>
                            </FreeDraggable>
                            <FreeDraggable
                                id={`education:${edu.id}:degree`}
                                position={getPosition(`education:${edu.id}:degree`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold text-gray-700">{edu.degree}, {edu.major}</span>
                                </div>
                            </FreeDraggable>
                            {edu.highlights.length > 0 && (
                                <div className="ml-4 text-sm space-y-1 text-gray-700 mt-1">
                                    {edu.highlights.filter(h => h.trim()).map((h, i) => (
                                        <FreeDraggable
                                            key={i}
                                            id={`education:${edu.id}:highlight:${i}`}
                                            position={getPosition(`education:${edu.id}:highlight:${i}`)}
                                            onPositionChange={handlePositionChange}
                                            editMode={editMode}
                                        >
                                            <div className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{h}</span>
                                            </div>
                                        </FreeDraggable>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ),
        projects: projects.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewProjects}</h2>
                <div className="space-y-3">
                    {projects.map(proj => (
                        <div key={proj.id} className="relative">
                            <FreeDraggable
                                id={`projects:${proj.id}:name`}
                                position={getPosition(`projects:${proj.id}:name`)}
                                onPositionChange={handlePositionChange}
                                editMode={editMode}
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800">{proj.name}</h3>
                                        {proj.link && <ExternalLink href={proj.link} className="text-xs text-blue-600 underline" />}
                                    </div>
                                </div>
                            </FreeDraggable>
                            {proj.techStack.length > 0 && (
                                <FreeDraggable
                                    id={`projects:${proj.id}:techStack`}
                                    position={getPosition(`projects:${proj.id}:techStack`)}
                                    onPositionChange={handlePositionChange}
                                    editMode={editMode}
                                >
                                    <div className="text-xs text-gray-600 mb-1 font-medium">
                                        <span className="italic">{t.techStack}:</span> {proj.techStack.join(', ')}
                                    </div>
                                </FreeDraggable>
                            )}
                            <div className="ml-4 text-sm space-y-1 text-gray-700">
                                {proj.highlights.filter(h => h.trim()).map((h, i) => (
                                    <FreeDraggable
                                        key={i}
                                        id={`projects:${proj.id}:highlight:${i}`}
                                        position={getPosition(`projects:${proj.id}:highlight:${i}`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                    >
                                        <div className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span className="leading-snug">{h}</span>
                                        </div>
                                    </FreeDraggable>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        skills: skills.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewSkills}</h2>
                <div className="grid grid-cols-1 gap-2">
                    {skills.map(skill => (
                        <FreeDraggable
                            key={skill.id}
                            id={`skills:${skill.id}`}
                            position={getPosition(`skills:${skill.id}`)}
                            onPositionChange={handlePositionChange}
                            editMode={editMode}
                        >
                            <div className="flex text-sm">
                                <span className="font-bold w-32 shrink-0 text-gray-800">{skill.name}:</span>
                                <span className="text-gray-700 flex-1">{skill.items.join(', ')}</span>
                            </div>
                        </FreeDraggable>
                    ))}
                </div>
            </div>
        ),
        custom: custom.length > 0 && (
            <>
                {custom.map(section => (
                    <div key={section.id} className="mb-6">
                        <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{section.title}</h2>
                        <div className="space-y-3">
                            {section.items.map(item => (
                                <div key={item.id} className="relative">
                                    <FreeDraggable
                                        id={`custom:${section.id}:${item.id}:title`}
                                        position={getPosition(`custom:${section.id}:${item.id}:title`)}
                                        onPositionChange={handlePositionChange}
                                        editMode={editMode}
                                    >
                                        <div className="flex justify-between items-baseline mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-800">{item.title}</h3>
                                                {item.link && <ExternalLink href={item.link} className="text-xs text-blue-600 underline" />}
                                            </div>
                                            {item.date && <span className="text-sm text-gray-600 font-medium">{item.date}</span>}
                                        </div>
                                    </FreeDraggable>
                                    {item.subtitle && (
                                        <FreeDraggable
                                            id={`custom:${section.id}:${item.id}:subtitle`}
                                            position={getPosition(`custom:${section.id}:${item.id}:subtitle`)}
                                            onPositionChange={handlePositionChange}
                                            editMode={editMode}
                                        >
                                            <p className="text-sm font-semibold italic text-gray-700 mb-1">{item.subtitle}</p>
                                        </FreeDraggable>
                                    )}
                                    {item.items.length > 0 && (
                                        <div className="ml-4 text-sm space-y-1 text-gray-700">
                                            {item.items.filter(i => i.trim()).map((i, idx) => (
                                                <FreeDraggable
                                                    key={idx}
                                                    id={`custom:${section.id}:${item.id}:item:${idx}`}
                                                    position={getPosition(`custom:${section.id}:${item.id}:item:${idx}`)}
                                                    onPositionChange={handlePositionChange}
                                                    editMode={editMode}
                                                >
                                                    <div className="flex items-start">
                                                        <span className="mr-2">•</span>
                                                        <span className="leading-snug">{i}</span>
                                                    </div>
                                                </FreeDraggable>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </>
        ),
    };

    // 可拖拽的 section 列表（不包括 basics）
    const draggableSections = sectionOrder.filter(id => id !== 'basics');

    const renderSections = () => {
        if (!editMode) {
            // 非编辑模式，直接渲染
            return draggableSections.map(sectionId => {
                if (sectionVisibility[sectionId] === false) return null;
                return (
                    <div key={sectionId}>
                        {sectionRenderers[sectionId]}
                    </div>
                );
            });
        }

        // 编辑模式，支持拖拽
        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={draggableSections}
                    strategy={verticalListSortingStrategy}
                >
                    {draggableSections.map(sectionId => {
                        if (sectionVisibility[sectionId] === false) return null;
                        return (
                            <DraggablePreviewSection
                                key={sectionId}
                                id={sectionId}
                                editMode={editMode}
                            >
                                {sectionRenderers[sectionId]}
                            </DraggablePreviewSection>
                        );
                    })}
                </SortableContext>
            </DndContext>
        );
    };

    return (
        <div className="font-sans text-gray-800 p-1">
            {sectionRenderers.basics}
            {renderSections()}
        </div>
    );
};
