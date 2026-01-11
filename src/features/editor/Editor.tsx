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

export const Editor: React.FC = () => {
    const { resumeData, reorderSections, updateSettings } = useResume();
    const { t } = useLanguage();
    const { sectionOrder, sectionVisibility = {} } = resumeData.settings;

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
                                const isVisible = sectionVisibility[sectionId] ?? true;

                                // Basics usually shouldn't be hidden or reordered? 
                                // Prompt says "Modules draggable (At least: Work, Project, Education, Skills, Certs/Custom)".
                                // Maybe restrict Basics from being reordered or keep it at top?
                                // "Left side provide module list/sort panel".
                                // Let's allow everything to be reorderable for maximum flexibility as per "Module drag sort".

                                return (
                                    <SectionWrapper
                                        key={sectionId}
                                        id={sectionId}
                                        title={title}
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
