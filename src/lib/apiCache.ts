// Advanced Redis-like in-memory cache with LRU eviction, persistence, and advanced features
interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Estimated size in bytes
  tags?: string[]; // For cache invalidation by tags
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  sets: number;
  deletes: number;
  size: number; // Total cache size in bytes
  itemCount: number;
}

interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  defaultTTL: number; // Default TTL in milliseconds
  enablePersistence: boolean;
  persistenceKey: string;
  enableCompression: boolean;
  lruEnabled: boolean;
}

class AdvancedAPICache {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    itemCount: 0
  };

  private config: CacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB default
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    enablePersistence: true,
    persistenceKey: 'api-cache-persistence',
    enableCompression: false,
    lruEnabled: true
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Load persisted cache on initialization
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.loadPersistedCache();
    }

    // Set up periodic cleanup and persistence
    if (typeof global !== 'undefined') {
      setInterval(() => {
        this.cleanup();
        if (this.config.enablePersistence) {
          this.persistCache();
        }
      }, 60000); // Every minute
    }
  }

  // Generate cache key from request parameters with advanced hashing
  generateKey(params: Record<string, unknown>, prefix = 'api'): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, unknown>);

    const paramString = JSON.stringify(sortedParams);
    return `${prefix}:${this.simpleHash(paramString)}`;
  }

  // Simple hash function for cache keys
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Estimate size of data in bytes
  private estimateSize(data: unknown): number {
    const str = JSON.stringify(data);
    return str ? str.length * 2 : 0; // Rough estimate: 2 bytes per character
  }

  // Get cached data with LRU tracking
  get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.size -= entry.size;
      this.stats.itemCount--;
      this.stats.misses++;
      return null;
    }

    // Update LRU tracking
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;

    return entry.data as T;
  }

  // Set cache entry with advanced features
  set<T = unknown>(
    key: string,
    data: T,
    options: {
      ttl?: number;
      tags?: string[];
      compress?: boolean;
    } = {}
  ): void {
    const ttl = options.ttl || this.config.defaultTTL;
    const size = this.estimateSize(data);
    const now = Date.now();

    // Check if we need to evict entries to make room
    if (this.stats.size + size > this.config.maxSize) {
      this.evictLRU(size);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
      size,
      tags: options.tags
    };

    // Remove old entry if it exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.stats.size -= oldEntry.size;
      this.stats.itemCount--;
    }

    this.cache.set(key, entry);
    this.stats.size += size;
    this.stats.itemCount++;
    this.stats.sets++;
  }

  // LRU eviction
  private evictLRU(requiredSpace: number): void {
    if (!this.config.lruEnabled) return;

    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => {
        // Sort by access count, then by last accessed time
        if (a.accessCount !== b.accessCount) {
          return a.accessCount - b.accessCount;
        }
        return a.lastAccessed - b.lastAccessed;
      });

    let freedSpace = 0;
    for (const [key, entry] of entries) {
      if (freedSpace >= requiredSpace) break;

      this.cache.delete(key);
      this.stats.size -= entry.size;
      this.stats.itemCount--;
      this.stats.evictions++;
      freedSpace += entry.size;
    }
  }

  // Delete cache entry
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.stats.size -= entry.size;
      this.stats.itemCount--;
      this.stats.deletes++;
      return true;
    }
    return false;
  }

  // Clear cache by tags
  clearByTags(tags: string[]): number {
    let cleared = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        this.stats.size -= entry.size;
        this.stats.itemCount--;
        this.stats.deletes++;
        cleared++;
      }
    }
    return cleared;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.itemCount = 0;
    this.stats.deletes += this.stats.itemCount;
  }

  // Handle request deduplication with enhanced error handling
  async dedupe<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      ttl?: number;
      tags?: string[];
      useCache?: boolean;
    } = {}
  ): Promise<T> {
    // Check cache first if enabled
    if (options.useCache !== false) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Execute request and cache the promise
    const promise = requestFn()
      .then(result => {
        // Cache successful results
        if (options.useCache !== false) {
          this.set(key, result, {
            ttl: options.ttl,
            tags: options.tags
          });
        }
        return result;
      })
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get cache hit rate
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.stats.size -= entry.size;
        this.stats.itemCount--;
      }
    }
  }

  // Persist cache to localStorage
  private persistCache(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const persistableData = Array.from(this.cache.entries())
        .filter(([, entry]) => {
          // Only persist entries that haven't expired and aren't too large
          const now = Date.now();
          return (now - entry.timestamp < entry.ttl) && entry.size < 1024 * 1024; // < 1MB
        })
        .map(([key, entry]) => [key, {
          data: entry.data,
          timestamp: entry.timestamp,
          ttl: entry.ttl,
          accessCount: entry.accessCount,
          lastAccessed: entry.lastAccessed,
          size: entry.size,
          tags: entry.tags
        }]);

      localStorage.setItem(this.config.persistenceKey, JSON.stringify({
        data: persistableData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }

  // Load persisted cache from localStorage
  private loadPersistedCache(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const persisted = localStorage.getItem(this.config.persistenceKey);
      if (!persisted) return;

      const { data, timestamp } = JSON.parse(persisted);
      const now = Date.now();

      // Only load if persisted within last 24 hours
      if (now - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(this.config.persistenceKey);
        return;
      }

      for (const [key, entry] of data) {
        // Check if entry is still valid
        if (now - entry.timestamp < entry.ttl) {
          this.cache.set(key, entry);
          this.stats.size += entry.size;
          this.stats.itemCount++;
        }
      }

      console.log(`Loaded ${this.stats.itemCount} persisted cache entries`);
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
      localStorage.removeItem(this.config.persistenceKey);
    }
  }

  // Warm up cache with frequently accessed data
  async warmup(keys: string[]): Promise<void> {
    const warmupPromises = keys.map(async (key) => {
      // This would typically fetch from a fast source or pre-computed data
      // For now, just ensure the key exists in cache
      return this.cache.has(key);
    });

    await Promise.all(warmupPromises);
  }
}

// Global advanced cache instance with optimized settings
export const advancedApiCache = new AdvancedAPICache({
  maxSize: 100 * 1024 * 1024, // 100MB for better performance
  defaultTTL: 10 * 60 * 1000, // 10 minutes for better cache hit rates
  enablePersistence: true,
  persistenceKey: 'points-companion-cache-v2',
  enableCompression: false, // Can be enabled later with compression library
  lruEnabled: true
});

// Legacy cache instance for backward compatibility
export const apiCache = advancedApiCache;

// Cache warming utility
export const warmupCache = async (frequentlyUsedKeys: string[]) => {
  await advancedApiCache.warmup(frequentlyUsedKeys);
};

// Cache monitoring utility
export const getCacheMetrics = () => {
  const stats = advancedApiCache.getStats();
  const hitRate = advancedApiCache.getHitRate();

  return {
    ...stats,
    hitRate: `${(hitRate * 100).toFixed(2)}%`,
    sizeFormatted: `${(stats.size / 1024 / 1024).toFixed(2)}MB`,
    efficiency: hitRate > 0.8 ? 'Excellent' : hitRate > 0.6 ? 'Good' : 'Needs Optimization'
  };
};
