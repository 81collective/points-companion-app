import { CardRecommendation } from '@/types/location.types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function fetchRecommendations(
  category: string,
  lat?: number,
  lng?: number
): Promise<ApiResponse<CardRecommendation[]>> {
  try {
    const params = new URLSearchParams({ category });
    if (lat && lng) {
      params.append('lat', lat.toString());
      params.append('lng', lng.toString());
    }

    const response = await fetch(`/api/cards/recommendations?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, data: data.recommendations || [] };
    } else {
      return { success: false, error: data.error || 'Failed to fetch recommendations' };
    }
  } catch (err) {
    console.error('Failed to fetch recommendations:', err);
    return { success: false, error: err instanceof Error ? err.message : 'An unknown error occurred' };
  }
}
