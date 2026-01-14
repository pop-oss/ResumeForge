/**
 * Template Search Service
 * 模板搜索服务 - 负责搜索、解析、过滤和排序模板
 * 
 * Features:
 * - Multi-source template search
 * - Template metadata parsing
 * - Relevance-based filtering and sorting
 * - Cache integration
 */

import type { 
  TemplateSearchResult, 
  SearchQuery, 
  TemplateSource, 
  TemplateStyle,
  TemplateMetadata,
  AgentError 
} from '../types';
import { SEARCH_CONFIG, MOCK_TEMPLATES } from '../constants';
import { getCachedResults, setCachedResults } from './cacheManager';
import { analyzeQuery } from './aiService';

// ============ Template Parsing ============

/**
 * Parse raw template data into TemplateSearchResult
 * Property 3: For any valid template response, SHALL extract required fields
 */
export function parseTemplateData(
  rawData: Record<string, unknown>,
  source: TemplateSource
): TemplateSearchResult | null {
  try {
    // Validate required fields
    const id = rawData.id as string || rawData.name as string || crypto.randomUUID();
    const name = rawData.name as string || rawData.title as string;
    
    if (!name) {
      return null;
    }
    
    const previewUrl = rawData.previewUrl as string || 
                       rawData.preview as string || 
                       rawData.thumbnail as string ||
                       rawData.image as string ||
                       'https://via.placeholder.com/300x400?text=No+Preview';
    
    const sourceUrl = rawData.sourceUrl as string || 
                      rawData.url as string || 
                      rawData.html_url as string ||
                      rawData.link as string ||
                      '';
    
    const description = rawData.description as string || '';
    const tags = (rawData.tags as string[]) || 
                 (rawData.topics as string[]) || 
                 [];
    
    // Detect style from tags or name
    const style = detectStyleFromData(name, tags, description);
    
    // Parse metadata
    const metadata: TemplateMetadata = {
      author: rawData.author as string || rawData.owner as string || undefined,
      license: rawData.license as string || undefined,
      lastUpdated: rawData.updated_at as string || rawData.lastUpdated as string || undefined,
      downloads: rawData.downloads as number || rawData.stargazers_count as number || undefined,
      rating: rawData.rating as number || undefined,
    };
    
    return {
      id: String(id),
      name: String(name),
      description: String(description),
      previewUrl: String(previewUrl),
      sourceUrl: String(sourceUrl),
      source,
      tags: tags.map(String),
      style,
      relevanceScore: 0, // Will be calculated during filtering
      metadata,
    };
  } catch (error) {
    console.warn('Failed to parse template data:', error);
    return null;
  }
}

/**
 * Detect template style from name, tags, and description
 */
function detectStyleFromData(name: string, tags: string[], description: string): TemplateStyle {
  const combined = `${name} ${tags.join(' ')} ${description}`.toLowerCase();
  
  if (combined.includes('modern') || combined.includes('contemporary')) {
    return 'modern';
  }
  if (combined.includes('minimal') || combined.includes('simple') || combined.includes('clean')) {
    return 'minimal';
  }
  if (combined.includes('creative') || combined.includes('artistic') || combined.includes('design')) {
    return 'creative';
  }
  if (combined.includes('professional') || combined.includes('corporate') || combined.includes('business')) {
    return 'professional';
  }
  if (combined.includes('tech') || combined.includes('developer') || combined.includes('engineer')) {
    return 'tech';
  }
  
  return 'classic';
}

// ============ Relevance Scoring ============

/**
 * Calculate relevance score for a template based on search query
 */
export function calculateRelevanceScore(
  template: TemplateSearchResult,
  query: SearchQuery
): number {
  let score = 0.5; // Base score
  
  const keywords = query.keywords.map(k => k.toLowerCase());
  const templateText = `${template.name} ${template.description} ${template.tags.join(' ')}`.toLowerCase();
  
  // Keyword matching
  for (const keyword of keywords) {
    if (templateText.includes(keyword)) {
      score += 0.1;
    }
  }
  
  // Style matching
  if (query.intent.style && template.style === query.intent.style) {
    score += 0.2;
  }
  
  // Industry/position matching in tags
  if (query.intent.industry) {
    const industry = query.intent.industry.toLowerCase();
    if (template.tags.some(t => t.toLowerCase().includes(industry)) ||
        templateText.includes(industry)) {
      score += 0.15;
    }
  }
  
  if (query.intent.position) {
    const position = query.intent.position.toLowerCase();
    if (template.tags.some(t => t.toLowerCase().includes(position)) ||
        templateText.includes(position)) {
      score += 0.15;
    }
  }
  
  // Bonus for high-rated templates
  if (template.metadata.rating && template.metadata.rating >= 4.5) {
    score += 0.05;
  }
  
  // Cap at 1.0
  return Math.min(1.0, score);
}

// ============ Filtering and Sorting ============

/**
 * Filter templates by relevance score
 * Property 4: All filtered results SHALL have relevanceScore > minRelevanceScore
 */
export function filterByRelevance(
  templates: TemplateSearchResult[],
  minScore: number = SEARCH_CONFIG.minRelevanceScore
): TemplateSearchResult[] {
  return templates.filter(t => t.relevanceScore > minScore);
}

/**
 * Sort templates by relevance score (descending)
 * Property 5: Output SHALL be in descending order by relevanceScore
 */
export function sortByRelevance(templates: TemplateSearchResult[]): TemplateSearchResult[] {
  return [...templates].sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Apply relevance scoring, filtering, and sorting to templates
 */
export function processSearchResults(
  templates: TemplateSearchResult[],
  query: SearchQuery,
  maxResults: number = SEARCH_CONFIG.maxResults
): TemplateSearchResult[] {
  // Calculate relevance scores
  const scored = templates.map(t => ({
    ...t,
    relevanceScore: calculateRelevanceScore(t, query),
  }));
  
  // Filter by minimum relevance
  const filtered = filterByRelevance(scored);
  
  // Sort by relevance
  const sorted = sortByRelevance(filtered);
  
  // Limit results
  return sorted.slice(0, maxResults);
}

// ============ Search Sources ============

/**
 * Search GitHub for resume templates
 */
async function searchGitHub(query: SearchQuery): Promise<TemplateSearchResult[]> {
  try {
    const searchTerms = [...query.keywords, 'resume', 'template'].join('+');
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(searchTerms)}&sort=stars&per_page=10`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    const items = data.items || [];
    
    return items
      .map((item: Record<string, unknown>) => parseTemplateData({
        ...item,
        previewUrl: `https://opengraph.githubassets.com/1/${item.full_name}`,
        sourceUrl: item.html_url,
        author: (item.owner as Record<string, unknown>)?.login,
      }, 'github'))
      .filter((t: TemplateSearchResult | null): t is TemplateSearchResult => t !== null);
  } catch (error) {
    console.warn('GitHub search failed:', error);
    return [];
  }
}

/**
 * Get mock templates (fallback/development)
 */
function getMockTemplates(query: SearchQuery): TemplateSearchResult[] {
  return MOCK_TEMPLATES.map(t => ({
    ...t,
    relevanceScore: calculateRelevanceScore(t as TemplateSearchResult, query),
  }));
}

// ============ Main Search Function ============

export interface SearchOptions {
  useCache?: boolean;
  sources?: TemplateSource[];
  maxResults?: number;
}

/**
 * Search for templates across multiple sources
 */
export async function searchTemplates(
  rawQuery: string,
  options: SearchOptions = {}
): Promise<{ results: TemplateSearchResult[]; error: AgentError | null }> {
  const {
    useCache = true,
    sources = SEARCH_CONFIG.defaultSources,
    maxResults = SEARCH_CONFIG.maxResults,
  } = options;
  
  // Check cache first
  if (useCache) {
    const cached = getCachedResults(rawQuery);
    if (cached) {
      return { results: cached, error: null };
    }
  }
  
  try {
    // Analyze query
    const query = await analyzeQuery(rawQuery);
    
    if (query.keywords.length === 0) {
      return {
        results: [],
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Please enter search keywords',
          recoverable: true,
        },
      };
    }
    
    // Search all sources in parallel
    const searchPromises: Promise<TemplateSearchResult[]>[] = [];
    
    if (sources.includes('github')) {
      searchPromises.push(searchGitHub(query));
    }
    
    // Add mock templates as fallback
    searchPromises.push(Promise.resolve(getMockTemplates(query)));
    
    const searchResults = await Promise.all(searchPromises);
    const allTemplates = searchResults.flat();
    
    // Process results (score, filter, sort)
    const processed = processSearchResults(allTemplates, query, maxResults);
    
    // Cache results
    if (useCache && processed.length > 0) {
      setCachedResults(rawQuery, processed);
    }
    
    return { results: processed, error: null };
  } catch (error) {
    console.error('Search failed:', error);
    return {
      results: [],
      error: {
        type: 'NETWORK_ERROR',
        message: 'Search failed. Please try again.',
        details: error,
        recoverable: true,
      },
    };
  }
}

/**
 * Synchronous search using only mock data (for testing)
 */
export function searchTemplatesSync(
  rawQuery: string,
  options: { maxResults?: number } = {}
): TemplateSearchResult[] {
  const { maxResults = SEARCH_CONFIG.maxResults } = options;
  
  // Use basic analysis
  const keywords = rawQuery.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  const query: SearchQuery = {
    raw: rawQuery,
    keywords,
    intent: {},
    filters: { maxResults },
  };
  
  const templates = getMockTemplates(query);
  return processSearchResults(templates, query, maxResults);
}
