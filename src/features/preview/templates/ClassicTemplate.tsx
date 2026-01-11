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

interface TemplateProps {
    data: ResumeData;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { basics, summary, experience, education, projects, skills, custom, settings } = data;
    const { themeColor, sectionOrder, sectionVisibility = {}, editMode } = settings;
    const { t } = useLanguage();
    const { reorderSections } = useResume();

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

    const sectionRenderers: Record<string, React.ReactNode> = {
        basics: (
            <div className="mb-6 border-b-2 pb-4 flex justify-between items-start" style={{ borderColor: themeColor }}>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold uppercase tracking-wide mb-2" style={{ color: themeColor }}>{basics.name}</h1>
                    <p className="text-xl font-medium mb-2">{basics.title}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        {basics.email && <a href={`mailto:${basics.email}`} className="hover:underline">{basics.email}</a>}
                        {basics.phone && <a href={`tel:${basics.phone}`} className="hover:underline">{basics.phone}</a>}
                        {basics.city && <span>{basics.city}</span>}
                        {basics.website && <ExternalLink href={basics.website} className="text-blue-600 hover:underline" />}
                        {basics.linkedin && <ExternalLink href={basics.linkedin} className="text-blue-600 hover:underline" />}
                        {basics.github && <ExternalLink href={basics.github} className="text-blue-600 hover:underline" />}
                    </div>
                </div>
                {basics.avatarBase64 && (
                    <img
                        src={basics.avatarBase64}
                        alt={basics.name}
                        className="w-24 h-32 object-cover rounded shadow-md ml-4"
                    />
                )}
            </div>
        ),
        summary: summary && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-2 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewSummary}</h2>
                <p className="text-sm leading-relaxed">{summary}</p>
            </div>
        ),
        experience: experience.length > 0 && (
            <div className="mb-6">
                <h2 className="text-lg font-bold uppercase mb-3 border-b pb-1" style={{ color: themeColor, borderColor: themeColor }}>{t.previewExperience}</h2>
                <div className="space-y-4">
                    {experience.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-gray-800">{exp.company}</h3>
                                <span className="text-sm text-gray-600 font-medium">
                                    {exp.start} – {exp.current ? t.present : exp.end}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold italic text-gray-700">{exp.role}</span>
                                <span className="text-xs text-gray-500">{exp.city}</span>
                            </div>
                            <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-700">
                                {exp.highlights.filter(h => h.trim()).map((h, i) => (
                                    <li key={i} className="leading-snug">{h}</li>
                                ))}
                            </ul>
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
                        <div key={edu.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-gray-800">{edu.school}</h3>
                                <span className="text-sm text-gray-600 font-medium">
                                    {edu.start} – {edu.end}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-gray-700">{edu.degree}, {edu.major}</span>
                            </div>
                            {edu.highlights.length > 0 && (
                                <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-700 mt-1">
                                    {edu.highlights.filter(h => h.trim()).map((h, i) => (
                                        <li key={i}>{h}</li>
                                    ))}
                                </ul>
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
                        <div key={proj.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-800">{proj.name}</h3>
                                    {proj.link && <ExternalLink href={proj.link} className="text-xs text-blue-600 underline" />}
                                </div>
                            </div>
                            {proj.techStack.length > 0 && (
                                <div className="text-xs text-gray-600 mb-1 font-medium">
                                    <span className="italic">{t.techStack}:</span> {proj.techStack.join(', ')}
                                </div>
                            )}
                            <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-700">
                                {proj.highlights.filter(h => h.trim()).map((h, i) => (
                                    <li key={i} className="leading-snug">{h}</li>
                                ))}
                            </ul>
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
                        <div key={skill.id} className="flex text-sm">
                            <span className="font-bold w-32 shrink-0 text-gray-800">{skill.name}:</span>
                            <span className="text-gray-700 flex-1">{skill.items.join(', ')}</span>
                        </div>
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
                                <div key={item.id}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-800">{item.title}</h3>
                                            {item.link && <ExternalLink href={item.link} className="text-xs text-blue-600 underline" />}
                                        </div>
                                        {item.date && <span className="text-sm text-gray-600 font-medium">{item.date}</span>}
                                    </div>
                                    {item.subtitle && <p className="text-sm font-semibold italic text-gray-700 mb-1">{item.subtitle}</p>}
                                    {item.items.length > 0 && (
                                        <ul className="list-disc list-outside ml-4 text-sm space-y-1 text-gray-700">
                                            {item.items.filter(i => i.trim()).map((i, idx) => (
                                                <li key={idx} className="leading-snug">{i}</li>
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
