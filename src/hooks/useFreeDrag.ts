import { useCallback } from 'react';
import { useResume } from '../features/resume/ResumeContext';
import type { ElementPosition } from '../features/resume/types';

/**
 * Hook for managing free-drag element positions
 * Provides helper functions for getting and updating element positions
 */
export function useFreeDrag() {
  const { resumeData, updateElementPosition } = useResume();
  const { elementPositions = {}, editMode } = resumeData.settings;

  // Get position for an element
  const getPosition = useCallback(
    (elementId: string): ElementPosition => {
      return elementPositions[elementId] || { x: 0, y: 0 };
    },
    [elementPositions]
  );

  // Handle position change
  const handlePositionChange = useCallback(
    (elementId: string, position: ElementPosition) => {
      updateElementPosition(elementId, position);
    },
    [updateElementPosition]
  );

  // Reset position for an element
  const resetPosition = useCallback(
    (elementId: string) => {
      updateElementPosition(elementId, { x: 0, y: 0 });
    },
    [updateElementPosition]
  );

  // Reset all positions
  const resetAllPositions = useCallback(() => {
    Object.keys(elementPositions).forEach((id) => {
      updateElementPosition(id, { x: 0, y: 0 });
    });
  }, [elementPositions, updateElementPosition]);

  return {
    editMode: editMode ?? false,
    elementPositions,
    getPosition,
    handlePositionChange,
    resetPosition,
    resetAllPositions,
  };
}

export default useFreeDrag;
