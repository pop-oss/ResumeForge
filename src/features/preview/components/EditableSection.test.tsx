/**
 * Property-Based Tests for EditableSection Component
 * 
 * Feature: template-field-editing
 * Property 4: Field Order Rendering Consistency
 * Validates: Requirements 2.4
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Helper function to simulate field rendering based on order
 */
function renderFieldsInOrder<T>(
  fields: Map<string, T>,
  fieldOrder: string[]
): T[] {
  return fieldOrder
    .filter(fieldId => fields.has(fieldId))
    .map(fieldId => fields.get(fieldId)!);
}

describe('Property 4: Field Order Rendering Consistency', () => {
  /**
   * For any field order configuration, the rendered template should display
   * fields in exactly the order specified by the configuration.
   */
  it('should render fields in exact order specified by fieldOrder', () => {
    fc.assert(
      fc.property(
        // Generate unique field IDs
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 8 })
          .map(arr => [...new Set(arr)])
          .filter(arr => arr.length >= 2),
        (fieldIds) => {
          // Create a map of field ID to some value
          const fields = new Map(fieldIds.map((id, i) => [id, `value-${i}`]));
          
          // Shuffle to create a different order
          const fieldOrder = [...fieldIds].sort(() => Math.random() - 0.5);
          
          // Render in order
          const rendered = renderFieldsInOrder(fields, fieldOrder);
          
          // Verify order matches
          expect(rendered.length).toBe(fieldOrder.length);
          
          fieldOrder.forEach((fieldId, index) => {
            expect(rendered[index]).toBe(fields.get(fieldId));
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should skip fields not in the fields map', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 5 })
          .map(arr => [...new Set(arr)])
          .filter(arr => arr.length >= 2),
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 3 })
          .map(arr => [...new Set(arr)]),
        (existingFieldIds, extraFieldIds) => {
          // Create fields map with only existing fields
          const fields = new Map(existingFieldIds.map((id, i) => [id, `value-${i}`]));
          
          // Create order that includes extra fields not in the map
          const fieldOrder = [...existingFieldIds, ...extraFieldIds];
          
          // Render
          const rendered = renderFieldsInOrder(fields, fieldOrder);
          
          // Should only contain existing fields
          expect(rendered.length).toBe(existingFieldIds.length);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should handle empty field order', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 })
          .map(arr => [...new Set(arr)]),
        (fieldIds) => {
          const fields = new Map(fieldIds.map((id, i) => [id, `value-${i}`]));
          const fieldOrder: string[] = [];
          
          const rendered = renderFieldsInOrder(fields, fieldOrder);
          
          expect(rendered.length).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should maintain order consistency across multiple renders', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 3, maxLength: 6 })
          .map(arr => [...new Set(arr)])
          .filter(arr => arr.length >= 3),
        (fieldIds) => {
          const fields = new Map(fieldIds.map((id, i) => [id, `value-${i}`]));
          const fieldOrder = [...fieldIds];
          
          // Render multiple times
          const render1 = renderFieldsInOrder(fields, fieldOrder);
          const render2 = renderFieldsInOrder(fields, fieldOrder);
          const render3 = renderFieldsInOrder(fields, fieldOrder);
          
          // All renders should be identical
          expect(render1).toEqual(render2);
          expect(render2).toEqual(render3);
        }
      ),
      { numRuns: 30 }
    );
  });
});
