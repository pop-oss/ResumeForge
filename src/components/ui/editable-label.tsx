import React, { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Label } from './label';
import { cn } from '../../lib/utils';

interface EditableLabelProps {
    htmlFor?: string;
    value: string;
    defaultValue: string;
    onChange: (value: string) => void;
    className?: string;
    labelClassName?: string;
}

export const EditableLabel: React.FC<EditableLabelProps> = ({
    htmlFor,
    value,
    defaultValue,
    onChange,
    className,
    labelClassName
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value || defaultValue);

    const handleSave = () => {
        onChange(tempValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setTempValue(value || defaultValue);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    autoFocus
                    className="text-sm font-medium h-5 px-1 border rounded min-w-[60px] max-w-[120px]"
                />
                <button onClick={handleSave} className="text-green-600 hover:text-green-700">
                    <Check className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-1 group", className)}>
            <Label htmlFor={htmlFor} className={labelClassName}>{value || defaultValue}</Label>
            <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
            >
                <Pencil className="w-3 h-3" />
            </button>
        </div>
    );
};

// 用于 Section 标题的可编辑组件
interface EditableSectionTitleProps {
    value: string;
    defaultValue: string;
    onChange: (value: string) => void;
    className?: string;
}

export const EditableSectionTitle: React.FC<EditableSectionTitleProps> = ({
    value,
    defaultValue,
    onChange,
    className
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value || defaultValue);

    const handleSave = () => {
        onChange(tempValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setTempValue(value || defaultValue);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    autoFocus
                    className="font-semibold text-sm h-6 px-1 border rounded min-w-[80px] max-w-[150px]"
                />
                <button onClick={handleSave} className="text-green-600 hover:text-green-700">
                    <Check className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className={cn(
                "font-semibold text-sm flex items-center gap-2 hover:underline focus:outline-none group",
                className
            )}
        >
            {value || defaultValue}
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 text-gray-400" />
        </button>
    );
};
