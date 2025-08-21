// Simple in-memory cache with request deduplication
class APICache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  // Generate cache key from request parameters
  generateKey(params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, unknown>);
    
    return JSON.stringify(sortedParams);
  }

  // Get cached data if valid
  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Set cache entry with TTL
  set(key: string, data: unknown, ttlMs: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  // Handle request deduplication
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Execute request and cache the promise
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Clear expired entries (cleanup)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const apiCache = new APICache();

// Run cleanup every 10 minutes
if (typeof global !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 600000);
}
