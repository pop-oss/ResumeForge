# Design Document: Smart Template Search System

## Overview

智能简历模板搜索系统是一个基于 AI 的功能模块，集成到现有的 Resume Forge 应用中。系统允许用户通过自然语言描述需求，智能体从网络源搜集相关简历模板，提供预览和一键导入功能。

### 核心设计原则

1. **模块化架构**: 与现有 React Context 状态管理保持一致
2. **渐进增强**: AI 服务不可用时降级为基础关键词匹配
3. **缓存优先**: 减少重复网络请求，提升用户体验
4. **国际化支持**: 完整的中英文界面支持

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Header Component                         │
│  ┌─────────────────┐                                            │
│  │ Search Templates │ ──────────────────────────────────────┐   │
│  │     Button       │                                        │   │
│  └─────────────────┘                                        │   │
└─────────────────────────────────────────────────────────────│───┘
                                                               │
                                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TemplateSearchDialog                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Keyword Input  │  Search Button  │  Loading Indicator   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   TemplateGallery                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ Template │  │ Template │  │ Template │  ...          │   │
│  │  │   Card   │  │   Card   │  │   Card   │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │   AIService     │  │ TemplateSearch  │  │ TemplateCache  │  │
│  │                 │  │    Service      │  │                │  │
│  │ - analyzeQuery  │  │ - search()      │  │ - get()        │  │
│  │ - extractIntent │  │ - parse()       │  │ - set()        │  │
│  └─────────────────┘  │ - filter()      │  │ - invalidate() │  │
│                       └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TemplateImporter                              │
│  - convertToResumeData()                                        │
│  - applyTemplate()                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. AgentContext (状态管理)

```typescript
interface AgentState {
  isSearching: boolean;
  searchQuery: string;
  searchResults: TemplateSearchResult[];
  selectedTemplate: TemplateSearchResult | null;
  error: string | null;
  isDialogOpen: boolean;
}

interface AgentContextValue extends AgentState {
  openSearchDialog: () => void;
  closeSearchDialog: () => void;
  search: (query: string) => Promise<void>;
  selectTemplate: (template: TemplateSearchResult) => void;
  importTemplate: () => Promise<void>;
  clearResults: () => void;
}
```

### 2. TemplateSearchDialog Component

```typescript
interface TemplateSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 内部状态
interface DialogState {
  inputValue: string;
  isSubmitting: boolean;
  validationError: string | null;
}
```

### 3. TemplateGallery Component

```typescript
interface TemplateGalleryProps {
  templates: TemplateSearchResult[];
  onSelect: (template: TemplateSearchResult) => void;
  isLoading: boolean;
  emptyMessage?: string;
}
```

### 4. TemplateCard Component

```typescript
interface TemplateCardProps {
  template: TemplateSearchResult;
  onClick: () => void;
  isSelected: boolean;
}
```

### 5. TemplateImporter Component

```typescript
interface TemplateImporterProps {
  template: TemplateSearchResult;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
}
```

## Data Models

### TemplateSearchResult

```typescript
interface TemplateSearchResult {
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

type TemplateSource = 'github' | 'dribbble' | 'behance' | 'custom';

type TemplateStyle = 
  | 'classic' 
  | 'modern' 
  | 'minimal' 
  | 'creative' 
  | 'professional' 
  | 'tech';

interface TemplateMetadata {
  author?: string;
  license?: string;
  lastUpdated?: string;
  downloads?: number;
  rating?: number;
}
```

### SearchQuery

```typescript
interface SearchQuery {
  raw: string;
  keywords: string[];
  intent: SearchIntent;
  filters: SearchFilters;
}

interface SearchIntent {
  industry?: string;
  position?: string;
  style?: TemplateStyle;
  experience?: 'entry' | 'mid' | 'senior' | 'executive';
}

interface SearchFilters {
  sources?: TemplateSource[];
  minRating?: number;
  maxResults?: number;
}
```

### CacheEntry

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  query: string;
}

interface CacheConfig {
  maxAge: number; // 24 hours in milliseconds
  maxSize: number; // Maximum number of entries
}
```

### ExternalTemplate (外部模板格式)

```typescript
interface ExternalTemplate {
  html?: string;
  css?: string;
  json?: Record<string, unknown>;
  format: 'html' | 'json' | 'react';
  sourceUrl: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Keyword Analysis Extracts Metadata

*For any* non-empty keyword string, the Agent's analyzeQuery function SHALL return a SearchQuery object containing at least one of: industry, position, or style intent.

**Validates: Requirements 1.2**

### Property 2: Whitespace Input Validation

*For any* string composed entirely of whitespace characters (including empty string), the Search_Dialog validation SHALL reject the input and return a validation error.

**Validates: Requirements 1.4**

### Property 3: Template Metadata Extraction

*For any* valid template response from an external source, the Template_Search_Service parser SHALL extract and return a TemplateSearchResult containing: id, name, previewUrl, sourceUrl, and source fields.

**Validates: Requirements 2.2**

### Property 4: Search Result Filtering Relevance

*For any* search query and set of templates, all templates in the filtered results SHALL have a relevanceScore greater than the minimum threshold (0.3).

**Validates: Requirements 2.3**

### Property 5: Search Result Sorting Invariant

*For any* list of filtered templates, the sorted output SHALL be in descending order by relevanceScore (i.e., for all i < j: results[i].relevanceScore >= results[j].relevanceScore).

**Validates: Requirements 2.4**

### Property 6: Template Card Rendering Completeness

*For any* TemplateSearchResult, the rendered TemplateCard output SHALL contain the template's name, previewUrl (as image), and source information.

**Validates: Requirements 3.2**

### Property 7: Template Conversion Produces Valid ResumeData

*For any* valid ExternalTemplate, the Template_Importer's convertToResumeData function SHALL produce a ResumeData object that passes the ResumeData schema validation.

**Validates: Requirements 4.2**

### Property 8: Cache Stores Fetched Templates

*For any* successful template fetch operation, the Template_Cache SHALL contain an entry for that query immediately after the fetch completes.

**Validates: Requirements 5.1**

### Property 9: Cache Returns Results Within TTL

*For any* cached query where (currentTime - cacheEntry.timestamp) < maxAge, the Template_Cache SHALL return the cached results without making a network request.

**Validates: Requirements 5.3**

### Property 10: Cache Invalidates Expired Entries

*For any* cache entry where (currentTime - cacheEntry.timestamp) >= maxAge (24 hours), the Template_Cache SHALL not return that entry and SHALL remove it from storage.

**Validates: Requirements 5.4**

### Property 11: Cache LRU Eviction

*For any* cache at maximum capacity, adding a new entry SHALL evict the entry with the oldest timestamp first.

**Validates: Requirements 5.5**

### Property 12: Internationalization Consistency

*For any* supported language (zh, en) and any UI component in the template search system, all displayed text SHALL be in the selected language.

**Validates: Requirements 6.4, 8.1, 8.2, 8.3, 8.4**

## Error Handling

### Error Types

```typescript
type AgentErrorType = 
  | 'NETWORK_ERROR'
  | 'AI_SERVICE_UNAVAILABLE'
  | 'INVALID_API_KEY'
  | 'PARSE_ERROR'
  | 'CONVERSION_ERROR'
  | 'CACHE_ERROR'
  | 'VALIDATION_ERROR';

interface AgentError {
  type: AgentErrorType;
  message: string;
  details?: unknown;
  recoverable: boolean;
}
```

### Error Handling Strategy

| Error Type | Recovery Strategy | User Message |
|------------|-------------------|--------------|
| NETWORK_ERROR | Retry with exponential backoff (max 3 attempts) | "网络连接失败，正在重试..." |
| AI_SERVICE_UNAVAILABLE | Fall back to basic keyword matching | "AI 服务暂时不可用，使用基础搜索" |
| INVALID_API_KEY | Prompt user to configure API key | "请配置 API 密钥" |
| PARSE_ERROR | Skip invalid template, continue with others | "部分模板解析失败" |
| CONVERSION_ERROR | Show error, suggest alternatives | "模板转换失败，请尝试其他模板" |
| CACHE_ERROR | Bypass cache, fetch from network | (Silent fallback) |
| VALIDATION_ERROR | Show validation message | "请输入搜索关键词" |

## Testing Strategy

### Unit Tests

单元测试覆盖核心逻辑和边界情况：

1. **AIService Tests**
   - 关键词分析正确提取意图
   - 空输入处理
   - AI 服务降级到基础匹配

2. **TemplateSearchService Tests**
   - 模板解析正确提取元数据
   - 过滤逻辑正确应用
   - 排序结果正确

3. **TemplateCache Tests**
   - 缓存存储和检索
   - TTL 过期处理
   - LRU 淘汰策略

4. **TemplateImporter Tests**
   - 各种格式转换
   - 无效模板处理
   - ResumeData 验证

### Property-Based Tests

使用 fast-check 库进行属性测试，每个测试运行至少 100 次迭代：

1. **Property 2**: 白空格输入验证
2. **Property 4**: 过滤结果相关性
3. **Property 5**: 排序不变性
4. **Property 7**: 模板转换有效性
5. **Property 9-11**: 缓存行为属性

### Integration Tests

1. 完整搜索流程测试
2. 模板导入流程测试
3. Header 集成测试

### Test Configuration

```typescript
// vitest.config.ts 中的属性测试配置
{
  test: {
    // fast-check 默认运行 100 次迭代
    testTimeout: 30000, // 属性测试可能需要更长时间
  }
}
```
