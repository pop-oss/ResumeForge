import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';

export interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  editMode?: boolean;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  value,
  onChange,
  multiline = false,
  placeholder = '',
  className = '',
  disabled = false,
  editMode = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync editValue when value prop changes (external updates)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = useCallback(() => {
    if (!disabled && editMode && !isEditing) {
      setIsEditing(true);
      setEditValue(value);
    }
  }, [disabled, editMode, isEditing, value]);

  const handleConfirm = useCallback(() => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  }, [editValue, value, onChange]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(value);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleConfirm();
    }
  }, [handleCancel, handleConfirm, multiline]);

  const handleBlur = useCallback(() => {
    handleConfirm();
  }, [handleConfirm]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  }, []);

  if (isEditing) {
    const commonProps = {
      ref: inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>,
      value: editValue,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      placeholder,
      className: cn(
        'w-full bg-white/90 border border-blue-400 rounded px-1 py-0.5',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      ),
    };

    if (multiline) {
      return (
        <textarea
          {...commonProps}
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={3}
        />
      );
    }

    return (
      <input
        {...commonProps}
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={cn(
        className,
        editMode && !disabled && 'cursor-text hover:bg-blue-50/50 rounded transition-colors',
        editMode && !disabled && 'ring-1 ring-transparent hover:ring-blue-200',
        !value && placeholder && 'text-gray-400 italic'
      )}
      role={editMode && !disabled ? 'button' : undefined}
      tabIndex={editMode && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (editMode && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {value || placeholder}
    </span>
  );
};

export default InlineEditor;
