import React from 'react';
import { ScrollArea } from '../../components/ui/scroll-area';
import { useResume } from '../resume/ResumeContext';
import { useLanguage } from '../../i18n';
import { SectionWrapper } from './SectionWrapper';
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
import { BasicsForm } from './sections/BasicsForm';
import { SummaryForm } from './sections/SummaryForm';
import { ExperienceForm } from './sections/ExperienceForm';
import { EducationForm } from './sections/EducationForm';
import { ProjectsForm } from './sections/ProjectsForm';
import { SkillsForm } from './sections/SkillsForm';
import { CustomForm } from './sections/CustomForm';

const SECTION_COMPONENTS: Record<string, React.FC> = {
    basics: BasicsForm,
    summary: SummaryForm,
    experience: ExperienceForm,
    education: EducationForm,
    projects: ProjectsForm,
    skills: SkillsForm,
    custom: CustomForm,
};

// Section ID 到 fieldLabels key 的映射
const SECTION_LABEL_KEYS: Record<string, string> = {
    basics: 'sectionBasics',
    summary: 'sectionSummary',
    experience: 'sectionExperience',
    education: 'sectionEducation',
    projects: 'sectionProjects',
    skills: 'sectionSkills',
    custom: 'sectionCustom',
};

export const Editor: React.FC = () => {
    const { resumeData, reorderSections, updateSettings, setResumeData } = useResume();
    const { t } = useLanguage();
    const { sectionOrder, sectionVisibility = {}, fieldLabels = {} } = resumeData.settings;

    const SECTION_TITLES: Record<string, string> = {
        basics: t.basics,
        summary: t.summary,
        experience: t.experience,
        education: t.education,
        projects: t.projects,
        skills: t.skills,
        custom: t.custom,
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
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

    const toggleVisibility = (id: string) => {
        updateSettings({
            sectionVisibility: {
                ...sectionVisibility,
                [id]: !sectionVisibility[id]
            }
        });
    };

    const updateSectionTitle = (sectionId: string, value: string) => {
        const labelKey = SECTION_LABEL_KEYS[sectionId];
        if (labelKey) {
            setResumeData({
                ...resumeData,
                settings: {
                    ...resumeData.settings,
                    fieldLabels: {
                        ...fieldLabels,
                        [labelKey]: value
                    }
                }
            });
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b bg-background/50 backdrop-blur z-10">
                <h2 className="font-semibold">Editor</h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 sm:p-6 space-y-6 pb-20">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sectionOrder}
                            strategy={verticalListSortingStrategy}
                        >
                            {sectionOrder.map((sectionId) => {
                                const Component = SECTION_COMPONENTS[sectionId];
                                const title = SECTION_TITLES[sectionId] || sectionId;
                                const labelKey = SECTION_LABEL_KEYS[sectionId] as keyof typeof fieldLabels;
                                const customTitle = fieldLabels[labelKey] as string | undefined;
                                const isVisible = sectionVisibility[sectionId] ?? true;

                                return (
                                    <SectionWrapper
                                        key={sectionId}
                                        id={sectionId}
                                        title={title}
                                        customTitle={customTitle}
                                        onTitleChange={(value) => updateSectionTitle(sectionId, value)}
                                        isVisible={isVisible}
                                        onToggleVisibility={() => toggleVisibility(sectionId)}
                                    >
                                        <Component />
                                    </SectionWrapper>
                                );
                            })}
                        </SortableContext>
                    </DndContext>
                </div>
            </ScrollArea>
        </div>
    );
};
