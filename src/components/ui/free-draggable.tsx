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
  /** 容器选择器，用于碰撞检测 */
  containerSelector?: string;
  /** 是否可编辑（用于内联编辑功能，当前未实现） */
  editable?: boolean;
  /** 编辑值（用于内联编辑功能，当前未实现） */
  value?: string;
  /** 值变更回调（用于内联编辑功能，当前未实现） */
  onValueChange?: (value: string) => void;
  /** 编辑器样式类名（用于内联编辑功能，当前未实现） */
  editorClassName?: string;
  /** 是否多行编辑（用于内联编辑功能，当前未实现） */
  multiline?: boolean;
}

/**
 * 获取元素内所有文本节点的边界矩形
 * 只返回有实际文字内容的区域
 */
const getTextBoundingRects = (element: HTMLElement): DOMRect[] => {
  const rects: DOMRect[] = [];
  
  // 获取所有文本节点
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent?.trim();
    if (text && text.length > 0) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const textRects = range.getClientRects();
      for (let i = 0; i < textRects.length; i++) {
        const rect = textRects[i];
        if (rect.width > 0 && rect.height > 0) {
          rects.push(rect);
        }
      }
    }
  }
  
  // 如果没有找到文本节点，检查是否有图片等替换元素
  if (rects.length === 0) {
    const images = element.querySelectorAll('img, svg, canvas');
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        rects.push(rect);
      }
    });
  }
  
  return rects;
};

/**
 * 检测两个矩形是否重叠
 */
const isOverlapping = (rect1: DOMRect, rect2: DOMRect, margin: number = 2): boolean => {
  return !(
    rect1.right + margin < rect2.left ||
    rect1.left - margin > rect2.right ||
    rect1.bottom + margin < rect2.top ||
    rect1.top - margin > rect2.bottom
  );
};

/**
 * 检测两组文本矩形是否有任何重叠
 */
const hasTextOverlap = (rects1: DOMRect[], rects2: DOMRect[], margin: number = 2): boolean => {
  for (const r1 of rects1) {
    for (const r2 of rects2) {
      if (isOverlapping(r1, r2, margin)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * 获取所有其他可拖拽元素的文本区域
 */
const getOtherDraggableTextRects = (currentId: string, containerSelector?: string): { id: string; rects: DOMRect[] }[] => {
  const container = containerSelector 
    ? document.querySelector(containerSelector) 
    : document.getElementById('resume-preview');
  
  if (!container) return [];
  
  const allDraggables = container.querySelectorAll('[data-draggable-id]');
  const results: { id: string; rects: DOMRect[] }[] = [];
  
  allDraggables.forEach((el) => {
    const id = el.getAttribute('data-draggable-id');
    if (id && id !== currentId) {
      const textRects = getTextBoundingRects(el as HTMLElement);
      if (textRects.length > 0) {
        results.push({ id, rects: textRects });
      }
    }
  });
  
  return results;
};


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
  containerSelector,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState(position);
  const [hasCollision, setHasCollision] = useState(false);
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

  /**
   * 检查新位置是否会与其他元素的文本区域重叠
   */
  const checkCollision = useCallback((newPos: { x: number; y: number }): boolean => {
    if (!dragRef.current) return false;
    
    const currentTextRects = getTextBoundingRects(dragRef.current);
    if (currentTextRects.length === 0) return false;
    
    const otherElements = getOtherDraggableTextRects(id, containerSelector);
    if (otherElements.length === 0) return false;
    
    const deltaX = newPos.x - currentPos.x;
    const deltaY = newPos.y - currentPos.y;
    
    const movedTextRects = currentTextRects.map(rect => 
      new DOMRect(
        rect.x + deltaX,
        rect.y + deltaY,
        rect.width,
        rect.height
      )
    );
    
    return otherElements.some(other => hasTextOverlap(movedTextRects, other.rects));
  }, [id, containerSelector, currentPos]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || !editMode) return;
    if (!(e.target as HTMLElement).closest('.drag-handle')) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setHasCollision(false);
    startPosRef.current = { ...currentPos };
    startMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [disabled, editMode, currentPos]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startMouseRef.current.x;
    const deltaY = e.clientY - startMouseRef.current.y;

    const newX = snapToGrid(startPosRef.current.x + deltaX, snapX);
    const newY = snapToGrid(startPosRef.current.y + deltaY, snapY);
    const newPos = { x: newX, y: newY };

    setCurrentPos(newPos);
    setHasCollision(checkCollision(newPos));
  }, [isDragging, snapToGrid, snapX, snapY, checkCollision]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // 如果有碰撞，回到原来的位置
    if (hasCollision) {
      setCurrentPos(startPosRef.current);
      setHasCollision(false);
      return;
    }
    
    setHasCollision(false);

    if (currentPos.x !== position.x || currentPos.y !== position.y) {
      onPositionChange?.(id, currentPos);
    }
  }, [isDragging, hasCollision, currentPos, position, id, onPositionChange]);

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

  // 使用 transform 而非 margin，避免影响 flex 布局中的其他元素
  const offsetStyle: React.CSSProperties = hasOffset ? {
    transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
  } : {};

  // 编辑和非编辑模式使用相同的 div 结构，保证布局一致
  return (
    <div
      ref={dragRef}
      data-draggable-id={id}
      className={cn(
        "group relative",
        isDragging && "z-50 opacity-80",
        hasCollision && isDragging && "outline outline-2 outline-red-400 rounded",
        editMode && !hasCollision && "hover:outline hover:outline-1 hover:outline-blue-300 hover:outline-dashed rounded print:outline-none", 
        className
      )}
      style={{
        ...offsetStyle,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 只在编辑模式显示拖拽手柄 */}
      {editMode && !disabled && (
        <button
          type="button"
          className={cn(
            "drag-handle absolute -left-5 top-0 p-0.5 rounded cursor-grab print:hidden",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-blue-100 text-blue-500",
            "focus:outline-none",
            isDragging && "cursor-grabbing opacity-100 bg-blue-100",
            hasCollision && isDragging && "bg-red-100 text-red-500"
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
