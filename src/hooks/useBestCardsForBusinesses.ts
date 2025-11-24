import { useQuery } from '@tanstack/react-query';
import { fetchRecommendations as fetchRecommendationsFromApi } from '@/services/cardService';
import type { Business, CardRecommendation } from '@/types/location.types';

interface UseBestCardsForBusinessesParams {
  category: string;
  latitude?: number;
  longitude?: number;
  businesses: Business[];
  enabled?: boolean;
  limit?: number;
}

export interface BestCardForBusiness {
  business: Business;
  recommendation: CardRecommendation | null;
}

export function useBestCardsForBusinesses({
  category,
  latitude,
  longitude,
  businesses,
  enabled = true,
  limit = 5,
}: UseBestCardsForBusinessesParams) {
  const keyBusinesses = businesses.slice(0, limit).map(b => `${b.id}:${b.name}`);

  const query = useQuery<{ items: BestCardForBusiness[] }, Error>({
    queryKey: ['bestCardsForBusinesses', category, latitude, longitude, keyBusinesses],
    queryFn: async () => {
      const top = businesses.slice(0, limit);
      const results = await Promise.all(
        top.map(async (b) => {
          try {
            const res = await fetchRecommendationsFromApi(category, latitude, longitude, b.id, b.name);
            const recs = res.data || [];
            // pick best by match_score then annual_value
            const best = recs.reduce<CardRecommendation | null>((best, cur) => {
              if (!best) return cur;
              const scoreDelta = (cur.match_score ?? 0) - (best.match_score ?? 0);
              if (Math.abs(scoreDelta) < 5) {
                return (cur.annual_value ?? 0) > (best.annual_value ?? 0) ? cur : best;
              }
              return scoreDelta > 0 ? cur : best;
            }, null);
            return { business: b, recommendation: best } as BestCardForBusiness;
          } catch (_e) {
            return { business: b, recommendation: null } as BestCardForBusiness;
          }
        })
      );
      return { items: results };
    },
    enabled: enabled && businesses.length > 0,
    staleTime: 60_000,
  });

  return {
    items: query.data?.items || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
}

// Make sure this file is a module
export {};
