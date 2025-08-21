// Memory management and monitoring utilities

interface PerformanceWithMemory extends Performance {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface WindowWithGC extends Window {
  gc(): void;
}

export class MemoryManager {
  private static instance: MemoryManager;
  private memoryThreshold = 50 * 1024 * 1024; // 50MB threshold
  private cleanupCallbacks: Array<() => void> = [];
  private intervalId?: NodeJS.Timeout;

  private constructor() {
    this.startMemoryMonitoring();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Start monitoring memory usage
  private startMemoryMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor every 30 seconds
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);
  }

  // Check current memory usage
  private checkMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const memory = (window.performance as PerformanceWithMemory).memory;
    if (!memory) return;

    const usedMemory = memory.usedJSHeapSize;
    const totalMemory = memory.totalJSHeapSize;
    const memoryLimit = memory.jsHeapSizeLimit;

    console.log('Memory usage:', {
      used: `${(usedMemory / 1024 / 1024).toFixed(2)}MB`,
      total: `${(totalMemory / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memoryLimit / 1024 / 1024).toFixed(2)}MB`,
      percentage: `${((usedMemory / memoryLimit) * 100).toFixed(1)}%`
    });

    // Trigger cleanup if memory usage is high
    if (usedMemory > this.memoryThreshold || (usedMemory / memoryLimit) > 0.8) {
      console.warn('High memory usage detected, triggering cleanup');
      this.performCleanup();
    }
  }

  // Register cleanup callback
  registerCleanup(callback: () => void) {
    this.cleanupCallbacks.push(callback);
  }

  // Perform memory cleanup
  performCleanup() {
    // Execute all cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });

    // Request garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      try {
        (window as WindowWithGC).gc();
      } catch (_error) {
        // Silently fail if gc is not available
      }
    }
  }

  // Get current memory stats
  getMemoryStats() {
    if (typeof window === 'undefined' || !('performance' in window)) return null;

    const memory = (window.performance as PerformanceWithMemory).memory;
    if (!memory) return null;

    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }

  // Clean up resources
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.cleanupCallbacks = [];
  }
}

// Cache management utilities
export class CacheManager {
  private static caches = new Map<string, Map<string, { data: unknown; timestamp: number; ttl: number }>>();
  private static maxCacheSize = 100; // Maximum entries per cache

  // Get cache for a specific key
  static getCache(cacheKey: string) {
    if (!this.caches.has(cacheKey)) {
      this.caches.set(cacheKey, new Map());
    }
    return this.caches.get(cacheKey)!;
  }

  // Set cache entry with automatic cleanup
  static set(cacheKey: string, key: string, data: unknown, ttl: number = 300000) {
    const cache = this.getCache(cacheKey);
    
    // Clean up expired entries if cache is getting large
    if (cache.size >= this.maxCacheSize) {
      this.cleanupExpired(cacheKey);
    }

    // If still too large, remove oldest entries
    if (cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(cache.keys())[0];
      cache.delete(oldestKey);
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Get cache entry
  static get(cacheKey: string, key: string) {
    const cache = this.getCache(cacheKey);
    const entry = cache.get(key);
    
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Clean up expired entries
  static cleanupExpired(cacheKey: string) {
    const cache = this.getCache(cacheKey);
    const now = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
      }
    }
  }

  // Clear all caches
  static clearAll() {
    this.caches.clear();
  }
}

// React hook for memory monitoring
export function useMemoryMonitor() {
  const memoryManager = MemoryManager.getInstance();
  
  return {
    getStats: () => memoryManager.getMemoryStats(),
    performCleanup: () => memoryManager.performCleanup(),
    registerCleanup: (callback: () => void) => memoryManager.registerCleanup(callback)
  };
}
