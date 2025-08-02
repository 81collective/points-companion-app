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
        // Server-side API is now working! Try it first
        const serverResult = await fetchNearbyBusinessesFromApi(latitude, longitude, category, radius);
        
        // Server API should now return real Google Places data
        if (serverResult.success && serverResult.data) {
          console.log(`Found ${serverResult.data.length} businesses via server API`);
          return serverResult;
        }

        // Fallback to client-side only if server completely fails
        console.log('Server API failed, trying client-side Google Places as backup...');
        
        // Check if Google Maps is loaded for client-side fallback
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          const placesService = getClientPlacesService();
          const clientBusinesses = await placesService.searchNearby(latitude, longitude, category, radius);
          
          if (clientBusinesses.length > 0) {
            console.log(`Found ${clientBusinesses.length} businesses via client-side Google Places`);
            return { success: true, data: clientBusinesses };
          }
        }

        // If both fail, return server result (which might have sample data)
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
