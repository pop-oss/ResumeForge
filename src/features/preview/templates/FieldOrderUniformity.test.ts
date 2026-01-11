/**
 * Property-Based Tests for Field Order Uniformity
 * 
 * Feature: template-field-editing
 * Property 6: Field Order Uniformity
 * Validates: Requirements 4.3, 5.3
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Simulates rendering multiple items with the same field order
 */
function renderItemsWithFieldOrder<T extends { id: string }>(
  items: T[],
  fieldOrder: string[],
  getFieldValue: (item: T, fieldId: string) => string | undefined
): Array<{ itemId: string; renderedFields: string[] }> {
  return items.map(item => ({
    itemId: item.id,
    renderedFields: fieldOrder.filter(fieldId => getFieldValue(item, fieldId) !== undefined),
  }));
}

describe('Property 6: Field Order Uniformity', () => {
  /**
   * For any section with multiple items (experience, education),
   * all items within that section should render their fields in the same order
   * as specified by the section's fieldOrder configuration.
   */
  it('should render all items with the same field order', () => {
    fc.assert(
      fc.property(
        // Generate multiple items with same structure
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }),
            company: fc.string({ minLength: 1, maxLength: 20 }),
            role: fc.string({ minLength: 1, maxLength: 20 }),
            city: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        // Generate field order
        fc.shuffledSubarray(['company', 'role', 'city', 'dateRange', 'highlights'], { minLength: 3, maxLength: 5 }),
        (items, fieldOrder) => {
          const getFieldValue = (item: typeof items[0], fieldId: string) => {
            return (item as Record<string, string>)[fieldId];
          };

          const rendered = renderItemsWithFieldOrder(items, fieldOrder, getFieldValue);

          // All items should have the same field order
          const firstItemFields = rendered[0].renderedFields;
          
          rendered.forEach(item => {
            // Fields that exist in both should be in the same relative order
            const commonFields = item.renderedFields.filter(f => firstItemFields.includes(f));
            const expectedOrder = firstItemFields.filter(f => commonFields.includes(f));
            
            expect(commonFields).toEqual(expectedOrder);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain field order consistency across re-renders', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }),
            school: fc.string({ minLength: 1, maxLength: 20 }),
            degree: fc.string({ minLength: 1, maxLength: 20 }),
            major: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          { minLength: 2, maxLength: 4 }
        ),
        fc.shuffledSubarray(['school', 'degree', 'major', 'dateRange'], { minLength: 2, maxLength: 4 }),
        (items, fieldOrder) => {
          const getFieldValue = (item: typeof items[0], fieldId: string) => {
            return (item as Record<string, string>)[fieldId];
          };

          // Render multiple times
          const render1 = renderItemsWithFieldOrder(items, fieldOrder, getFieldValue);
          const render2 = renderItemsWithFieldOrder(items, fieldOrder, getFieldValue);
          const render3 = renderItemsWithFieldOrder(items, fieldOrder, getFieldValue);

          // All renders should produce identical results
          expect(render1).toEqual(render2);
          expect(render2).toEqual(render3);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should apply same field order to all items regardless of item content', () => {
    fc.assert(
      fc.property(
        // Generate items with varying content
        fc.array(
          fc.record({
            id: fc.uuid(),
            company: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
            role: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
            city: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          }),
          { minLength: 3, maxLength: 6 }
        ),
        fc.constantFrom(
          ['company', 'role', 'city'],
          ['role', 'company', 'city'],
          ['city', 'role', 'company']
        ),
        (items, fieldOrder) => {
          const getFieldValue = (item: typeof items[0], fieldId: string) => {
            return (item as Record<string, string | undefined>)[fieldId];
          };

          const rendered = renderItemsWithFieldOrder(items, fieldOrder, getFieldValue);

          // For each item, the rendered fields should be a subsequence of fieldOrder
          rendered.forEach(item => {
            let lastIndex = -1;
            item.renderedFields.forEach(field => {
              const currentIndex = fieldOrder.indexOf(field);
              expect(currentIndex).toBeGreaterThan(lastIndex);
              lastIndex = currentIndex;
            });
          });
        }
      ),
      { numRuns: 30 }
    );
  });
});
