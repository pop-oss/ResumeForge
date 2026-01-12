import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ChevronDown, ChevronUp, GripVertical, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditableSectionTitle } from '../../components/ui/editable-label';

interface SectionWrapperProps {
    id: string;
    title: string;
    customTitle?: string;
    onTitleChange?: (value: string) => void;
    isVisible: boolean;
    onToggleVisibility?: () => void;
    children: React.ReactNode;
    isDraggable?: boolean;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
    id,
    title,
    customTitle,
    onTitleChange,
    isVisible,
    onToggleVisibility,
    children,
    isDraggable = true,
}) => {
    const [isOpen, setIsOpen] = useState(true);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="group">
            <Card 
                className={cn(
                    // Base styles - rounded-xl card
                    "bg-white rounded-xl border border-gray-100",
                    // Transition for hover effects
                    "transition-all duration-200",
                    // Hover shadow effect
                    "hover:shadow-md hover:border-gray-200",
                    // Dragging state - lift effect with increased shadow
                    isDragging && "shadow-xl ring-2 ring-blue-500/20 scale-[1.02] rotate-1 opacity-90"
                )}
            >
                {/* Section header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        {/* Drag handle with optimized styling */}
                        {isDraggable && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className={cn(
                                    "h-7 w-7 p-1 rounded",
                                    "hover:bg-gray-100",
                                    "cursor-grab active:cursor-grabbing",
                                    "transition-colors duration-150"
                                )}
                                {...attributes} 
                                {...listeners}
                            >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                            </Button>
                        )}
                        {/* Section title - editable or static */}
                        {onTitleChange ? (
                            <EditableSectionTitle
                                value={customTitle || ''}
                                defaultValue={title}
                                onChange={onTitleChange}
                            />
                        ) : (
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="font-semibold text-sm font-heading flex items-center gap-2 hover:text-blue-600 focus:outline-none transition-colors duration-200 cursor-pointer"
                            >
                                {title}
                            </button>
                        )}
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                        {onToggleVisibility && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 cursor-pointer transition-colors duration-200" 
                                onClick={onToggleVisibility}
                            >
                                {isVisible ? (
                                    <Eye className="w-4 h-4 text-gray-600" />
                                ) : (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                            </Button>
                        )}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 cursor-pointer transition-colors duration-200" 
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Section content with gap-2 for form fields */}
                {isOpen && (
                    <div className={cn(
                        "p-4 space-y-2 animate-accordion-down",
                        !isVisible && "opacity-50 grayscale"
                    )}>
                        {children}
                    </div>
                )}
            </Card>
        </div>
    );
};
