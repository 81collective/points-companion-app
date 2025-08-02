import { useQuery } from '@tanstack/react-query';
import { fetchNearbyBusinesses as fetchNearbyBusinessesFromApi } from '@/services/locationService';
import { getClientPlacesService } from '@/services/clientPlacesService';
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

      try {
        // First try the server-side API
        const serverResult = await fetchNearbyBusinessesFromApi(latitude, longitude, category, radius);
        
        // If server API works and returns results, use them
        if (serverResult.success && serverResult.data && serverResult.data.length > 0) {
          return serverResult;
        }

        // If server API fails or returns no results, try client-side Google Places
        console.log('Server API returned no results, trying client-side Google Places...');
        
        // Check if Google Maps is loaded
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          const placesService = getClientPlacesService();
          const clientBusinesses = await placesService.searchNearby(latitude, longitude, category, radius);
          
          if (clientBusinesses.length > 0) {
            console.log(`Found ${clientBusinesses.length} businesses via client-side Google Places`);
            return { success: true, data: clientBusinesses };
          }
        }

        // If both fail, return the server result (which might have sample data)
        return serverResult;
        
      } catch (error) {
        console.error('Error in useNearbyBusinesses:', error);
        throw error;
      }
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
