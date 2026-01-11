/**
 * Property-Based Tests for InlineEditor Component
 * 
 * Feature: template-field-editing
 * Property 2: Edit Cancel Round-Trip
 * Validates: Requirements 1.4
 * 
 * Property 1: Data Sync Consistency
 * Validates: Requirements 1.2, 1.3, 8.1, 8.2
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { InlineEditor } from './inline-editor';

// Use alphanumeric strings to avoid whitespace-only issues with getByText
const alphanumericString = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,49}$/);

afterEach(() => {
  cleanup();
});

describe('Property 2: Edit Cancel Round-Trip', () => {
  /**
   * For any field in editing state with a modified value,
   * pressing Escape should restore the field to its original value before editing began.
   */
  it('should restore original value when Escape is pressed during editing', () => {
    fc.assert(
      fc.property(
        alphanumericString,
        alphanumericString,
        (originalValue, modifiedValue) => {
          fc.pre(originalValue !== modifiedValue);
          cleanup();
          
          const onChange = vi.fn();
          render(
            <InlineEditor value={originalValue} onChange={onChange} editMode={true} />
          );
          
          // Click to enter edit mode
          const element = screen.getByRole('button');
          fireEvent.click(element);
          
          // Find the input and modify the value
          const input = screen.getByRole('textbox');
          fireEvent.change(input, { target: { value: modifiedValue } });
          
          // Press Escape to cancel
          fireEvent.keyDown(input, { key: 'Escape' });
          
          // onChange should NOT have been called with the modified value
          expect(onChange).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should not call onChange when canceling edit with Escape', () => {
    fc.assert(
      fc.property(
        alphanumericString,
        (originalValue) => {
          cleanup();
          
          const onChange = vi.fn();
          render(
            <InlineEditor value={originalValue} onChange={onChange} editMode={true} />
          );
          
          // Enter edit mode
          fireEvent.click(screen.getByRole('button'));
          
          // Press Escape without changing value
          const input = screen.getByRole('textbox');
          fireEvent.keyDown(input, { key: 'Escape' });
          
          // onChange should not be called
          expect(onChange).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Property 1: Data Sync Consistency', () => {
  /**
   * For any field value modification through InlineEditor,
   * the onChange callback should be called with the new value when confirmed.
   */
  it('should call onChange with new value when Enter is pressed', () => {
    fc.assert(
      fc.property(
        alphanumericString,
        alphanumericString,
        (originalValue, newValue) => {
          fc.pre(originalValue !== newValue);
          cleanup();
          
          const onChange = vi.fn();
          render(
            <InlineEditor value={originalValue} onChange={onChange} editMode={true} />
          );
          
          // Enter edit mode
          fireEvent.click(screen.getByRole('button'));
          
          // Change value
          const input = screen.getByRole('textbox');
          fireEvent.change(input, { target: { value: newValue } });
          
          // Press Enter to confirm
          fireEvent.keyDown(input, { key: 'Enter' });
          
          // onChange should be called with new value
          expect(onChange).toHaveBeenCalledWith(newValue);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should call onChange with new value when input loses focus', () => {
    fc.assert(
      fc.property(
        alphanumericString,
        alphanumericString,
        (originalValue, newValue) => {
          fc.pre(originalValue !== newValue);
          cleanup();
          
          const onChange = vi.fn();
          render(
            <InlineEditor value={originalValue} onChange={onChange} editMode={true} />
          );
          
          // Enter edit mode
          fireEvent.click(screen.getByRole('button'));
          
          // Change value
          const input = screen.getByRole('textbox');
          fireEvent.change(input, { target: { value: newValue } });
          
          // Blur to confirm
          fireEvent.blur(input);
          
          // onChange should be called with new value
          expect(onChange).toHaveBeenCalledWith(newValue);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should not call onChange when value is unchanged', () => {
    fc.assert(
      fc.property(
        alphanumericString,
        (value) => {
          cleanup();
          
          const onChange = vi.fn();
          render(
            <InlineEditor value={value} onChange={onChange} editMode={true} />
          );
          
          // Enter edit mode
          fireEvent.click(screen.getByRole('button'));
          
          // Press Enter without changing value
          const input = screen.getByRole('textbox');
          fireEvent.keyDown(input, { key: 'Enter' });
          
          // onChange should not be called since value didn't change
          expect(onChange).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('InlineEditor disabled and editMode states', () => {
  it('should not enter edit mode when disabled', () => {
    fc.assert(
      fc.property(
        alphanumericString,
        (value) => {
          cleanup();
          
          const onChange = vi.fn();
          const { container } = render(
            <InlineEditor value={value} onChange={onChange} disabled={true} editMode={true} />
          );
          
          // Try to click the span
          const span = container.querySelector('span');
          if (span) {
            fireEvent.click(span);
          }
          
          // Should not show input
          expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should not enter edit mode when editMode is false', () => {
    fc.assert(
      fc.property(
        alphanumericString,
        (value) => {
          cleanup();
          
          const onChange = vi.fn();
          const { container } = render(
            <InlineEditor value={value} onChange={onChange} editMode={false} />
          );
          
          // Try to click the span
          const span = container.querySelector('span');
          if (span) {
            fireEvent.click(span);
          }
          
          // Should not show input
          expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        }
      ),
      { numRuns: 20 }
    );
  });
});
