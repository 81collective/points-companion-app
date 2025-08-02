import { useQuery } from '@tanstack/react-query';
import { fetchRecommendations as fetchRecommendationsFromApi } from '@/services/cardService';
import { CardRecommendation } from '@/types/location.types';

interface UseCardRecommendationsParams {
  category: string;
  latitude?: number;
  longitude?: number;
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
  enabled = true
}: UseCardRecommendationsParams) {
  const query = useQuery<CardRecommendationsResult, Error>({
    queryKey: ['cardRecommendations', category, latitude, longitude],
    queryFn: async () => {
      return await fetchRecommendationsFromApi(category, latitude, longitude);
    },
    enabled: enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
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
