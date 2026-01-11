import * as React from "react";
import { cn } from "../../lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface FieldVisibilityToggleProps {
  fieldId: string;
  sectionId: string;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * FieldVisibilityToggle - 字段可见性切换按钮组件
 * 
 * Feature: template-field-editing
 * Validates: Requirements 7.1, 7.2
 */
const FieldVisibilityToggle: React.FC<FieldVisibilityToggleProps> = ({
  fieldId,
  sectionId,
  visible,
  onToggle,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "flex-shrink-0 p-1 rounded transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-400",
        visible
          ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          : "text-red-400 hover:text-red-600 hover:bg-red-50",
        disabled && "cursor-not-allowed opacity-30",
        className
      )}
      title={visible ? `隐藏 ${fieldId}` : `显示 ${fieldId}`}
      aria-label={visible ? `隐藏 ${fieldId}` : `显示 ${fieldId}`}
      data-section={sectionId}
      data-field={fieldId}
    >
      {visible ? (
        <Eye className="w-4 h-4" />
      ) : (
        <EyeOff className="w-4 h-4" />
      )}
    </button>
  );
};

FieldVisibilityToggle.displayName = "FieldVisibilityToggle";

export { FieldVisibilityToggle };
