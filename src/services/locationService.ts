import { Business } from '@/types/location.types';

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
  try {
    const response = await fetch(
      `/api/location/nearby?lat=${lat}&lng=${lng}&category=${category}&radius=${radius}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch nearby businesses');
    }

    const data = await response.json();

    if (data.success) {
      return { success: true, data: data.businesses || [] };
    } else {
      return { success: false, error: data.error || 'Failed to fetch businesses' };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unknown error occurred' };
  }
}
