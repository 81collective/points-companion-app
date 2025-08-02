import { useQuery } from '@tanstack/react-query';
import { fetchNearbyBusinesses as fetchNearbyBusinessesFromApi } from '@/services/locationService';
import { Business } from '@/types/location.types';

interface UseNearbyBusinessesParams {
  latitude?: number;
  longitude?: number;
  category: string;
  radius: number;
  enabled?: boolean;
}

interface NearbyBusinessesResult {
  success: boolean;
  data?: Business[];
  error?: string;
}

export function useNearbyBusinesses({
  latitude,
  longitude,
  category,
  radius,
  enabled = true
}: UseNearbyBusinessesParams) {
  const query = useQuery<NearbyBusinessesResult, Error>({
    queryKey: ['nearbyBusinesses', latitude, longitude, category, radius],
    queryFn: async () => {
      if (!latitude || !longitude) {
        throw new Error('Location coordinates are required');
      }
      return await fetchNearbyBusinessesFromApi(latitude, longitude, category, radius);
    },
    enabled: enabled && !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });

  return {
    businesses: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || query.data?.error || null,
    refetch: query.refetch,
    isStale: query.isStale,
  };
}
