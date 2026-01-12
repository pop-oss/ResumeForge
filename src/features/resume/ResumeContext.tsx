import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ResumeData, SectionOrder, ResumeSettings, ResumeBasics, ElementPosition, FieldOrderConfig } from './types';
import { initialResumeData, DEFAULT_FIELD_ORDER, DEFAULT_FIELD_VISIBILITY } from './data';

type SectionId = keyof FieldOrderConfig;

export interface ResumeContextType {
    resumeData: ResumeData;
    setResumeData: (data: ResumeData) => void;
    updateBasics: (basics: Partial<ResumeBasics>) => void;
    updateSettings: (settings: Partial<ResumeSettings>) => void;
    reorderSections: (order: SectionOrder) => void;
    resetResume: () => void;
    updateElementPosition: (elementId: string, position: ElementPosition) => void;
    toggleEditMode: () => void;
    updateFieldOrder: (sectionId: SectionId, fieldOrder: string[]) => void;
    updateFieldVisibility: (sectionId: SectionId, fieldId: string, visible: boolean) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const STORAGE_KEY = 'resume-builder-data';

// 合并旧数据和默认配置，确保新字段有默认值
const mergeWithDefaults = (data: ResumeData): ResumeData => {
    return {
        ...data,
        settings: {
            ...data.settings,
            fieldOrder: data.settings.fieldOrder || DEFAULT_FIELD_ORDER,
            fieldVisibility: data.settings.fieldVisibility || DEFAULT_FIELD_VISIBILITY,
        },
    };
};

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [resumeData, setResumeState] = useState<ResumeData>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // 合并默认配置，确保旧数据也有新字段
                return mergeWithDefaults(parsed);
            } catch (e) {
                console.error('Failed to parse resume data', e);
            }
        }
        return initialResumeData;
    });

    // Debounced save
    useEffect(() => {
        const handler = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
        }, 500);

        return () => clearTimeout(handler);
    }, [resumeData]);

    const setResumeData = useCallback((data: ResumeData) => {
        setResumeState(data);
    }, []);

    const updateBasics = useCallback((basics: Partial<ResumeBasics>) => {
        setResumeState(prev => ({
            ...prev,
            basics: { ...prev.basics, ...basics },
        }));
    }, []);

    const updateSettings = useCallback((settings: Partial<ResumeSettings>) => {
        setResumeState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...settings },
        }));
    }, []);

    const reorderSections = useCallback((order: SectionOrder) => {
        setResumeState(prev => ({
            ...prev,
            settings: { ...prev.settings, sectionOrder: order },
        }));
    }, []);

    const resetResume = useCallback(() => {
        setResumeState(initialResumeData);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const updateElementPosition = useCallback((elementId: string, position: ElementPosition) => {
        setResumeState(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                elementPositions: {
                    ...prev.settings.elementPositions,
                    [elementId]: position,
                },
            },
        }));
    }, []);

    const toggleEditMode = useCallback(() => {
        setResumeState(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                editMode: !prev.settings.editMode,
            },
        }));
    }, []);

    const updateFieldOrder = useCallback((sectionId: SectionId, fieldOrder: string[]) => {
        setResumeState(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                fieldOrder: {
                    ...prev.settings.fieldOrder,
                    [sectionId]: fieldOrder,
                },
            },
        }));
    }, []);

    const updateFieldVisibility = useCallback((sectionId: SectionId, fieldId: string, visible: boolean) => {
        setResumeState(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                fieldVisibility: {
                    ...prev.settings.fieldVisibility,
                    [sectionId]: {
                        ...(prev.settings.fieldVisibility?.[sectionId] || {}),
                        [fieldId]: visible,
                    },
                },
            },
        }));
    }, []);

    
    return (
        <ResumeContext.Provider
            value={{
                resumeData,
                setResumeData,
                updateBasics,
                updateSettings,
                reorderSections,
                resetResume,
                updateElementPosition,
                toggleEditMode,
                updateFieldOrder,
                updateFieldVisibility,
            }}
        >
            {children}
        </ResumeContext.Provider>
    );
};

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
};
