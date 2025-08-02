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
        // Use enhanced fallback service for production-safe results
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          console.log('Using client-side Google Places with production fallback...');
          const placesService = getClientPlacesService();
          const businesses = await placesService.searchNearbyWithFallback(latitude, longitude, radius, category);
          
          if (businesses.length > 0) {
            console.log(`Found ${businesses.length} businesses via enhanced fallback`);
            return { success: true, data: businesses };
          }
        }

        // Fallback to server-only API if client-side isn't available
        console.log('Client-side not available, trying server-only API...');
        const serverResult = await fetchNearbyBusinessesFromApi(latitude, longitude, category, radius);
        
        if (serverResult.success && serverResult.data) {
          console.log(`Found ${serverResult.data.length} businesses via server API`);
          return serverResult;
        }

        // Return server result even if empty (may contain sample data)
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
