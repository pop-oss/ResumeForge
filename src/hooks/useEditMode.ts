import { useResume } from '../features/resume/ResumeContext';

/**
 * useEditMode Hook - 管理编辑模式状态
 * 
 * Feature: template-field-editing
 * Validates: Requirements 6.2, 6.5
 */
export interface UseEditModeReturn {
  editMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (mode: boolean) => void;
}

export function useEditMode(): UseEditModeReturn {
  const { resumeData, toggleEditMode, updateSettings } = useResume();
  
  const setEditMode = (mode: boolean) => {
    updateSettings({ editMode: mode });
  };

  return {
    editMode: resumeData.settings.editMode,
    toggleEditMode,
    setEditMode,
  };
}
