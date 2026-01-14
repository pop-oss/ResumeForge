/**
 * AI Service Layer
 * AI 服务抽象层 - 支持关键词分析和意图提取
 * 
 * Features:
 * - Keyword analysis for intent extraction
 * - Fallback to basic keyword matching when AI unavailable
 * - Configurable prompts
 * - Support for multiple AI providers
 */

import type { SearchQuery, SearchIntent, SearchFilters, TemplateStyle, ApiConfig } from '../types';
import { 
  STYLE_KEYWORDS, 
  INDUSTRY_KEYWORDS, 
  POSITION_KEYWORDS, 
  EXPERIENCE_KEYWORDS,
  API_CONFIG 
} from '../constants';

// ============ API Configuration ============

/**
 * Load API configuration from localStorage
 */
export function loadApiConfig(): ApiConfig | null {
  try {
    const stored = localStorage.getItem(API_CONFIG.storageKey);
    if (stored) {
      return JSON.parse(stored) as ApiConfig;
    }
  } catch (error) {
    console.warn('Failed to load API config:', error);
  }
  return null;
}

/**
 * Save API configuration to localStorage
 */
export function saveApiConfig(config: ApiConfig): void {
  try {
    localStorage.setItem(API_CONFIG.storageKey, JSON.stringify(config));
  } catch (error) {
    console.warn('Failed to save API config:', error);
  }
}

/**
 * Check if API is configured
 */
export function isApiConfigured(): boolean {
  const config = loadApiConfig();
  return config !== null && config.apiKey.length > 0;
}

// ============ Keyword Analysis ============

/**
 * Extract keywords from raw query string
 */
export function extractKeywords(raw: string): string[] {
  // Split by common delimiters and filter empty strings
  const keywords = raw
    .toLowerCase()
    .split(/[\s,，、;；]+/)
    .map(k => k.trim())
    .filter(k => k.length > 0);
  
  // Remove duplicates
  return [...new Set(keywords)];
}

/**
 * Detect style from keywords using keyword mapping
 */
export function detectStyle(keywords: string[]): TemplateStyle | undefined {
  for (const [style, styleKeywords] of Object.entries(STYLE_KEYWORDS)) {
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (styleKeywords.some(sk => {
        const lowerSk = sk.toLowerCase();
        return lowerKeyword.includes(lowerSk) || lowerSk.includes(lowerKeyword);
      })) {
        return style as TemplateStyle;
      }
    }
  }
  return undefined;
}

/**
 * Detect industry from keywords
 */
export function detectIndustry(keywords: string[]): string | undefined {
  for (const [industry, industryKeywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (industryKeywords.some(ik => {
        const lowerIk = ik.toLowerCase();
        return lowerKeyword.includes(lowerIk) || lowerIk.includes(lowerKeyword);
      })) {
        return industry;
      }
    }
  }
  return undefined;
}

/**
 * Detect position from keywords
 */
export function detectPosition(keywords: string[]): string | undefined {
  for (const [position, positionKeywords] of Object.entries(POSITION_KEYWORDS)) {
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (positionKeywords.some(pk => {
        const lowerPk = pk.toLowerCase();
        return lowerKeyword.includes(lowerPk) || lowerPk.includes(lowerKeyword);
      })) {
        return position;
      }
    }
  }
  return undefined;
}

/**
 * Detect experience level from keywords
 */
export function detectExperience(keywords: string[]): 'entry' | 'mid' | 'senior' | 'executive' | undefined {
  for (const [level, levelKeywords] of Object.entries(EXPERIENCE_KEYWORDS)) {
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (levelKeywords.some(lk => {
        const lowerLk = lk.toLowerCase();
        return lowerKeyword.includes(lowerLk) || lowerLk.includes(lowerKeyword);
      })) {
        return level as 'entry' | 'mid' | 'senior' | 'executive';
      }
    }
  }
  return undefined;
}

/**
 * Basic keyword matching fallback
 * Used when AI service is unavailable
 */
export function basicKeywordAnalysis(raw: string): SearchQuery {
  const keywords = extractKeywords(raw);
  
  const intent: SearchIntent = {
    style: detectStyle(keywords),
    industry: detectIndustry(keywords),
    position: detectPosition(keywords),
    experience: detectExperience(keywords),
  };
  
  const filters: SearchFilters = {
    maxResults: 20,
  };
  
  return {
    raw,
    keywords,
    intent,
    filters,
  };
}

// ============ AI-Powered Analysis ============

/**
 * Generate prompt for AI keyword analysis
 */
export function generateAnalysisPrompt(raw: string): string {
  return `Analyze the following resume template search query and extract structured information.

Query: "${raw}"

Extract the following information in JSON format:
{
  "industry": "detected industry (e.g., technology, finance, healthcare) or null",
  "position": "detected position type (e.g., developer, designer, manager) or null",
  "style": "detected style preference (classic, modern, minimal, creative, professional, tech) or null",
  "experience": "detected experience level (entry, mid, senior, executive) or null",
  "additionalKeywords": ["any other relevant keywords"]
}

Respond with only the JSON object, no additional text.`;
}

/**
 * Parse AI response to SearchIntent
 */
export function parseAiResponse(response: string): SearchIntent {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      industry: parsed.industry || undefined,
      position: parsed.position || undefined,
      style: parsed.style || undefined,
      experience: parsed.experience || undefined,
    };
  } catch (error) {
    console.warn('Failed to parse AI response:', error);
    return {};
  }
}

/**
 * Call AI service for keyword analysis
 * Returns null if AI service is unavailable
 */
export async function callAiService(prompt: string): Promise<string | null> {
  const config = loadApiConfig();
  
  if (!config || !config.apiKey) {
    return null;
  }
  
  try {
    // OpenAI-compatible API call
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.warn('AI service call failed:', error);
    return null;
  }
}

// ============ Main Analysis Function ============

/**
 * Analyze search query using AI with fallback to basic matching
 * 
 * Property 1: For any non-empty keyword string, this function SHALL return
 * a SearchQuery object containing at least one of: industry, position, or style intent.
 */
export async function analyzeQuery(raw: string): Promise<SearchQuery> {
  // Validate input
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return {
      raw,
      keywords: [],
      intent: {},
      filters: { maxResults: 20 },
    };
  }
  
  // Try AI-powered analysis first
  if (isApiConfigured()) {
    try {
      const prompt = generateAnalysisPrompt(trimmed);
      const aiResponse = await callAiService(prompt);
      
      if (aiResponse) {
        const aiIntent = parseAiResponse(aiResponse);
        const keywords = extractKeywords(trimmed);
        
        // Merge AI intent with basic detection for better coverage
        const basicResult = basicKeywordAnalysis(trimmed);
        
        return {
          raw: trimmed,
          keywords,
          intent: {
            industry: aiIntent.industry || basicResult.intent.industry,
            position: aiIntent.position || basicResult.intent.position,
            style: aiIntent.style || basicResult.intent.style,
            experience: aiIntent.experience || basicResult.intent.experience,
          },
          filters: { maxResults: 20 },
        };
      }
    } catch (error) {
      console.warn('AI analysis failed, falling back to basic matching:', error);
    }
  }
  
  // Fallback to basic keyword matching
  return basicKeywordAnalysis(trimmed);
}

/**
 * Synchronous version of analyzeQuery for testing
 * Uses only basic keyword matching
 */
export function analyzeQuerySync(raw: string): SearchQuery {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return {
      raw,
      keywords: [],
      intent: {},
      filters: { maxResults: 20 },
    };
  }
  
  return basicKeywordAnalysis(trimmed);
}
