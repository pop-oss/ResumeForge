/**
 * Agent Context
 * 智能体状态管理 - 管理模板搜索、选择和导入的全局状态
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { 
  AgentState, 
  AgentContextValue, 
  TemplateSearchResult, 
  AgentError 
} from './types';
import { searchTemplates } from './services/templateSearchService';
import { importTemplate } from './services/templateImporter';
import type { ResumeData } from '../resume/types';

// ============ Initial State ============

const initialState: AgentState = {
  isSearching: false,
  searchQuery: '',
  searchResults: [],
  selectedTemplate: null,
  error: null,
  isDialogOpen: false,
  isImporting: false,
};

// ============ Context ============

const AgentContext = createContext<AgentContextValue | null>(null);

// ============ Provider Props ============

interface AgentProviderProps {
  children: ReactNode;
  onTemplateImport?: (data: ResumeData) => void;
}

// ============ Provider Component ============

export function AgentProvider({ children, onTemplateImport }: AgentProviderProps) {
  const [state, setState] = useState<AgentState>(initialState);

  // Open search dialog
  const openSearchDialog = useCallback(() => {
    setState(prev => ({ ...prev, isDialogOpen: true }));
  }, []);

  // Close search dialog
  const closeSearchDialog = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isDialogOpen: false,
      // Clear results when closing
      searchResults: [],
      selectedTemplate: null,
      error: null,
    }));
  }, []);

  // Search for templates
  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({
        ...prev,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Please enter search keywords',
          recoverable: true,
        },
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isSearching: true,
      searchQuery: query,
      error: null,
    }));

    try {
      const { results, error } = await searchTemplates(query);

      setState(prev => ({
        ...prev,
        isSearching: false,
        searchResults: results,
        error,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        error: {
          type: 'NETWORK_ERROR',
          message: 'Search failed. Please try again.',
          details: err,
          recoverable: true,
        },
      }));
    }
  }, []);

  // Select a template
  const selectTemplate = useCallback((template: TemplateSearchResult | null) => {
    setState(prev => ({ ...prev, selectedTemplate: template }));
  }, []);

  // Import selected template
  const importSelectedTemplate = useCallback(async (): Promise<boolean> => {
    const { selectedTemplate } = state;
    
    if (!selectedTemplate) {
      setState(prev => ({
        ...prev,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Please select a template first',
          recoverable: true,
        },
      }));
      return false;
    }

    setState(prev => ({ ...prev, isImporting: true, error: null }));

    try {
      const { data, error } = await importTemplate(selectedTemplate);

      if (error || !data) {
        setState(prev => ({
          ...prev,
          isImporting: false,
          error: error || {
            type: 'CONVERSION_ERROR',
            message: 'Failed to import template',
            recoverable: true,
          },
        }));
        return false;
      }

      // Call the import callback
      if (onTemplateImport) {
        onTemplateImport(data);
      }

      // Close dialog and reset state
      setState(prev => ({
        ...prev,
        isImporting: false,
        isDialogOpen: false,
        searchResults: [],
        selectedTemplate: null,
        error: null,
      }));

      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        isImporting: false,
        error: {
          type: 'CONVERSION_ERROR',
          message: 'Failed to import template',
          details: err,
          recoverable: true,
        },
      }));
      return false;
    }
  }, [state.selectedTemplate, onTemplateImport]);

  // Clear search results
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchResults: [],
      selectedTemplate: null,
      searchQuery: '',
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Context value
  const value: AgentContextValue = {
    ...state,
    openSearchDialog,
    closeSearchDialog,
    search,
    selectTemplate,
    importTemplate: importSelectedTemplate,
    clearResults,
    clearError,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

// ============ Hook ============

export function useAgent(): AgentContextValue {
  const context = useContext(AgentContext);
  
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  
  return context;
}

// ============ Export Context for Testing ============

export { AgentContext };
