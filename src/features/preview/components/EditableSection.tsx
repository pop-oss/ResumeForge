import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useResume } from '../../resume/ResumeContext';
import type { FieldOrderConfig } from '../../resume/types';
import { DEFAULT_FIELD_ORDER } from '../../resume/data';

type SectionId = keyof FieldOrderConfig;

export interface EditableSectionProps {
  sectionId: SectionId;
  children: (props: {
    fieldOrder: string[];
    fieldVisibility: Record<string, boolean>;
    editMode: boolean;
  }) => React.ReactNode;
  className?: string;
}

/**
 * EditableSection - 可编辑区域包装组件
 * 封装字段拖拽排序逻辑和字段可见性控制
 * 
 * Feature: template-field-editing
 * Validates: Requirements 2.1, 2.3, 2.4
 */
export const EditableSection: React.FC<EditableSectionProps> = ({
  sectionId,
  children,
  className,
}) => {
  const { resumeData, updateFieldOrder } = useResume();
  const settings = resumeData.settings;
  const editMode = settings.editMode ?? false;
  const fieldOrder = settings.fieldOrder ?? {} as FieldOrderConfig;
  const fieldVisibility = settings.fieldVisibility ?? {} as Record<SectionId, Record<string, boolean>>;

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

  const currentFieldOrder = fieldOrder[sectionId] || DEFAULT_FIELD_ORDER[sectionId] || [];
  const currentFieldVisibility = fieldVisibility[sectionId] || {};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = currentFieldOrder.indexOf(active.id as string);
      const newIndex = currentFieldOrder.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(currentFieldOrder, oldIndex, newIndex);
        updateFieldOrder(sectionId, newOrder);
      }
    }
  };

  // When not in edit mode, just render children without DnD context
  if (!editMode) {
    return (
      <div className={className}>
        {children({
          fieldOrder: currentFieldOrder,
          fieldVisibility: currentFieldVisibility,
          editMode: false,
        })}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={currentFieldOrder}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {children({
            fieldOrder: currentFieldOrder,
            fieldVisibility: currentFieldVisibility,
            editMode: true,
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

EditableSection.displayName = 'EditableSection';
