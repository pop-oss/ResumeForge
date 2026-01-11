import React from 'react';
import { DraggableField } from '../../../components/ui/draggable-field';
import { InlineEditor } from '../../../components/ui/inline-editor';
import { FieldVisibilityToggle } from '../../../components/ui/field-visibility-toggle';
import { useResume } from '../../resume/ResumeContext';
import type { FieldOrderConfig } from '../../resume/types';
import { cn } from '../../../lib/utils';

type SectionId = keyof FieldOrderConfig;

export interface EditableFieldProps {
  fieldId: string;
  sectionId: SectionId;
  value: string;
  onChange: (value: string) => void;
  visible?: boolean;
  editMode?: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  renderContent?: (value: string) => React.ReactNode;
}

/**
 * EditableField - 可编辑字段渲染器
 * 组合 InlineEditor、DraggableField、FieldVisibilityToggle
 * 
 * Feature: template-field-editing
 * Validates: Requirements 1.1, 2.1, 7.1
 */
export const EditableField: React.FC<EditableFieldProps> = ({
  fieldId,
  sectionId,
  value,
  onChange,
  visible = true,
  editMode = false,
  multiline = false,
  placeholder,
  className,
  renderContent,
}) => {
  const { updateFieldVisibility } = useResume();

  const handleVisibilityToggle = () => {
    updateFieldVisibility(sectionId, fieldId, !visible);
  };

  // If not visible and not in edit mode, don't render
  if (!visible && !editMode) {
    return null;
  }

  // In edit mode but hidden - show with reduced opacity
  const isHiddenInEditMode = !visible && editMode;

  const content = editMode ? (
    <InlineEditor
      value={value}
      onChange={onChange}
      multiline={multiline}
      placeholder={placeholder}
      className={className}
      editMode={editMode}
    />
  ) : renderContent ? (
    renderContent(value)
  ) : (
    <span className={className}>{value}</span>
  );

  // When not in edit mode, just render content
  if (!editMode) {
    return <>{content}</>;
  }

  return (
    <div
      className={cn(
        'group/field relative',
        isHiddenInEditMode && 'opacity-40'
      )}
    >
      <DraggableField
        id={fieldId}
        editMode={editMode}
        className="flex items-center gap-1"
      >
        <div className="flex-1 min-w-0">{content}</div>
        
        {/* Visibility Toggle */}
        <FieldVisibilityToggle
          fieldId={fieldId}
          sectionId={sectionId}
          visible={visible}
          onToggle={handleVisibilityToggle}
          className="opacity-0 group-hover/field:opacity-100 transition-opacity"
        />
      </DraggableField>
    </div>
  );
};

EditableField.displayName = 'EditableField';
