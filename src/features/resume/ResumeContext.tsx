import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ResumeData, SectionOrder, ResumeSettings, ResumeBasics } from './types';
import { initialResumeData } from './data';

interface ResumeContextType {
    resumeData: ResumeData;
    setResumeData: (data: ResumeData) => void;
    updateBasics: (basics: Partial<ResumeBasics>) => void;
    updateSettings: (settings: Partial<ResumeSettings>) => void;
    reorderSections: (order: SectionOrder) => void;
    resetResume: () => void;
    // Generic update/delete helpers could be added here or implemented in components
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const STORAGE_KEY = 'resume-builder-data';

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [resumeData, setResumeState] = useState<ResumeData>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
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

    return (
        <ResumeContext.Provider
            value={{
                resumeData,
                setResumeData,
                updateBasics,
                updateSettings,
                reorderSections,
                resetResume,
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
