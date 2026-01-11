import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../../lib/utils";
import { GripVertical } from "lucide-react";

export interface DraggableFieldProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  editMode?: boolean;
}

export const DraggableField: React.FC<DraggableFieldProps> = ({
  id,
  children,
  disabled = false,
  className = "",
  editMode = true,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: disabled || !editMode,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!editMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-start gap-1",
        isDragging && "z-50",
        className
      )}
    >
      {!disabled && (
        <button
          type="button"
          className={cn(
            "flex-shrink-0 cursor-grab p-0.5 rounded opacity-0 group-hover:opacity-100",
            "hover:bg-gray-100 transition-opacity",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            isDragging && "cursor-grabbing opacity-100"
          )}
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${id}`}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default DraggableField;
