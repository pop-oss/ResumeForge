import * as React from "react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn } from "../../lib/utils";
import { Move } from "lucide-react";

export interface DragItemPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface FreeDragContainerProps {
  children: React.ReactNode;
  positions: Record<string, DragItemPosition>;
  onPositionChange: (id: string, position: DragItemPosition) => void;
  editMode?: boolean;
  className?: string;
  snapX?: number;
  snapY?: number;
}

interface FreeDragItemProps {
  id: string;
  children: React.ReactNode;
  position: DragItemPosition;
  onPositionChange: (id: string, position: DragItemPosition) => void;
  editMode?: boolean;
  snapX?: number;
  snapY?: number;
  onMeasure?: (id: string, rect: { width: number; height: number }) => void;
}

// 单个可拖拽元素
const FreeDragItem: React.FC<FreeDragItemProps> = ({
  id,
  children,
  position,
  onPositionChange,
  editMode = true,
  snapX = 8,
  snapY = 24,
  onMeasure,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState(position);
  const itemRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentPos(position);
  }, [position.x, position.y]);

  // 测量元素尺寸
  useEffect(() => {
    if (itemRef.current && onMeasure) {
      const rect = itemRef.current.getBoundingClientRect();
      onMeasure(id, { width: rect.width, height: rect.height });
    }
  }, [id, onMeasure, children]);

  const snapToGrid = useCallback((value: number, gridSize: number) => {
    if (gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editMode) return;
    if (!(e.target as HTMLElement).closest('.drag-handle')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    startPosRef.current = { ...currentPos };
    startMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [editMode, currentPos]);

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
      onPositionChange(id, currentPos);
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

  return (
    <div
      ref={itemRef}
      className={cn(
        "absolute group",
        isDragging && "z-50 opacity-80",
        editMode && "hover:outline hover:outline-1 hover:outline-blue-300 hover:outline-dashed rounded"
      )}
      style={{
        left: currentPos.x,
        top: currentPos.y,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      {editMode && (
        <button
          type="button"
          className={cn(
            "drag-handle absolute -left-5 top-0 p-0.5 rounded cursor-grab",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-blue-100 text-blue-500",
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

// 容器组件 - 自动计算高度
export const FreeDragContainer: React.FC<FreeDragContainerProps> = ({
  children,
  positions,
  onPositionChange,
  editMode = true,
  className,
  snapX = 8,
  snapY = 24,
}) => {
  const [itemSizes, setItemSizes] = useState<Record<string, { width: number; height: number }>>({});

  const handleMeasure = useCallback((id: string, rect: { width: number; height: number }) => {
    setItemSizes(prev => ({ ...prev, [id]: rect }));
  }, []);

  // 计算容器需要的最小高度
  const containerHeight = useMemo(() => {
    let maxBottom = 0;
    Object.entries(positions).forEach(([id, pos]) => {
      const size = itemSizes[id] || { height: 24 };
      const bottom = pos.y + size.height;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    return Math.max(maxBottom + 8, 50); // 最小高度 50px
  }, [positions, itemSizes]);

  // 将 children 转换为可拖拽元素
  const items = React.Children.toArray(children).filter(React.isValidElement);

  return (
    <div 
      className={cn("relative", className)}
      style={{ minHeight: containerHeight }}
    >
      {items.map((child, index) => {
        if (!React.isValidElement(child)) return null;
        
        const id = (child.props as any)['data-drag-id'] || `item-${index}`;
        const pos = positions[id] || { x: 0, y: index * 28 }; // 默认垂直排列
        
        return (
          <FreeDragItem
            key={id}
            id={id}
            position={pos}
            onPositionChange={onPositionChange}
            editMode={editMode}
            snapX={snapX}
            snapY={snapY}
            onMeasure={handleMeasure}
          >
            {child}
          </FreeDragItem>
        );
      })}
    </div>
  );
};

export default FreeDragContainer;
