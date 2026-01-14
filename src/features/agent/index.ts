/**
 * Agent Feature Index
 * 导出 Agent 功能模块的所有公共 API
 */

// Context and Hook
export { AgentProvider, useAgent } from './AgentContext';

// Components
export { 
  TemplateCard, 
  TemplateGallery, 
  TemplateSearchDialog,
  TemplateImporterDialog,
  ApiConfigDialog,
  getStoredApiConfig,
  saveApiConfig,
  clearApiConfig,
  AgentErrorBoundary,
  Toast,
  ToastContainer,
  useToast,
} from './components';

export type { ToastMessage, ToastType } from './components';

// Types
export type {
  TemplateSearchResult,
  SearchQuery,
  SearchIntent,
  AgentState,
  AgentContextValue,
  AgentError,
  TemplateSource,
  TemplateStyle,
} from './types';

// Services (for advanced usage)
export { searchTemplates } from './services/templateSearchService';
export { analyzeQuery } from './services/aiService';
export { convertToResumeData } from './services/templateImporter';
export { getCachedResults, setCachedResults, clearCache } from './services/cacheManager';
