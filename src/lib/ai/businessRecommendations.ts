import type { Recommendation } from './responseFormatter';

export async function fetchTopRecommendations(params: {
  category?: string;
  businessId?: string;
  businessName?: string;
  lat?: number;
  lng?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.businessId) qs.set('businessId', params.businessId);
  if (params.businessName) qs.set('businessName', params.businessName);
  if (params.lat != null) qs.set('lat', String(params.lat));
  if (params.lng != null) qs.set('lng', String(params.lng));
  const res = await fetch(`/api/cards/recommendations?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to load recommendations');
  const data = await res.json();
  const recs: Recommendation[] = data?.recommendations || [];
  return recs.slice(0, params.limit ?? 3);
}
