# Implementation Plan: Smart Template Search System

## Overview

本实现计划将智能简历模板搜索系统分解为可执行的编码任务。每个任务都是增量式的，构建在前一个任务的基础上，确保代码始终处于可运行状态。

## Tasks

- [x] 1. Set up project structure and core types
  - [x] 1.1 Create agent feature directory structure and type definitions
    - Create `src/features/agent/types.ts` with all interfaces (TemplateSearchResult, SearchQuery, CacheEntry, etc.)
    - Create `src/features/agent/constants.ts` with configuration constants
    - _Requirements: 2.2, 5.1_
  - [x] 1.2 Write property test for type validation
    - **Property 7: Template Conversion Produces Valid ResumeData**
    - **Validates: Requirements 4.2**

- [x] 2. Implement Template Cache Service
  - [x] 2.1 Create cache manager with localStorage backend
    - Create `src/features/agent/services/cacheManager.ts`
    - Implement get, set, invalidate, clear methods
    - Implement TTL checking (24 hours)
    - Implement LRU eviction when at capacity
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 2.2 Write property tests for cache behavior
    - **Property 8: Cache Stores Fetched Templates**
    - **Property 9: Cache Returns Results Within TTL**
    - **Property 10: Cache Invalidates Expired Entries**
    - **Property 11: Cache LRU Eviction**
    - **Validates: Requirements 5.1, 5.3, 5.4, 5.5**

- [x] 3. Implement AI Service Layer
  - [x] 3.1 Create AI service abstraction
    - Create `src/features/agent/services/aiService.ts`
    - Implement analyzeQuery function for keyword intent extraction
    - Implement fallback to basic keyword matching
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 3.2 Write property test for keyword analysis
    - **Property 1: Keyword Analysis Extracts Metadata**
    - **Validates: Requirements 1.2**

- [x] 4. Implement Template Search Service
  - [x] 4.1 Create template search service
    - Create `src/features/agent/services/templateSearchService.ts`
    - Implement search function with cache integration
    - Implement template metadata parser
    - Implement relevance filtering and sorting
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [x] 4.2 Write property tests for search service
    - **Property 3: Template Metadata Extraction**
    - **Property 4: Search Result Filtering Relevance**
    - **Property 5: Search Result Sorting Invariant**
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 5. Checkpoint - Core Services
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Template Importer
  - [x] 6.1 Create template converter and importer
    - Create `src/features/agent/services/templateImporter.ts`
    - Implement convertToResumeData function for different formats
    - Implement validation against ResumeData schema
    - _Requirements: 4.2, 4.4_
  - [x] 6.2 Write property test for template conversion
    - **Property 7: Template Conversion Produces Valid ResumeData**
    - **Validates: Requirements 4.2**

- [x] 7. Create Agent Context
  - [x] 7.1 Implement AgentContext for state management
    - Create `src/features/agent/AgentContext.tsx`
    - Implement state: isSearching, searchResults, selectedTemplate, error
    - Implement actions: search, selectTemplate, importTemplate
    - Wire up services (AIService, TemplateSearchService, TemplateImporter)
    - _Requirements: 1.2, 2.1, 4.2, 4.5_

- [x] 8. Add Internationalization Support
  - [x] 8.1 Add i18n text for template search feature
    - Update `src/i18n/zh.ts` with Chinese translations
    - Update `src/i18n/en.ts` with English translations
    - Update `src/i18n/types.ts` with new translation keys
    - _Requirements: 8.1, 8.3, 8.4_
  - [x] 8.2 Write property test for i18n consistency
    - **Property 12: Internationalization Consistency**
    - **Validates: Requirements 6.4, 8.1, 8.2, 8.3, 8.4**

- [x] 9. Checkpoint - Services and Context
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create UI Components
  - [x] 10.1 Create TemplateCard component
    - Create `src/features/agent/components/TemplateCard.tsx`
    - Display thumbnail, name, source, tags
    - Implement hover state with additional details
    - _Requirements: 3.2, 3.3_
  - [x] 10.2 Write property test for TemplateCard rendering
    - **Property 6: Template Card Rendering Completeness**
    - **Validates: Requirements 3.2**
  - [x] 10.3 Create TemplateGallery component
    - Create `src/features/agent/components/TemplateGallery.tsx`
    - Implement responsive grid layout
    - Handle empty state with helpful message
    - _Requirements: 3.1, 3.4, 3.5_
  - [x] 10.4 Create TemplateImporter dialog component
    - Create `src/features/agent/components/TemplateImporter.tsx`
    - Implement confirmation dialog
    - Show import progress and error states
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [x] 11. Create Search Dialog
  - [x] 11.1 Create TemplateSearchDialog component
    - Create `src/features/agent/components/TemplateSearchDialog.tsx`
    - Implement keyword input with validation
    - Implement loading state during search
    - Integrate TemplateGallery and TemplateImporter
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  - [x] 11.2 Write property test for input validation
    - **Property 2: Whitespace Input Validation**
    - **Validates: Requirements 1.4**

- [x] 12. Integrate with Header
  - [x] 12.1 Add Search Templates button to Header
    - Update `src/features/header/Header.tsx`
    - Add "Search Templates" button with icon
    - Wire up to open TemplateSearchDialog
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 12.2 Integrate AgentContext with App
    - Update `src/App.tsx` to include AgentProvider
    - Ensure template import updates ResumeContext
    - _Requirements: 4.5, 6.3_

- [x] 13. Checkpoint - UI Integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Add Configuration Interface
  - [x] 14.1 Create API configuration component
    - Create `src/features/agent/components/ApiConfigDialog.tsx`
    - Implement API key input and storage
    - Add validation for API key format
    - _Requirements: 7.4, 7.5_

- [x] 15. Final Integration and Polish
  - [x] 15.1 Wire up error handling and notifications
    - Implement error boundary for agent components
    - Add toast notifications for success/error states
    - _Requirements: 2.5, 2.6, 4.4, 7.3, 7.4_
  - [x] 15.2 Write integration tests
    - Test complete search flow
    - Test template import flow
    - Test error handling scenarios
    - _Requirements: All_

- [x] 16. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive testing
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript with React, consistent with the existing codebase
- fast-check library is already available for property-based testing
