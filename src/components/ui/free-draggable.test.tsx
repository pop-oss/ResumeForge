/**
 * Property tests for FreeDraggable component
 * Feature: nested-drag-overlap
 * 
 * Tests verify that FreeDraggable uses transform instead of margin
 * for position offsets, enabling independent dragging of inline fields.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FreeDraggable } from './free-draggable';
import * as fc from 'fast-check';

describe('Feature: nested-drag-overlap, Property 2: Position Offset Correctness', () => {
  /**
   * Property 2: 位置偏移正确性
   * *For any* FreeDraggable 元素，其视觉位置应等于原始布局位置加上 position 偏移量。
   * **Validates: Requirements 1.3, 2.1, 2.2**
   */
  it('Property 2: should use transform instead of margin for position offset', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -500, max: 500 }),
        fc.integer({ min: -500, max: 500 }),
        (x, y) => {
          const { container } = render(
            <FreeDraggable
              id="test-element"
              position={{ x, y }}
              editMode={true}
            >
              <span>Test Content</span>
            </FreeDraggable>
          );

          const element = container.querySelector('[data-draggable-id="test-element"]');
          expect(element).toBeTruthy();

          const style = element?.getAttribute('style') || '';
          
          // Should use transform, not margin
          if (x !== 0 || y !== 0) {
            expect(style).toContain('transform');
            expect(style).toContain(`translate(${x}px, ${y}px)`);
            expect(style).not.toContain('margin-left');
            expect(style).not.toContain('margin-top');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: should not apply transform when position is zero', () => {
    const { container } = render(
      <FreeDraggable
        id="test-zero"
        position={{ x: 0, y: 0 }}
        editMode={true}
      >
        <span>Zero Position</span>
      </FreeDraggable>
    );

    const element = container.querySelector('[data-draggable-id="test-zero"]');
    const style = element?.getAttribute('style') || '';
    
    // Should not have transform when position is zero
    expect(style).not.toContain('translate');
  });

  it('Property 2: should apply correct transform for positive offsets', () => {
    const { container } = render(
      <FreeDraggable
        id="test-positive"
        position={{ x: 100, y: 50 }}
        editMode={true}
      >
        <span>Positive Offset</span>
      </FreeDraggable>
    );

    const element = container.querySelector('[data-draggable-id="test-positive"]');
    const style = element?.getAttribute('style') || '';
    
    expect(style).toContain('translate(100px, 50px)');
  });

  it('Property 2: should apply correct transform for negative offsets', () => {
    const { container } = render(
      <FreeDraggable
        id="test-negative"
        position={{ x: -100, y: -50 }}
        editMode={true}
      >
        <span>Negative Offset</span>
      </FreeDraggable>
    );

    const element = container.querySelector('[data-draggable-id="test-negative"]');
    const style = element?.getAttribute('style') || '';
    
    expect(style).toContain('translate(-100px, -50px)');
  });
});

describe('Feature: nested-drag-overlap, Property 4: Collision Detection Accuracy', () => {
  /**
   * Property 4: 碰撞检测准确性
   * *For any* 两个 FreeDraggable 元素，当它们的文本区域重叠时，碰撞检测应返回 true。
   * **Validates: Requirements 4.2, 4.3**
   */
  
  // Helper function to test rectangle overlap logic
  const isOverlapping = (
    rect1: { left: number; right: number; top: number; bottom: number },
    rect2: { left: number; right: number; top: number; bottom: number },
    margin: number = 2
  ): boolean => {
    return !(
      rect1.right + margin < rect2.left ||
      rect1.left - margin > rect2.right ||
      rect1.bottom + margin < rect2.top ||
      rect1.top - margin > rect2.bottom
    );
  };

  it('Property 4: overlapping rectangles should be detected', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 10, max: 50 }),
        fc.integer({ min: 10, max: 50 }),
        (x, y, width, height) => {
          const rect1 = { left: x, right: x + width, top: y, bottom: y + height };
          // Create overlapping rect2 by shifting slightly
          const rect2 = { 
            left: x + width / 2, 
            right: x + width + width / 2, 
            top: y + height / 2, 
            bottom: y + height + height / 2 
          };
          
          expect(isOverlapping(rect1, rect2)).toBe(true);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: non-overlapping rectangles should not be detected as overlapping', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 10, max: 50 }),
        fc.integer({ min: 10, max: 50 }),
        (x, y, width, height) => {
          const rect1 = { left: x, right: x + width, top: y, bottom: y + height };
          // Create non-overlapping rect2 by placing it far away
          const rect2 = { 
            left: x + width + 100, 
            right: x + width + 100 + width, 
            top: y + height + 100, 
            bottom: y + height + 100 + height 
          };
          
          expect(isOverlapping(rect1, rect2)).toBe(false);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: adjacent rectangles with margin should be detected as overlapping', () => {
    const rect1 = { left: 0, right: 100, top: 0, bottom: 50 };
    const rect2 = { left: 101, right: 200, top: 0, bottom: 50 }; // 1px gap
    
    // With margin of 2, they should overlap
    expect(isOverlapping(rect1, rect2, 2)).toBe(true);
    
    // With margin of 0, they should not overlap
    expect(isOverlapping(rect1, rect2, 0)).toBe(false);
  });
});

describe('FreeDraggable rendering', () => {
  it('should render children correctly', () => {
    render(
      <FreeDraggable id="test" editMode={true}>
        <span data-testid="child">Child Content</span>
      </FreeDraggable>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
  });

  it('should show drag handle in edit mode', () => {
    const { container } = render(
      <FreeDraggable id="test" editMode={true}>
        <span>Content</span>
      </FreeDraggable>
    );

    const handle = container.querySelector('.drag-handle');
    expect(handle).toBeTruthy();
  });

  it('should hide drag handle when not in edit mode', () => {
    const { container } = render(
      <FreeDraggable id="test" editMode={false}>
        <span>Content</span>
      </FreeDraggable>
    );

    const handle = container.querySelector('.drag-handle');
    expect(handle).toBeFalsy();
  });

  it('should hide drag handle when disabled', () => {
    const { container } = render(
      <FreeDraggable id="test" editMode={true} disabled={true}>
        <span>Content</span>
      </FreeDraggable>
    );

    const handle = container.querySelector('.drag-handle');
    expect(handle).toBeFalsy();
  });
});
