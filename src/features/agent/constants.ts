/**
 * Agent Feature Constants
 * 智能模板搜索系统的配置常量
 */

import type { CacheConfig, TemplateStyle, TemplateSource } from './types';

// ============ Cache Configuration ============

export const CACHE_CONFIG: CacheConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  maxSize: 100, // Maximum number of cached queries
};

export const CACHE_STORAGE_KEY = 'template-search-cache';

// ============ Search Configuration ============

export const SEARCH_CONFIG = {
  minRelevanceScore: 0.3,
  maxResults: 20,
  defaultSources: ['github', 'dribbble', 'behance'] as TemplateSource[],
  retryAttempts: 3,
  retryDelay: 1000, // milliseconds
};

// ============ API Configuration ============

export const API_CONFIG = {
  storageKey: 'agent-api-config',
  defaultProvider: 'openai' as const,
  timeout: 30000, // 30 seconds
};

// ============ Style Keywords Mapping ============

export const STYLE_KEYWORDS: Record<TemplateStyle, string[]> = {
  classic: ['经典', '传统', 'classic', 'traditional', '正式', 'formal'],
  modern: ['现代', '时尚', 'modern', 'contemporary', '新颖', 'trendy'],
  minimal: ['极简', '简约', 'minimal', 'minimalist', 'simple', '简洁'],
  creative: ['创意', '艺术', 'creative', 'artistic', '设计', 'design'],
  professional: ['专业', '商务', 'professional', 'business', '企业', 'corporate'],
  tech: ['技术', '科技', 'tech', 'technology', 'IT', '程序员', 'developer'],
};

// ============ Industry Keywords ============

export const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  technology: ['技术', '科技', 'IT', '互联网', 'tech', 'software', '软件'],
  finance: ['金融', '银行', '投资', 'finance', 'banking', 'investment'],
  healthcare: ['医疗', '健康', '医药', 'healthcare', 'medical', 'pharma'],
  education: ['教育', '培训', '学术', 'education', 'academic', 'teaching'],
  marketing: ['市场', '营销', '广告', 'marketing', 'advertising', 'sales'],
  design: ['设计', '创意', '艺术', 'design', 'creative', 'art'],
  engineering: ['工程', '制造', '建筑', 'engineering', 'manufacturing', 'construction'],
};

// ============ Position Keywords ============

export const POSITION_KEYWORDS: Record<string, string[]> = {
  developer: ['开发', '程序员', '工程师', 'developer', 'engineer', 'programmer'],
  designer: ['设计师', 'UI', 'UX', 'designer', 'graphic'],
  manager: ['经理', '主管', '总监', 'manager', 'director', 'lead'],
  analyst: ['分析师', '数据', 'analyst', 'data', 'research'],
  marketing: ['市场', '运营', '营销', 'marketing', 'operations'],
  sales: ['销售', '商务', 'sales', 'business development'],
};

// ============ Experience Level Keywords ============

export const EXPERIENCE_KEYWORDS = {
  entry: ['应届', '实习', '初级', 'entry', 'junior', 'intern', 'graduate'],
  mid: ['中级', '3年', '5年', 'mid', 'intermediate'],
  senior: ['高级', '资深', '10年', 'senior', 'experienced'],
  executive: ['总监', '副总', 'CEO', 'executive', 'director', 'VP'],
};

// ============ Error Messages ============

export const ERROR_MESSAGES = {
  zh: {
    NETWORK_ERROR: '网络连接失败，正在重试...',
    AI_SERVICE_UNAVAILABLE: 'AI 服务暂时不可用，使用基础搜索',
    INVALID_API_KEY: '请配置有效的 API 密钥',
    PARSE_ERROR: '部分模板解析失败',
    CONVERSION_ERROR: '模板转换失败，请尝试其他模板',
    CACHE_ERROR: '缓存读取失败',
    VALIDATION_ERROR: '请输入搜索关键词',
  },
  en: {
    NETWORK_ERROR: 'Network connection failed, retrying...',
    AI_SERVICE_UNAVAILABLE: 'AI service unavailable, using basic search',
    INVALID_API_KEY: 'Please configure a valid API key',
    PARSE_ERROR: 'Some templates failed to parse',
    CONVERSION_ERROR: 'Template conversion failed, please try another',
    CACHE_ERROR: 'Cache read failed',
    VALIDATION_ERROR: 'Please enter search keywords',
  },
};

// ============ Mock Templates (for development/fallback) ============

export const MOCK_TEMPLATES = [
  {
    id: 'mock-1',
    name: 'Modern Developer Resume',
    description: 'A clean, modern resume template perfect for software developers',
    previewUrl: 'https://via.placeholder.com/300x400?text=Modern+Dev',
    sourceUrl: 'https://github.com/example/resume-template-1',
    source: 'github' as TemplateSource,
    tags: ['modern', 'developer', 'tech'],
    style: 'modern' as TemplateStyle,
    relevanceScore: 0.95,
    metadata: {
      author: 'Example Author',
      license: 'MIT',
      downloads: 1500,
      rating: 4.8,
    },
  },
  {
    id: 'mock-2',
    name: 'Classic Professional',
    description: 'Traditional professional resume for corporate positions',
    previewUrl: 'https://via.placeholder.com/300x400?text=Classic+Pro',
    sourceUrl: 'https://github.com/example/resume-template-2',
    source: 'github' as TemplateSource,
    tags: ['classic', 'professional', 'corporate'],
    style: 'classic' as TemplateStyle,
    relevanceScore: 0.88,
    metadata: {
      author: 'Pro Templates',
      license: 'MIT',
      downloads: 2300,
      rating: 4.6,
    },
  },
  {
    id: 'mock-3',
    name: 'Minimal Creative',
    description: 'Minimalist design for creative professionals',
    previewUrl: 'https://via.placeholder.com/300x400?text=Minimal+Creative',
    sourceUrl: 'https://dribbble.com/example/resume-3',
    source: 'dribbble' as TemplateSource,
    tags: ['minimal', 'creative', 'design'],
    style: 'minimal' as TemplateStyle,
    relevanceScore: 0.82,
    metadata: {
      author: 'Creative Studio',
      license: 'CC BY',
      downloads: 890,
      rating: 4.9,
    },
  },
];
