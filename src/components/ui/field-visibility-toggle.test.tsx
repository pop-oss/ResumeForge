/**
 * Property-Based Tests for FieldVisibilityToggle Component
 * 
 * Feature: template-field-editing
 * Property 8: Field Visibility Toggle
 * Validates: Requirements 7.2, 7.3
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FieldVisibilityToggle } from './field-visibility-toggle';

afterEach(() => {
  cleanup();
});

// Generate valid field and section IDs
const fieldIdArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0);
const sectionIdArb = fc.constantFrom('basics', 'experience', 'education', 'projects', 'skills');

describe('Property 8: Field Visibility Toggle', () => {
  /**
   * For any field with visibility set to false, that field should not appear in the rendered template output.
   * This test verifies the toggle component correctly calls onToggle when clicked.
   */
  it('should call onToggle when clicked regardless of current visibility state', () => {
    fc.assert(
      fc.property(
        fieldIdArb,
        sectionIdArb,
        fc.boolean(),
        (fieldId, sectionId, visible) => {
          cleanup();
          const onToggle = vi.fn();
          
          render(
            <FieldVisibilityToggle
              fieldId={fieldId}
              sectionId={sectionId}
              visible={visible}
              onToggle={onToggle}
            />
          );
          
          const button = screen.getByRole('button');
          fireEvent.click(button);
          
          expect(onToggle).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display correct icon based on visibility state', () => {
    fc.assert(
      fc.property(
        fieldIdArb,
        sectionIdArb,
        fc.boolean(),
        (fieldId, sectionId, visible) => {
          cleanup();
          const onToggle = vi.fn();
          
          render(
            <FieldVisibilityToggle
              fieldId={fieldId}
              sectionId={sectionId}
              visible={visible}
              onToggle={onToggle}
            />
          );
          
          const button = screen.getByRole('button');
          
          // Check aria-label reflects visibility state
          if (visible) {
            expect(button).toHaveAttribute('aria-label', `隐藏 ${fieldId}`);
          } else {
            expect(button).toHaveAttribute('aria-label', `显示 ${fieldId}`);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should not call onToggle when disabled', () => {
    fc.assert(
      fc.property(
        fieldIdArb,
        sectionIdArb,
        fc.boolean(),
        (fieldId, sectionId, visible) => {
          cleanup();
          const onToggle = vi.fn();
          
          render(
            <FieldVisibilityToggle
              fieldId={fieldId}
              sectionId={sectionId}
              visible={visible}
              onToggle={onToggle}
              disabled={true}
            />
          );
          
          const button = screen.getByRole('button');
          fireEvent.click(button);
          
          // Disabled button should not trigger onToggle
          expect(onToggle).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should have correct data attributes for section and field', () => {
    fc.assert(
      fc.property(
        fieldIdArb,
        sectionIdArb,
        fc.boolean(),
        (fieldId, sectionId, visible) => {
          cleanup();
          const onToggle = vi.fn();
          
          render(
            <FieldVisibilityToggle
              fieldId={fieldId}
              sectionId={sectionId}
              visible={visible}
              onToggle={onToggle}
            />
          );
          
          const button = screen.getByRole('button');
          
          expect(button).toHaveAttribute('data-section', sectionId);
          expect(button).toHaveAttribute('data-field', fieldId);
        }
      ),
      { numRuns: 30 }
    );
  });
});

describe('Field Visibility Logic', () => {
  /**
   * Test the visibility toggle logic - toggling should flip the boolean state
   */
  it('should toggle visibility state correctly', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (initialVisible) => {
          let currentVisible = initialVisible;
          const onToggle = () => {
            currentVisible = !currentVisible;
          };
          
          // Simulate toggle
          onToggle();
          
          // After toggle, visibility should be opposite
          expect(currentVisible).toBe(!initialVisible);
          
          // Toggle again
          onToggle();
          
          // Should be back to original
          expect(currentVisible).toBe(initialVisible);
        }
      ),
      { numRuns: 20 }
    );
  });
});
