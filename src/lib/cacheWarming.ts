// Cache warming and prefetching utilities for optimal performance
import React from 'react';
interface WarmupConfig {
  enabled: boolean;
  priority: 'low' | 'normal' | 'high';
  timeout: number; // milliseconds
  retryAttempts: number;
  batchSize: number;
}

interface WarmupItem {
  key: string;
  url: string;
  priority: 'low' | 'normal' | 'high';
  data?: unknown;
  dependencies?: string[]; // Other cache keys this depends on
}

class CacheWarmer {
  private config: WarmupConfig = {
    enabled: true,
    priority: 'normal',
    timeout: 10000, // 10 seconds
    retryAttempts: 2,
    batchSize: 5
  };

  private warmupQueue: WarmupItem[] = [];
  private isWarming = false;

  constructor(config?: Partial<WarmupConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // Add item to warmup queue
  addToWarmupQueue(
    key: string,
    url: string,
    options: {
      priority?: WarmupItem['priority'];
      data?: unknown;
      dependencies?: string[];
    } = {}
  ): void {
    const item: WarmupItem = {
      key,
      url,
      priority: options.priority || this.config.priority,
      data: options.data,
      dependencies: options.dependencies
    };

    this.warmupQueue.push(item);

    // Sort by priority
    this.warmupQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Execute cache warming
  async warmup(): Promise<void> {
    if (!this.config.enabled || this.isWarming || this.warmupQueue.length === 0) {
      return;
    }

    this.isWarming = true;

    try {
      // Process in batches
      while (this.warmupQueue.length > 0) {
        const batch = this.warmupQueue.splice(0, this.config.batchSize);

        await Promise.allSettled(
          batch.map(item => this.warmupItem(item))
        );
      }
    } catch (error) {
      console.error('Cache warming failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  // Warm up individual item
  private async warmupItem(item: WarmupItem): Promise<void> {
    try {
      // Check if dependencies are met
      if (item.dependencies && item.dependencies.length > 0) {
        const missingDeps = item.dependencies.filter(dep => !this.isInCache(dep));
        if (missingDeps.length > 0) {
          console.log(`Skipping warmup for ${item.key}, missing dependencies:`, missingDeps);
          return;
        }
      }

      // Fetch and cache the data
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(item.url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache', // Force fresh data for warmup
          'X-Warmup-Request': 'true'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the warmed data
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(`warmup_${item.key}`, JSON.stringify({
            data,
            timestamp: Date.now(),
            ttl: 30 * 60 * 1000 // 30 minutes for warmed data
          }));
        } catch (error) {
          console.warn('Failed to cache warmed data:', error);
        }
      }

      console.log(`Successfully warmed cache for ${item.key}`);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Warmup timeout for ${item.key}`);
      } else {
        console.error(`Failed to warmup ${item.key}:`, error);
      }

      // Retry logic
      if (item.priority === 'high' && this.config.retryAttempts > 0) {
        setTimeout(() => {
          this.warmupItem(item);
        }, 2000); // Retry after 2 seconds
      }
    }
  }

  // Check if item is in cache
  private isInCache(key: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;

    try {
      const cached = localStorage.getItem(`warmup_${key}`);
      if (!cached) return false;

      const { timestamp, ttl } = JSON.parse(cached);
      return Date.now() - timestamp < ttl;
    } catch {
      return false;
    }
  }

  // Get warmed data
  getWarmedData(key: string): unknown | null {
    if (!this.isInCache(key)) return null;

    try {
      const cached = localStorage.getItem(`warmup_${key}`);
      if (!cached) return null;

      const { data } = JSON.parse(cached);
      return data;
    } catch {
      return null;
    }
  }

  // Clear warmed cache
  clearWarmedCache(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const keys = Object.keys(localStorage).filter(key => key.startsWith('warmup_'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Get warmup status
  getWarmupStatus() {
    return {
      isWarming: this.isWarming,
      queueLength: this.warmupQueue.length,
      enabled: this.config.enabled
    };
  }
}

// Global cache warmer instance
export const cacheWarmer = new CacheWarmer();

// Predefined warmup strategies for common scenarios
export const WarmupStrategies = {
  // Warmup user dashboard data
  DASHBOARD: (userId: string) => [
    {
      key: `user_${userId}_cards`,
      url: `/api/cards/user/${userId}`,
      priority: 'high' as const
    },
    {
      key: `user_${userId}_analytics`,
      url: `/api/analytics/user/${userId}`,
      priority: 'normal' as const
    },
    {
      key: `user_${userId}_transactions`,
      url: `/api/transactions/user/${userId}?limit=10`,
      priority: 'normal' as const
    }
  ],

  // Warmup location-based data
  LOCATION: (lat: number, lng: number) => [
    {
      key: `nearby_${lat}_${lng}`,
      url: `/api/location/nearby?lat=${lat}&lng=${lng}&radius=5000`,
      priority: 'high' as const
    },
    {
      key: `categories_${lat}_${lng}`,
      url: `/api/location/categories?lat=${lat}&lng=${lng}`,
      priority: 'normal' as const
    }
  ],

  // Warmup recommendations
  RECOMMENDATIONS: (userId: string, category: string) => [
    {
      key: `recommendations_${userId}_${category}`,
      url: `/api/cards/recommendations?category=${category}&userId=${userId}`,
      priority: 'high' as const,
      dependencies: [`user_${userId}_cards`]
    }
  ]
};

// Utility to warmup based on user context
export const warmupForUser = async (userId: string, context: {
  location?: { lat: number; lng: number };
  currentCategory?: string;
} = {}) => {
  if (!cacheWarmer.getWarmupStatus().enabled) return;

  // Add dashboard data
  const dashboardItems = WarmupStrategies.DASHBOARD(userId);
  dashboardItems.forEach(item => cacheWarmer.addToWarmupQueue(item.key, item.url, { priority: item.priority }));

  // Add location data if available
  if (context.location) {
    const locationItems = WarmupStrategies.LOCATION(context.location.lat, context.location.lng);
    locationItems.forEach(item => cacheWarmer.addToWarmupQueue(item.key, item.url, { priority: item.priority }));
  }

  // Add recommendations if category is specified
  if (context.currentCategory) {
    const recommendationItems = WarmupStrategies.RECOMMENDATIONS(userId, context.currentCategory);
    recommendationItems.forEach(item => cacheWarmer.addToWarmupQueue(item.key, item.url, {
      priority: item.priority,
      dependencies: item.dependencies
    }));
  }

  // Execute warmup
  await cacheWarmer.warmup();
};

// Prefetch utility for critical resources
export const prefetchCriticalResources = async (resources: string[]) => {
  const prefetchPromises = resources.map(async (url) => {
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);

      // Wait for prefetch to complete
      return new Promise((resolve, reject) => {
        link.onload = resolve;
        link.onerror = reject;
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Prefetch timeout')), 5000);
      });
    } catch (error) {
      console.warn(`Failed to prefetch ${url}:`, error);
    }
  });

  await Promise.allSettled(prefetchPromises);
};

// React hook for cache warming
export const useCacheWarming = () => {
  const [status, setStatus] = React.useState(cacheWarmer.getWarmupStatus());

  React.useEffect(() => {
    const updateStatus = () => setStatus(cacheWarmer.getWarmupStatus());

    // Update status periodically
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    warmupForUser,
    prefetchCriticalResources,
    clearWarmedCache: cacheWarmer.clearWarmedCache.bind(cacheWarmer),
    getWarmedData: cacheWarmer.getWarmedData.bind(cacheWarmer)
  };
};
