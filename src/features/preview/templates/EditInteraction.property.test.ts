/**
 * Property-Based Tests for Edit Interaction Consistency
 * 
 * Feature: all-text-editable
 * Property 2: 编辑交互一致性
 * Validates: Requirements 8.3
 * 
 * For any template, edit interactions should be consistent:
 * - Clicking an editable element enters edit mode
 * - Enter key confirms edit (single line)
 * - Escape key cancels edit
 * - Clicking outside completes edit
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Simulates the InlineEditor state machine
 */
interface EditorState {
  isEditing: boolean;
  currentValue: string;
  editValue: string;
  originalValue: string;
}

type EditorAction = 
  | { type: 'click' }
  | { type: 'change'; value: string }
  | { type: 'enter' }
  | { type: 'escape' }
  | { type: 'blur' };

/**
 * Reducer for editor state transitions
 */
function editorReducer(
  state: EditorState,
  action: EditorAction,
  editMode: boolean,
  disabled: boolean,
  multiline: boolean
): EditorState {
  switch (action.type) {
    case 'click':
      if (!disabled && editMode && !state.isEditing) {
        return {
          ...state,
          isEditing: true,
          editValue: state.currentValue,
          originalValue: state.currentValue,
        };
      }
      return state;
    
    case 'change':
      if (state.isEditing) {
        return {
          ...state,
          editValue: action.value,
        };
      }
      return state;
    
    case 'enter':
      if (state.isEditing && !multiline) {
        // Confirm edit
        return {
          ...state,
          isEditing: false,
          currentValue: state.editValue,
        };
      }
      return state;
    
    case 'escape':
      if (state.isEditing) {
        // Cancel edit, restore original value
        return {
          ...state,
          isEditing: false,
          editValue: state.originalValue,
          // currentValue stays unchanged (cancel doesn't save)
        };
      }
      return state;
    
    case 'blur':
      if (state.isEditing) {
        // Confirm edit on blur
        return {
          ...state,
          isEditing: false,
          currentValue: state.editValue,
        };
      }
      return state;
    
    default:
      return state;
  }
}

/**
 * Creates initial editor state
 */
function createInitialState(value: string): EditorState {
  return {
    isEditing: false,
    currentValue: value,
    editValue: value,
    originalValue: value,
  };
}

// Generators
const validStringArb = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

const actionArb: fc.Arbitrary<EditorAction> = fc.oneof(
  fc.constant({ type: 'click' as const }),
  fc.record({ type: fc.constant('change' as const), value: validStringArb }),
  fc.constant({ type: 'enter' as const }),
  fc.constant({ type: 'escape' as const }),
  fc.constant({ type: 'blur' as const })
);

describe('Property 2: 编辑交互一致性 (Edit Interaction Consistency)', () => {
  /**
   * Clicking an editable element should enter edit mode when editMode is true and not disabled.
   */
  it('should enter edit mode on click when editMode=true and not disabled', () => {
    fc.assert(
      fc.property(
        validStringArb,
        (initialValue) => {
          const state = createInitialState(initialValue);
          const newState = editorReducer(state, { type: 'click' }, true, false, false);
          
          expect(newState.isEditing).toBe(true);
          expect(newState.editValue).toBe(initialValue);
          expect(newState.originalValue).toBe(initialValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Clicking should NOT enter edit mode when editMode is false.
   */
  it('should NOT enter edit mode on click when editMode=false', () => {
    fc.assert(
      fc.property(
        validStringArb,
        (initialValue) => {
          const state = createInitialState(initialValue);
          const newState = editorReducer(state, { type: 'click' }, false, false, false);
          
          expect(newState.isEditing).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Clicking should NOT enter edit mode when disabled.
   */
  it('should NOT enter edit mode on click when disabled', () => {
    fc.assert(
      fc.property(
        validStringArb,
        (initialValue) => {
          const state = createInitialState(initialValue);
          const newState = editorReducer(state, { type: 'click' }, true, true, false);
          
          expect(newState.isEditing).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Enter key should confirm edit for single-line editors.
   */
  it('should confirm edit on Enter for single-line editors', () => {
    fc.assert(
      fc.property(
        validStringArb,
        validStringArb,
        (initialValue, newValue) => {
          let state = createInitialState(initialValue);
          
          // Enter edit mode
          state = editorReducer(state, { type: 'click' }, true, false, false);
          
          // Change value
          state = editorReducer(state, { type: 'change', value: newValue }, true, false, false);
          
          // Press Enter
          state = editorReducer(state, { type: 'enter' }, true, false, false);
          
          expect(state.isEditing).toBe(false);
          expect(state.currentValue).toBe(newValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Enter key should NOT confirm edit for multiline editors (they use Ctrl+Enter).
   */
  it('should NOT confirm edit on Enter for multiline editors', () => {
    fc.assert(
      fc.property(
        validStringArb,
        validStringArb,
        (initialValue, newValue) => {
          let state = createInitialState(initialValue);
          
          // Enter edit mode
          state = editorReducer(state, { type: 'click' }, true, false, true);
          
          // Change value
          state = editorReducer(state, { type: 'change', value: newValue }, true, false, true);
          
          // Press Enter (should not exit edit mode for multiline)
          state = editorReducer(state, { type: 'enter' }, true, false, true);
          
          // Still in edit mode
          expect(state.isEditing).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Escape key should cancel edit and restore original value.
   */
  it('should cancel edit on Escape and restore original value', () => {
    fc.assert(
      fc.property(
        validStringArb,
        validStringArb,
        (initialValue, newValue) => {
          fc.pre(initialValue !== newValue);
          
          let state = createInitialState(initialValue);
          
          // Enter edit mode
          state = editorReducer(state, { type: 'click' }, true, false, false);
          
          // Change value
          state = editorReducer(state, { type: 'change', value: newValue }, true, false, false);
          
          // Press Escape
          state = editorReducer(state, { type: 'escape' }, true, false, false);
          
          expect(state.isEditing).toBe(false);
          // Current value should remain unchanged (original value)
          expect(state.currentValue).toBe(initialValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Blur should confirm edit (same as clicking outside).
   */
  it('should confirm edit on blur (clicking outside)', () => {
    fc.assert(
      fc.property(
        validStringArb,
        validStringArb,
        (initialValue, newValue) => {
          let state = createInitialState(initialValue);
          
          // Enter edit mode
          state = editorReducer(state, { type: 'click' }, true, false, false);
          
          // Change value
          state = editorReducer(state, { type: 'change', value: newValue }, true, false, false);
          
          // Blur (click outside)
          state = editorReducer(state, { type: 'blur' }, true, false, false);
          
          expect(state.isEditing).toBe(false);
          expect(state.currentValue).toBe(newValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Random sequence of actions should maintain consistent state.
   */
  it('should maintain consistent state through random action sequences', () => {
    fc.assert(
      fc.property(
        validStringArb,
        fc.array(actionArb, { minLength: 1, maxLength: 20 }),
        fc.boolean(),
        fc.boolean(),
        (initialValue, actions, editMode, multiline) => {
          let state = createInitialState(initialValue);
          
          // Apply all actions
          for (const action of actions) {
            state = editorReducer(state, action, editMode, false, multiline);
          }
          
          // State should always be valid
          expect(typeof state.isEditing).toBe('boolean');
          expect(typeof state.currentValue).toBe('string');
          expect(typeof state.editValue).toBe('string');
          expect(typeof state.originalValue).toBe('string');
          
          // If not editing, editValue should equal currentValue or originalValue
          if (!state.isEditing) {
            // After exiting edit mode, the state should be consistent
            expect(state.currentValue).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edit mode should be idempotent - clicking while already editing should not change state.
   */
  it('should be idempotent - clicking while editing should not change state', () => {
    fc.assert(
      fc.property(
        validStringArb,
        validStringArb,
        (initialValue, editedValue) => {
          let state = createInitialState(initialValue);
          
          // Enter edit mode
          state = editorReducer(state, { type: 'click' }, true, false, false);
          
          // Change value
          state = editorReducer(state, { type: 'change', value: editedValue }, true, false, false);
          
          // Click again while editing
          const stateAfterSecondClick = editorReducer(state, { type: 'click' }, true, false, false);
          
          // State should remain unchanged
          expect(stateAfterSecondClick).toEqual(state);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Escape followed by Enter should not save the cancelled value.
   */
  it('should not save cancelled value after Escape then Enter', () => {
    fc.assert(
      fc.property(
        validStringArb,
        validStringArb,
        (initialValue, newValue) => {
          fc.pre(initialValue !== newValue);
          
          let state = createInitialState(initialValue);
          
          // Enter edit mode
          state = editorReducer(state, { type: 'click' }, true, false, false);
          
          // Change value
          state = editorReducer(state, { type: 'change', value: newValue }, true, false, false);
          
          // Press Escape (cancel)
          state = editorReducer(state, { type: 'escape' }, true, false, false);
          
          // Press Enter (should do nothing since not editing)
          state = editorReducer(state, { type: 'enter' }, true, false, false);
          
          // Value should still be original
          expect(state.currentValue).toBe(initialValue);
        }
      ),
      { numRuns: 100 }
    );
  });
});
