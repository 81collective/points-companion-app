import { Business } from '@/types/location.types';
import { advancedApiCache } from '@/lib/apiCache';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchNearbyBusinesses(
  lat: number,
  lng: number,
  category: string,
  radius: number
): Promise<ApiResponse<Business[]>> {
  const cacheKey = advancedApiCache.generateKey({
    lat: lat.toFixed(4),
    lng: lng.toFixed(4),
    category,
    radius
  }, 'location');

  // Try to get from cache first
  const cached = advancedApiCache.get<ApiResponse<Business[]>>(cacheKey);
  if (cached) {
    console.log('🔄 Using cached nearby businesses data');
    return cached;
  }

  // Cache miss - fetch from API
  try {
    const response = await fetch(
      `/api/location/nearby?lat=${lat}&lng=${lng}&category=${category}&radius=${radius}`
    );

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
        tags: ['location', `category:${category}`, `radius:${radius}`]
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
