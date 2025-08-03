import { useQuery } from '@tanstack/react-query';
import { fetchRecommendations as fetchRecommendationsFromApi } from '@/services/cardService';
import { CardRecommendation } from '@/types/location.types';

interface UseCardRecommendationsParams {
  category: string;
  latitude?: number;
  longitude?: number;
  businessId?: string;
  businessName?: string;
  enabled?: boolean;
}

interface CardRecommendationsResult {
  success: boolean;
  data?: CardRecommendation[];
  error?: string;
}

export function useCardRecommendations({
  category,
  latitude,
  longitude,
  businessId,
  businessName,
  enabled = true
}: UseCardRecommendationsParams) {
  const query = useQuery<CardRecommendationsResult, Error>({
    queryKey: ['cardRecommendations', category, latitude, longitude, businessId, businessName],
    queryFn: async () => {
      console.log('🎯 useCardRecommendations API call:', { 
        category, 
        businessId, 
        businessName, 
        latitude, 
        longitude,
        enabled 
      });
      console.log('🎯 businessName type:', typeof businessName, 'value:', businessName);
      return await fetchRecommendationsFromApi(category, latitude, longitude, businessId, businessName);
    },
    enabled: enabled,
    staleTime: 0, // No caching for debugging
    gcTime: 1000, // 1 second for debugging
    retry: 2,
  });

  return {
    recommendations: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || query.data?.error || null,
    refetch: query.refetch,
    isStale: query.isStale,
  };
}
