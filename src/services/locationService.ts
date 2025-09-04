import { Business } from '@/types/location.types';
import { advancedApiCache } from '@/lib/apiCache';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type NearbyFetchOptions = {
  minRating?: number;
  openNow?: boolean;
  limit?: number;
  maxRadius?: number;
};

export async function fetchNearbyBusinesses(
  lat: number,
  lng: number,
  category: string,
  radius: number,
  options: NearbyFetchOptions = {}
): Promise<ApiResponse<Business[]>> {
  const cacheKey = advancedApiCache.generateKey({
    lat: lat.toFixed(4),
    lng: lng.toFixed(4),
    category,
    radius,
    minRating: options.minRating ?? '',
    openNow: options.openNow ?? '',
    limit: options.limit ?? '',
    maxRadius: options.maxRadius ?? ''
  }, 'location');

  // Try to get from cache first
  const cached = advancedApiCache.get<ApiResponse<Business[]>>(cacheKey);
  if (cached) {
    console.log('🔄 Using cached nearby businesses data');
    return cached;
  }

  // Cache miss - fetch from API
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      category,
      radius: String(radius),
    });
    if (options.minRating !== undefined) params.set('minRating', String(options.minRating));
    if (options.openNow !== undefined) params.set('openNow', String(options.openNow));
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.maxRadius !== undefined) params.set('maxRadius', String(options.maxRadius));

    const response = await fetch(`/api/location/nearby?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch nearby businesses');
    }

    const data = await response.json();

    const result: ApiResponse<Business[]> = data.success
      ? { success: true, data: data.businesses || [] }
      : { success: false, error: data.error || 'Failed to fetch businesses' };

    // Cache successful results for 10 minutes
    if (result.success) {
      advancedApiCache.set(cacheKey, result, {
        ttl: 10 * 60 * 1000, // 10 minutes
        tags: [
          'location',
          `category:${category}`,
          `radius:${radius}`,
          options.minRating !== undefined ? `minRating:${options.minRating}` : 'minRating:na',
          options.openNow !== undefined ? `openNow:${options.openNow}` : 'openNow:na',
          options.limit !== undefined ? `limit:${options.limit}` : 'limit:na',
          options.maxRadius !== undefined ? `maxRadius:${options.maxRadius}` : 'maxRadius:na',
        ]
      });
    }

    return result;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred'
    };
  }
}
