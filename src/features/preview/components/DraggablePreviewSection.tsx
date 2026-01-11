import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface DraggablePreviewSectionProps {
    id: string;
    children: React.ReactNode;
    editMode?: boolean;
    className?: string;
}

/**
 * DraggablePreviewSection - 可拖拽的预览区域 Section
 * 在编辑模式下支持拖拽排序
 */
export const DraggablePreviewSection: React.FC<DraggablePreviewSectionProps> = ({
    id,
    children,
    editMode = false,
    className,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: !editMode });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (!editMode) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'relative group',
                isDragging && 'opacity-50 z-50',
                editMode && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-300 hover:outline-offset-2',
                className
            )}
        >
            {/* 拖拽手柄 */}
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    'absolute -left-6 top-0 p-1 cursor-grab active:cursor-grabbing',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'bg-blue-500 text-white rounded-sm shadow-sm',
                    'print:hidden'
                )}
                title="拖拽调整顺序"
            >
                <GripVertical className="w-4 h-4" />
            </div>
            {children}
        </div>
    );
};

DraggablePreviewSection.displayName = 'DraggablePreviewSection';
