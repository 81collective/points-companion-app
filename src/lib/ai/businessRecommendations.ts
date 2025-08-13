export type Recommendation = {
  card: {
    card_name: string;
    issuer: string;
    annual_fee: number;
    bonus_offer?: string;
    image?: string;
    nickname?: string;
    popular?: boolean;
  };
  business?: { id?: string; name: string; address?: string; latitude?: number; longitude?: number } | null;
  estimated_points: number; // per $100 baseline
  annual_value: number;
  match_score: number; // 0-100
  reasons: string[];
  reward_multiplier: number;
  target_category: string;
};

export async function getTopCardsForContext(args: {
  category?: string;
  businessId?: string;
  businessName?: string;
  lat?: number;
  lng?: number;
  limit?: number;
}): Promise<Recommendation[]> {
  const params = new URLSearchParams();
  if (args.category) params.set('category', args.category);
  if (args.businessId) params.set('businessId', args.businessId);
  if (args.businessName) params.set('businessName', args.businessName);
  if (typeof args.lat === 'number') params.set('lat', String(args.lat));
  if (typeof args.lng === 'number') params.set('lng', String(args.lng));
  const res = await fetch(`/api/cards/recommendations?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  const data = await res.json();
  const list = (data?.recommendations || []) as Recommendation[];
  return (args.limit ? list.slice(0, args.limit) : list);
}
