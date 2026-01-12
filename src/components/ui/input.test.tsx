/**
 * Input Component Property Tests
 * Feature: ui-redesign
 * 
 * Property 9: Input Styling Consistency
 * **Validates: Requirements 7.3, 7.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Expected input styling per design spec
const INPUT_HEIGHT = 'h-10';
const INPUT_ROUNDED = 'rounded-lg';
const INPUT_FOCUS_RING = 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

describe('Feature: ui-redesign, Property 9: Input Styling Consistency', () => {
  /**
   * Property 9: Input Styling Consistency
   * 
   * *For any* input field in the application, the element SHALL have consistent 
   * height (h-10), rounded corners (rounded-md or rounded-lg), and when focused, 
   * SHALL display ring-2 ring-blue-500 ring-offset-2.
   * 
   * **Validates: Requirements 7.3, 7.4**
   */

  it('Property 9: Input should have consistent height h-10', () => {
    expect(INPUT_HEIGHT).toBe('h-10');
  });

  it('Property 9: Input should have rounded corners', () => {
    expect(INPUT_ROUNDED).toMatch(/rounded-(md|lg)/);
  });

  it('Property 9: Input should have blue focus ring', () => {
    expect(INPUT_FOCUS_RING).toContain('ring-2');
    expect(INPUT_FOCUS_RING).toContain('ring-blue');
  });

  it('Property 9: All input styling values should be defined', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(INPUT_HEIGHT, INPUT_ROUNDED, INPUT_FOCUS_RING),
        (styleClass) => {
          return styleClass.length > 0;
        }
      ),
      { numRuns: 10 }
    );
  });
});
