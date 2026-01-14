/**
 * Agent Feature Type Definitions
 * 智能模板搜索系统的类型定义
 */

// ============ Template Types ============

export type TemplateSource = 'github' | 'dribbble' | 'behance' | 'custom';

export type TemplateStyle = 
  | 'classic' 
  | 'modern' 
  | 'minimal' 
  | 'creative' 
  | 'professional' 
  | 'tech';

export interface TemplateMetadata {
  author?: string;
  license?: string;
  lastUpdated?: string;
  downloads?: number;
  rating?: number;
}

export interface TemplateSearchResult {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  sourceUrl: string;
  source: TemplateSource;
  tags: string[];
  style: TemplateStyle;
  relevanceScore: number;
  metadata: TemplateMetadata;
}

// ============ Search Types ============

export interface SearchIntent {
  industry?: string;
  position?: string;
  style?: TemplateStyle;
  experience?: 'entry' | 'mid' | 'senior' | 'executive';
}

export interface SearchFilters {
  sources?: TemplateSource[];
  minRating?: number;
  maxResults?: number;
}

export interface SearchQuery {
  raw: string;
  keywords: string[];
  intent: SearchIntent;
  filters: SearchFilters;
}

// ============ Cache Types ============

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  query: string;
}

export interface CacheConfig {
  maxAge: number; // milliseconds
  maxSize: number; // maximum number of entries
}

// ============ External Template Types ============

export type ExternalTemplateFormat = 'html' | 'json' | 'react';

export interface ExternalTemplate {
  html?: string;
  css?: string;
  json?: Record<string, unknown>;
  format: ExternalTemplateFormat;
  sourceUrl: string;
}

// ============ Error Types ============

export type AgentErrorType = 
  | 'NETWORK_ERROR'
  | 'AI_SERVICE_UNAVAILABLE'
  | 'INVALID_API_KEY'
  | 'PARSE_ERROR'
  | 'CONVERSION_ERROR'
  | 'CACHE_ERROR'
  | 'VALIDATION_ERROR';

export interface AgentError {
  type: AgentErrorType;
  message: string;
  details?: unknown;
  recoverable: boolean;
}

// ============ Agent State Types ============

export interface AgentState {
  isSearching: boolean;
  searchQuery: string;
  searchResults: TemplateSearchResult[];
  selectedTemplate: TemplateSearchResult | null;
  error: AgentError | null;
  isDialogOpen: boolean;
  isImporting: boolean;
}

export interface AgentContextValue extends AgentState {
  openSearchDialog: () => void;
  closeSearchDialog: () => void;
  search: (query: string) => Promise<void>;
  selectTemplate: (template: TemplateSearchResult | null) => void;
  importTemplate: () => Promise<boolean>;
  clearResults: () => void;
  clearError: () => void;
}

// ============ Component Props Types ============

export interface TemplateSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TemplateGalleryProps {
  templates: TemplateSearchResult[];
  onSelect: (template: TemplateSearchResult) => void;
  selectedTemplate: TemplateSearchResult | null;
  isLoading: boolean;
  emptyMessage?: string;
}

export interface TemplateCardProps {
  template: TemplateSearchResult;
  onClick: () => void;
  isSelected: boolean;
}

export interface TemplateImporterProps {
  template: TemplateSearchResult;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
}

// ============ API Config Types ============

export interface ApiConfig {
  apiKey: string;
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl?: string;
}

// ============ Validation Types ============

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
