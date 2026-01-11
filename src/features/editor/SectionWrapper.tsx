import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ChevronDown, ChevronUp, GripVertical, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SectionWrapperProps {
    id: string;
    title: string;
    isVisible: boolean;
    onToggleVisibility?: () => void;
    children: React.ReactNode;
    isDraggable?: boolean;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
    id,
    title,
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
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-4 group">
            <Card className="border-l-4 border-l-primary/50 overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                        {isDraggable && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="font-semibold text-sm flex items-center gap-2 hover:underline focus:outline-none"
                        >
                            {title}
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        {onToggleVisibility && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleVisibility}>
                                {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                    </div>
                </div>

                {isOpen && (
                    <div className={cn("p-4 animate-accordion-down", !isVisible && "opacity-50 grayscale")}>
                        {children}
                    </div>
                )}
            </Card>
        </div>
    );
};
