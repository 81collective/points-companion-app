// HTTP caching headers optimization and cache control utilities
interface CacheControlOptions {
  maxAge?: number; // seconds
  sMaxAge?: number; // seconds (for CDNs)
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  proxyRevalidate?: boolean;
  immutable?: boolean;
  staleWhileRevalidate?: number; // seconds
  staleIfError?: number; // seconds
}

interface CacheHeaders {
  'Cache-Control': string;
  'ETag'?: string;
  'Last-Modified'?: string;
  'Expires'?: string;
  'Vary'?: string;
}

class HTTPCacheManager {
  // Generate optimized Cache-Control header
  static generateCacheControl(options: CacheControlOptions): string {
    const directives: string[] = [];

    if (options.noStore) {
      directives.push('no-store');
    } else if (options.noCache) {
      directives.push('no-cache');
    } else if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`);
    }

    if (options.sMaxAge !== undefined) {
      directives.push(`s-maxage=${options.sMaxAge}`);
    }

    if (options.mustRevalidate) {
      directives.push('must-revalidate');
    }

    if (options.proxyRevalidate) {
      directives.push('proxy-revalidate');
    }

    if (options.immutable) {
      directives.push('immutable');
    }

    if (options.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }

    if (options.staleIfError !== undefined) {
      directives.push(`stale-if-error=${options.staleIfError}`);
    }

    return directives.join(', ');
  }

  // Get optimized headers for different resource types
  static getOptimizedHeaders(resourceType: string, customOptions?: Partial<CacheControlOptions>): CacheHeaders {
    const baseHeaders: CacheHeaders = {
      'Cache-Control': ''
    };

    switch (resourceType) {
      case 'static':
        // Static assets: cache aggressively
        baseHeaders['Cache-Control'] = this.generateCacheControl({
          maxAge: 31536000, // 1 year
          immutable: true,
          ...customOptions
        });
        break;

      case 'api':
        // API responses: short cache with revalidation
        baseHeaders['Cache-Control'] = this.generateCacheControl({
          maxAge: 300, // 5 minutes
          staleWhileRevalidate: 600, // 10 minutes
          ...customOptions
        });
        break;

      case 'user-data':
        // User-specific data: no cache
        baseHeaders['Cache-Control'] = this.generateCacheControl({
          noCache: true,
          ...customOptions
        });
        break;

      case 'dynamic':
        // Dynamic content: short cache
        baseHeaders['Cache-Control'] = this.generateCacheControl({
          maxAge: 60, // 1 minute
          staleWhileRevalidate: 300, // 5 minutes
          ...customOptions
        });
        break;

      case 'html':
        // HTML pages: no cache for dynamic content
        baseHeaders['Cache-Control'] = this.generateCacheControl({
          noCache: true,
          ...customOptions
        });
        break;

      default:
        baseHeaders['Cache-Control'] = this.generateCacheControl({
          maxAge: 300, // 5 minutes default
          ...customOptions
        });
    }

    return baseHeaders;
  }

  // Generate ETag for content
  static async generateETag(content: string | Buffer): Promise<string> {
    const crypto = globalThis.crypto;
    if (crypto && crypto.subtle) {
      // Use Web Crypto API for better ETags
      const encoder = new TextEncoder();
      const data = typeof content === 'string' ? encoder.encode(content) : new Uint8Array(content);
      const hash = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hash));
      return `"${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}"`;
    } else {
      // Fallback to simple hash
      let hash = 0;
      const str = typeof content === 'string' ? content : content.toString();
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `"${Math.abs(hash).toString(36)}"`;
    }
  }

  // Check if request matches cached ETag
  static checkETagMatch(requestETag: string | null, currentETag: string): boolean {
    if (!requestETag) return false;

    // Handle weak ETags
    const cleanRequestETag = requestETag.replace(/^W\//, '');
    const cleanCurrentETag = currentETag.replace(/^W\//, '');

    return cleanRequestETag === cleanCurrentETag;
  }

  // Generate Last-Modified header
  static generateLastModified(date: Date = new Date()): string {
    return date.toUTCString();
  }

  // Check if content is modified since given date
  static isModifiedSince(requestDate: string | null, lastModified: string): boolean {
    if (!requestDate) return true;

    const requestTime = new Date(requestDate).getTime();
    const lastModifiedTime = new Date(lastModified).getTime();

    return requestTime < lastModifiedTime;
  }

  // Generate Vary header for proper caching
  static generateVaryHeader(varyFields: string[]): string {
    return varyFields.join(', ');
  }

  // Get comprehensive cache headers for API responses
  static async getAPIHeaders(options: {
    resourceType?: string;
    customCacheOptions?: Partial<CacheControlOptions>;
    includeETag?: boolean;
    content?: string | Buffer;
    lastModified?: Date;
    varyFields?: string[];
  } = {}): Promise<CacheHeaders> {
    const {
      resourceType = 'api',
      customCacheOptions,
      includeETag = true,
      content,
      lastModified,
      varyFields = ['Accept', 'Authorization']
    } = options;

    const headers = this.getOptimizedHeaders(resourceType, customCacheOptions);

    if (includeETag && content) {
      headers.ETag = await this.generateETag(content);
    }

    if (lastModified) {
      headers['Last-Modified'] = this.generateLastModified(lastModified);
    }

    if (varyFields.length > 0) {
      headers.Vary = this.generateVaryHeader(varyFields);
    }

    return headers;
  }
}

// Predefined cache strategies for common use cases
export const CacheStrategies = {
  // Static assets (JS, CSS, images)
  STATIC: {
    resourceType: 'static' as const,
    customCacheOptions: { maxAge: 31536000, immutable: true }
  },

  // API responses with short cache
  API_SHORT: {
    resourceType: 'api' as const,
    customCacheOptions: { maxAge: 300, staleWhileRevalidate: 600 }
  },

  // API responses with long cache
  API_LONG: {
    resourceType: 'api' as const,
    customCacheOptions: { maxAge: 3600, staleWhileRevalidate: 7200 }
  },

  // User-specific data (no cache)
  USER_DATA: {
    resourceType: 'user-data' as const,
    customCacheOptions: { noCache: true }
  },

  // Dynamic content
  DYNAMIC: {
    resourceType: 'dynamic' as const,
    customCacheOptions: { maxAge: 60, staleWhileRevalidate: 300 }
  },

  // HTML pages
  HTML: {
    resourceType: 'html' as const,
    customCacheOptions: { noCache: true }
  }
};

// Utility function to apply cache headers to Next.js API responses
export const applyCacheHeaders = async (
  response: { setHeader: (key: string, value: string) => void },
  strategy: keyof typeof CacheStrategies,
  options?: {
    content?: string | Buffer;
    lastModified?: Date;
    varyFields?: string[];
  }
) => {
  const strategyConfig = CacheStrategies[strategy];
  const headers = await HTTPCacheManager.getAPIHeaders({
    ...strategyConfig,
    ...options
  });

  // Apply headers to Next.js response
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.setHeader(key, value);
    }
  });

  return response;
};

// Cache invalidation utilities
export const CacheInvalidation = {
  // Generate cache key for invalidation
  generateInvalidationKey(endpoint: string, params?: Record<string, unknown>): string {
    const baseKey = endpoint.replace('/api/', '');
    if (params) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');
      return `${baseKey}:${sortedParams}`;
    }
    return baseKey;
  },

  // Invalidate cache by pattern
  invalidateByPattern(pattern: string): void {
    // This would integrate with your cache store to invalidate by pattern
    // For now, it's a placeholder for future implementation
    console.log(`Invalidating cache pattern: ${pattern}`);
  },

  // Invalidate user-specific cache
  invalidateUserCache(userId: string): void {
    this.invalidateByPattern(`user:${userId}:*`);
  },

  // Invalidate location-based cache
  invalidateLocationCache(lat: number, lng: number, radius: number): void {
    this.invalidateByPattern(`location:${lat}:${lng}:${radius}`);
  }
};

export default HTTPCacheManager;
