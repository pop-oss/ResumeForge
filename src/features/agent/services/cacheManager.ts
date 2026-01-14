/**
 * Template Cache Manager
 * 模板缓存管理器 - 使用 localStorage 存储搜索结果
 * 
 * Features:
 * - TTL-based expiration (24 hours)
 * - LRU eviction when at capacity
 * - Query-based cache lookup
 */

import type { CacheEntry, CacheConfig, TemplateSearchResult } from '../types';
import { CACHE_CONFIG, CACHE_STORAGE_KEY } from '../constants';

export interface CacheStore {
  entries: Record<string, CacheEntry<TemplateSearchResult[]>>;
  accessOrder: string[]; // For LRU tracking, most recent at end
}

/**
 * Normalize query string for consistent cache keys
 */
export function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if a cache entry is expired
 */
export function isExpired(entry: CacheEntry<unknown>, config: CacheConfig = CACHE_CONFIG): boolean {
  const now = Date.now();
  return (now - entry.timestamp) >= config.maxAge;
}

/**
 * Load cache store from localStorage
 */
export function loadCacheStore(): CacheStore {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CacheStore;
      // Validate structure
      if (parsed.entries && parsed.accessOrder) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load cache store:', error);
  }
  return { entries: {}, accessOrder: [] };
}

/**
 * Save cache store to localStorage
 */
export function saveCacheStore(store: CacheStore): void {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.warn('Failed to save cache store:', error);
  }
}

/**
 * Get cached results for a query
 * Returns null if not found or expired
 */
export function getCachedResults(
  query: string,
  config: CacheConfig = CACHE_CONFIG
): TemplateSearchResult[] | null {
  const store = loadCacheStore();
  const normalizedQuery = normalizeQuery(query);
  const entry = store.entries[normalizedQuery];

  if (!entry) {
    return null;
  }

  // Check if expired
  if (isExpired(entry, config)) {
    // Remove expired entry
    delete store.entries[normalizedQuery];
    store.accessOrder = store.accessOrder.filter(q => q !== normalizedQuery);
    saveCacheStore(store);
    return null;
  }

  // Update access order for LRU
  store.accessOrder = store.accessOrder.filter(q => q !== normalizedQuery);
  store.accessOrder.push(normalizedQuery);
  saveCacheStore(store);

  return entry.data;
}

/**
 * Store search results in cache
 * Implements LRU eviction when at capacity
 */
export function setCachedResults(
  query: string,
  results: TemplateSearchResult[],
  config: CacheConfig = CACHE_CONFIG
): void {
  const store = loadCacheStore();
  const normalizedQuery = normalizeQuery(query);

  // First, clean up expired entries
  cleanExpiredEntries(store, config);

  // Check if we need to evict (LRU)
  while (store.accessOrder.length >= config.maxSize) {
    const oldestQuery = store.accessOrder.shift();
    if (oldestQuery) {
      delete store.entries[oldestQuery];
    }
  }

  // Add new entry
  store.entries[normalizedQuery] = {
    data: results,
    timestamp: Date.now(),
    query: normalizedQuery,
  };

  // Update access order
  store.accessOrder = store.accessOrder.filter(q => q !== normalizedQuery);
  store.accessOrder.push(normalizedQuery);

  saveCacheStore(store);
}

/**
 * Remove expired entries from cache
 */
export function cleanExpiredEntries(
  store: CacheStore,
  config: CacheConfig = CACHE_CONFIG
): void {
  const expiredQueries: string[] = [];

  for (const [query, entry] of Object.entries(store.entries)) {
    if (isExpired(entry, config)) {
      expiredQueries.push(query);
    }
  }

  for (const query of expiredQueries) {
    delete store.entries[query];
    store.accessOrder = store.accessOrder.filter(q => q !== query);
  }
}

/**
 * Invalidate a specific cache entry
 */
export function invalidateCache(query: string): void {
  const store = loadCacheStore();
  const normalizedQuery = normalizeQuery(query);

  delete store.entries[normalizedQuery];
  store.accessOrder = store.accessOrder.filter(q => q !== normalizedQuery);

  saveCacheStore(store);
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  localStorage.removeItem(CACHE_STORAGE_KEY);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; oldestTimestamp: number | null } {
  const store = loadCacheStore();
  const entries = Object.values(store.entries);

  if (entries.length === 0) {
    return { size: 0, oldestTimestamp: null };
  }

  const oldestTimestamp = Math.min(...entries.map(e => e.timestamp));
  return { size: entries.length, oldestTimestamp };
}

/**
 * Check if a query exists in cache (regardless of expiration)
 */
export function hasCache(query: string): boolean {
  const store = loadCacheStore();
  const normalizedQuery = normalizeQuery(query);
  return normalizedQuery in store.entries;
}

/**
 * Get all cached queries (for debugging/testing)
 */
export function getCachedQueries(): string[] {
  const store = loadCacheStore();
  return [...store.accessOrder];
}
