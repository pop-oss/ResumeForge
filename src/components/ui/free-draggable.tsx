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
  snapX?: number; // 水平吸附网格，默认 8px
  snapY?: number; // 垂直吸附网格，默认 24px（约一行高度）
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
  snapY = 24, // 默认吸附到行高
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState(position);
  const dragRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startMouseRef = useRef({ x: 0, y: 0 });

  // 同步外部位置变化
  useEffect(() => {
    setCurrentPos(position);
  }, [position.x, position.y]);

  // 吸附到网格
  const snapToGridValue = useCallback((value: number, gridSize: number) => {
    if (gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || !editMode) return;
    
    // 只响应拖拽手柄的点击
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
    
    const newX = snapToGridValue(startPosRef.current.x + deltaX, snapX);
    const newY = snapToGridValue(startPosRef.current.y + deltaY, snapY);
    
    setCurrentPos({ x: newX, y: newY });
  }, [isDragging, snapToGridValue, snapX, snapY]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // 只有位置真正改变时才触发回调
    if (currentPos.x !== position.x || currentPos.y !== position.y) {
      onPositionChange?.(id, currentPos);
    }
  }, [isDragging, currentPos, position, id, onPositionChange]);

  // 全局鼠标事件监听
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

  // 非编辑模式，直接渲染
  if (!editMode) {
    return (
      <div 
        className={className}
        style={{
          transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={dragRef}
      className={cn(
        "group relative",
        isDragging && "z-50 opacity-80",
        editMode && "hover:outline hover:outline-1 hover:outline-blue-300 hover:outline-dashed",
        className
      )}
      style={{
        transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 拖拽手柄 */}
      {!disabled && (
        <button
          type="button"
          className={cn(
            "drag-handle absolute -left-5 top-0 p-0.5 rounded cursor-grab",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-blue-100 text-blue-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            isDragging && "cursor-grabbing opacity-100 bg-blue-100"
          )}
          aria-label={`拖拽移动 ${id}`}
        >
          <Move className="h-3 w-3" />
        </button>
      )}
      {children}
    </div>
  );
};

export default FreeDraggable;
