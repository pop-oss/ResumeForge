/**
 * Property-Based Tests for DraggableField Component
 * 
 * Feature: template-field-editing
 * Property 3: Drag Reorder Correctness
 * Validates: Requirements 2.3, 3.2, 4.2, 5.2
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * Helper function to simulate drag reorder operation
 * This tests the core logic of field reordering without DOM manipulation
 */
function reorderFields(fields: string[], fromIndex: number, toIndex: number): string[] {
  return arrayMove(fields, fromIndex, toIndex);
}

describe('Property 3: Drag Reorder Correctness', () => {
  /**
   * For any valid field order array and any drag operation moving field from index A to index B,
   * the resulting field order should correctly reflect the move operation.
   */
  it('should preserve all elements after reorder', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
        fc.nat(),
        fc.nat(),
        (fields, fromSeed, toSeed) => {
          // Ensure unique fields
          const uniqueFields = [...new Set(fields)];
          fc.pre(uniqueFields.length >= 2);
          
          const fromIndex = fromSeed % uniqueFields.length;
          const toIndex = toSeed % uniqueFields.length;
          
          const result = reorderFields(uniqueFields, fromIndex, toIndex);
          
          // All original elements should be present
          expect(result.length).toBe(uniqueFields.length);
          expect(new Set(result)).toEqual(new Set(uniqueFields));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should move element from source to destination correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
        fc.nat(),
        fc.nat(),
        (fields, fromSeed, toSeed) => {
          // Ensure unique fields
          const uniqueFields = [...new Set(fields)];
          fc.pre(uniqueFields.length >= 2);
          
          const fromIndex = fromSeed % uniqueFields.length;
          const toIndex = toSeed % uniqueFields.length;
          const movedElement = uniqueFields[fromIndex];
          
          const result = reorderFields(uniqueFields, fromIndex, toIndex);
          
          // The moved element should be at the destination index
          expect(result[toIndex]).toBe(movedElement);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not change array when moving to same position', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        fc.nat(),
        (fields, indexSeed) => {
          const uniqueFields = [...new Set(fields)];
          fc.pre(uniqueFields.length >= 1);
          
          const index = indexSeed % uniqueFields.length;
          
          const result = reorderFields(uniqueFields, index, index);
          
          // Array should be unchanged
          expect(result).toEqual(uniqueFields);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain relative order of non-moved elements', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 3, maxLength: 10 }),
        fc.nat(),
        fc.nat(),
        (numbers, fromSeed, toSeed) => {
          // Use numbers as unique identifiers
          const uniqueFields = [...new Set(numbers)].map(String);
          fc.pre(uniqueFields.length >= 3);
          
          const fromIndex = fromSeed % uniqueFields.length;
          let toIndex = toSeed % uniqueFields.length;
          
          // Ensure different indices for meaningful test
          fc.pre(fromIndex !== toIndex);
          
          const movedElement = uniqueFields[fromIndex];
          const result = reorderFields(uniqueFields, fromIndex, toIndex);
          
          // Get elements excluding the moved one
          const originalWithoutMoved = uniqueFields.filter(f => f !== movedElement);
          const resultWithoutMoved = result.filter(f => f !== movedElement);
          
          // Relative order of other elements should be preserved
          expect(resultWithoutMoved).toEqual(originalWithoutMoved);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case: move first to last', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 8 }),
        (fields) => {
          const uniqueFields = [...new Set(fields)];
          fc.pre(uniqueFields.length >= 2);
          
          const firstElement = uniqueFields[0];
          const result = reorderFields(uniqueFields, 0, uniqueFields.length - 1);
          
          // First element should now be last
          expect(result[result.length - 1]).toBe(firstElement);
          // All elements preserved
          expect(result.length).toBe(uniqueFields.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle edge case: move last to first', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 8 }),
        (fields) => {
          const uniqueFields = [...new Set(fields)];
          fc.pre(uniqueFields.length >= 2);
          
          const lastElement = uniqueFields[uniqueFields.length - 1];
          const result = reorderFields(uniqueFields, uniqueFields.length - 1, 0);
          
          // Last element should now be first
          expect(result[0]).toBe(lastElement);
          // All elements preserved
          expect(result.length).toBe(uniqueFields.length);
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Drag Reorder with Field Order Config', () => {
  const DEFAULT_BASICS_ORDER = ['name', 'title', 'email', 'phone', 'city', 'website', 'linkedin', 'github'];
  const DEFAULT_EXPERIENCE_ORDER = ['company', 'role', 'city', 'dateRange', 'highlights'];
  const DEFAULT_EDUCATION_ORDER = ['school', 'degree', 'major', 'dateRange', 'highlights'];

  it('should correctly reorder basics fields', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: DEFAULT_BASICS_ORDER.length - 1 }),
        fc.nat({ max: DEFAULT_BASICS_ORDER.length - 1 }),
        (fromIndex, toIndex) => {
          const result = reorderFields([...DEFAULT_BASICS_ORDER], fromIndex, toIndex);
          
          // All fields preserved
          expect(new Set(result)).toEqual(new Set(DEFAULT_BASICS_ORDER));
          // Moved field at correct position
          expect(result[toIndex]).toBe(DEFAULT_BASICS_ORDER[fromIndex]);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should correctly reorder experience fields', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: DEFAULT_EXPERIENCE_ORDER.length - 1 }),
        fc.nat({ max: DEFAULT_EXPERIENCE_ORDER.length - 1 }),
        (fromIndex, toIndex) => {
          const result = reorderFields([...DEFAULT_EXPERIENCE_ORDER], fromIndex, toIndex);
          
          expect(new Set(result)).toEqual(new Set(DEFAULT_EXPERIENCE_ORDER));
          expect(result[toIndex]).toBe(DEFAULT_EXPERIENCE_ORDER[fromIndex]);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should correctly reorder education fields', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: DEFAULT_EDUCATION_ORDER.length - 1 }),
        fc.nat({ max: DEFAULT_EDUCATION_ORDER.length - 1 }),
        (fromIndex, toIndex) => {
          const result = reorderFields([...DEFAULT_EDUCATION_ORDER], fromIndex, toIndex);
          
          expect(new Set(result)).toEqual(new Set(DEFAULT_EDUCATION_ORDER));
          expect(result[toIndex]).toBe(DEFAULT_EDUCATION_ORDER[fromIndex]);
        }
      ),
      { numRuns: 50 }
    );
  });
});
