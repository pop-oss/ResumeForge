import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "../../lib/utils";
import { Move } from "lucide-react";

export interface FreeDraggableProps {
  id: string;
  children: React.ReactNode;
  position?: { x: number; y: number };
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  disabled?: boolean;
  editMode?: boolean;
  className?: string;
  snapX?: number;
  snapY?: number;
}

export const FreeDraggable: React.FC<FreeDraggableProps> = ({
  id,
  children,
  position = { x: 0, y: 0 },
  onPositionChange,
  disabled = false,
  editMode = true,
  className = "",
  snapX = 8,
  snapY = 24,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState(position);
  const dragRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentPos(position);
  }, [position.x, position.y]);

  const snapToGrid = useCallback((value: number, gridSize: number) => {
    if (gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || !editMode) return;
    if (!(e.target as HTMLElement).closest('.drag-handle')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    startPosRef.current = { ...currentPos };
    startMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [disabled, editMode, currentPos]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startMouseRef.current.x;
    const deltaY = e.clientY - startMouseRef.current.y;
    
    const newX = snapToGrid(startPosRef.current.x + deltaX, snapX);
    const newY = snapToGrid(startPosRef.current.y + deltaY, snapY);
    
    setCurrentPos({ x: newX, y: newY });
  }, [isDragging, snapToGrid, snapX, snapY]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (currentPos.x !== position.x || currentPos.y !== position.y) {
      onPositionChange?.(id, currentPos);
    }
  }, [isDragging, currentPos, position, id, onPositionChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const hasOffset = currentPos.x !== 0 || currentPos.y !== 0;

  // 使用 margin 来调整位置
  // marginTop 负值会让元素向上移动，同时自动减少元素占用的顶部空间
  // marginTop 正值会让元素向下移动，增加顶部空间
  // 不需要额外调整 marginBottom，CSS 的 margin 机制会自动处理文档流
  const offsetStyle: React.CSSProperties = hasOffset ? {
    marginLeft: currentPos.x,
    marginTop: currentPos.y,
  } : {};

  // 非编辑模式，直接返回子元素（不添加任何包装）
  if (!editMode) {
    // 如果有位置偏移，需要包装一个 span 来应用样式
    if (hasOffset) {
      return (
        <span style={offsetStyle}>
          {children}
        </span>
      );
    }
    // 没有偏移，直接返回子元素
    return <>{children}</>;
  }

  return (
    <div
      ref={dragRef}
      className={cn(
        "group relative",
        isDragging && "z-50 opacity-80",
        editMode && "hover:outline hover:outline-1 hover:outline-blue-300 hover:outline-dashed rounded print:outline-none",
        className
      )}
      style={{
        ...offsetStyle,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      {!disabled && (
        <button
          type="button"
          className={cn(
            "drag-handle absolute -left-5 top-0 p-0.5 rounded cursor-grab print:hidden",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-blue-100 text-blue-500",
            "focus:outline-none",
            isDragging && "cursor-grabbing opacity-100 bg-blue-100"
          )}
        >
          <Move className="h-3 w-3" />
        </button>
      )}
      {children}
    </div>
  );
};

export default FreeDraggable;
