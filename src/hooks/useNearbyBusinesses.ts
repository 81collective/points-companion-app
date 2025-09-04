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
  minRating?: number;
  openNow?: boolean;
  limit?: number;
  maxRadius?: number;
}

interface NearbyBusinessesResult {
  success: boolean;
  data?: Business[];
  error?: string;
  source?: string;
  metadata?: {
    searchRadius: number;
    searchCategory: string;
    resultCount: number;
    searchTime: string;
  };
}

export function useNearbyBusinesses({
  latitude,
  longitude,
  category,
  radius,
  enabled = true,
  minRating,
  openNow,
  limit,
  maxRadius,
}: UseNearbyBusinessesParams) {
  const query = useQuery<NearbyBusinessesResult, Error>({
    queryKey: ['nearbyBusinesses', latitude, longitude, category, radius, minRating, openNow, limit, maxRadius],
    queryFn: async () => {
      if (!latitude || !longitude) {
        throw new Error('Location coordinates are required');
      }

      try {
        console.log('Enhanced nearby business search:', { 
          latitude, 
          longitude, 
          category: category || 'dining', 
          radius,
          timestamp: new Date().toISOString()
        });

        // Use enhanced fallback service for production-safe results
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          console.log('Using enhanced client-side Google Places with production fallback...');
          const placesService = getClientPlacesService();
          let businesses = await placesService.searchNearbyWithFallback(latitude, longitude, radius, category);

          // Apply client-side filters if provided to keep parity with server filters
          if (minRating !== undefined) {
            businesses = businesses.filter(b => (b.rating ?? 0) >= minRating);
          }
          if (openNow) {
            // clientPlacesService uses Google Places; results may carry opening_hours
            // If we don't have an explicit open-now flag, leave as-is
          }
          if (limit !== undefined) {
            businesses = businesses.slice(0, limit);
          }
          
          if (businesses.length > 0) {
            console.log(`Enhanced search found ${businesses.length} businesses`, {
              categories: businesses.reduce((acc, business) => {
                acc[business.category] = (acc[business.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>),
              avgDistance: Math.round(
                businesses.reduce((sum, b) => sum + b.distance, 0) / businesses.length
              ),
              hasRatings: businesses.filter(b => b.rating).length,
              topRated: businesses
                .filter(b => b.rating)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 3)
                .map(b => ({ name: b.name, rating: b.rating }))
            });
            
            return { 
              success: true, 
              data: businesses,
              source: 'enhanced_client_places',
              metadata: {
                searchRadius: radius,
                searchCategory: category || 'dining',
                resultCount: businesses.length,
                searchTime: new Date().toISOString()
              }
            };
          }
        }

        // Fallback to server-only API if enhanced client-side isn't available
        console.log('Enhanced client-side not available, trying server-only API...');
  const serverResult = await fetchNearbyBusinessesFromApi(latitude, longitude, category, radius, { minRating, openNow, limit, maxRadius });
        
        if (serverResult.success && serverResult.data) {
          console.log(`Found ${serverResult.data.length} businesses via server API`);
          
          // Enhance server results with better categorization
          const enhancedServerData = serverResult.data.map((business: Business) => ({
            ...business,
            category: business.category || 'services', // Ensure category is set
            distance: business.distance || 0 // Ensure distance is set
          }));
          
          return {
            ...serverResult,
            data: enhancedServerData,
            source: 'enhanced_server_api'
          };
        }

        // Return server result even if empty (may contain sample data)
        return {
          ...serverResult,
          source: 'server_fallback'
        };
        
      } catch (error) {
        console.error('Error in enhanced useNearbyBusinesses:', error);
        throw error;
      }
    },
    enabled: enabled && !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes - matches enhanced cache TTL
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  return {
    businesses: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || query.data?.error || null,
    refetch: query.refetch,
    isStale: query.isStale,
    metadata: query.data?.metadata || null,
    source: query.data?.source || 'unknown',
  };
}
