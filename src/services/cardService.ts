import { CardRecommendation } from '@/types/location.types';
import { advancedApiCache } from '@/lib/apiCache';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchRecommendations(
  category: string,
  lat?: number,
  lng?: number,
  businessId?: string,
  businessName?: string
): Promise<ApiResponse<CardRecommendation[]>> {
  const cacheKey = advancedApiCache.generateKey({
    category,
    lat: lat?.toFixed(4),
    lng: lng?.toFixed(4),
    businessId,
    businessName
  }, 'recommendations');

  // Try to get from cache first
  const cached = advancedApiCache.get<ApiResponse<CardRecommendation[]>>(cacheKey);
  if (cached) {
    console.log('🔄 Using cached recommendations data');
    return cached;
  }

  // Cache miss - fetch from API
  try {
    const params = new URLSearchParams({ category });
    if (lat && lng) {
      params.append('lat', lat.toString());
      params.append('lng', lng.toString());
    }
    if (businessId) {
      params.append('businessId', businessId);
    }
    if (businessName) {
      params.append('businessName', businessName);
    }

    const url = `/api/cards/recommendations?${params}`;
    console.log('🌐 Calling recommendations API:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }

    const data = await response.json();

    const result: ApiResponse<CardRecommendation[]> = data.success
      ? { success: true, data: data.recommendations || [] }
      : { success: false, error: data.error || 'Failed to fetch recommendations' };

    // Cache successful results for 15 minutes
    if (result.success) {
      const tags = ['recommendations', `category:${category}`];
      if (businessId) {
        tags.push(`business:${businessId}`);
      }

      advancedApiCache.set(cacheKey, result, {
        ttl: 15 * 60 * 1000, // 15 minutes
        tags
      });
    }

    return result;
  } catch (err) {
    console.error('Failed to fetch recommendations:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred'
    };
  }
}
