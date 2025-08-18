import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { CATEGORY_MAP, CategoryKey } from '@/lib/places/categories';
import { scorePlace, haversineMeters, type BasicPlace } from '@/lib/places/score';

type LatLng = { lat: number; lng: number };

type GooglePlaceResult = {
  name?: string;
  vicinity?: string;
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
  place_id?: string;
  rating?: number;
  price_level?: number;
  business_status?: string;
  opening_hours?: { open_now?: boolean };
  user_ratings_total?: number;
};

type NearbyParams = { lat: number; lng: number; category: CategoryKey; radius?: number };

function dedupePlaces<T extends { place_id?: string; name?: string; vicinity?: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const p of arr) {
    const key = p.place_id || `${(p.name || '').toLowerCase()}|${(p.vicinity || '').toLowerCase()}`;
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

async function googleNearby({ lat, lng, type, keyword, radius, rankByDistance }: { lat: number; lng: number; type?: string; keyword?: string; radius?: number; rankByDistance?: boolean }): Promise<GooglePlaceResult[]> {
  const params = new URLSearchParams();
  const key = process.env.GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key) return [] as GooglePlaceResult[];
  params.set('key', key);
  params.set('location', `${lat},${lng}`);
  if (rankByDistance) {
    params.set('rankby', 'distance');
    if (keyword) params.set('keyword', keyword);
    if (type) params.set('type', type);
  } else {
    params.set('radius', String(radius ?? 1500));
    if (keyword) params.set('keyword', keyword);
    if (type) params.set('type', type);
  }
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [] as GooglePlaceResult[];
  const data = (await res.json()) as { results?: GooglePlaceResult[] };
  return data.results ?? [];
}

type AggregatedItem = {
  id: string;
  name: string;
  address?: string;
  rating?: number;
  reviews?: number;
  price_level?: number;
  place_id?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  score: number;
};

type Aggregated = { items: AggregatedItem[]; origin: LatLng; category: CategoryKey };

async function fetchFresh(q: NearbyParams): Promise<Aggregated> {
  const map = CATEGORY_MAP[q.category];
  const denseArea = !q.radius || q.radius <= 1500;
  const baseRadius = q.radius ?? 1500;

  const requests: Promise<GooglePlaceResult[]>[] = [];
  if (map.googleTypes[0]) {
    requests.push(googleNearby({ lat: q.lat, lng: q.lng, type: map.googleTypes[0], rankByDistance: denseArea, radius: baseRadius }));
  }
  for (const t of map.googleTypes.slice(1, 3)) {
    requests.push(googleNearby({ lat: q.lat, lng: q.lng, type: t, radius: baseRadius }));
  }
  if (map.googleKeywords.length) {
    requests.push(googleNearby({ lat: q.lat, lng: q.lng, keyword: map.googleKeywords.slice(0, 2).join(' '), radius: baseRadius }));
  }

  const batches: PromiseSettledResult<GooglePlaceResult[]>[] = await Promise.allSettled(requests);
  const merged: GooglePlaceResult[] = [];
  for (const b of batches) if (b.status === 'fulfilled') merged.push(...b.value);
  const deduped = dedupePlaces<GooglePlaceResult>(merged).filter(
    (p) => !p.business_status || p.business_status === 'OPERATIONAL'
  );

  const origin: LatLng = { lat: q.lat, lng: q.lng };
  const scored = deduped
    .map((p) => ({ p, s: scorePlace(p as BasicPlace, origin) }))
    .filter((x) => Number.isFinite(x.s) && x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 50);

  const final: AggregatedItem[] = scored.map(({ p, s }) => {
    const pid = (p.place_id as string) || '';
    const loc = p.geometry?.location;
    return {
      id: pid || `${(p.name ?? '').toLowerCase()}|${p.vicinity ?? ''}`,
      name: p.name || 'Unknown',
      address: p.formatted_address || p.vicinity || '',
      rating: p.rating,
      reviews: p.user_ratings_total,
      price_level: p.price_level,
      place_id: pid,
      latitude: loc?.lat,
      longitude: loc?.lng,
      distance: loc ? haversineMeters(origin, { lat: loc.lat, lng: loc.lng }) : undefined,
      score: s,
    };
  });

  return { items: final, origin, category: q.category };
}

async function getCachedOrFetch(supabase: ReturnType<typeof createClient>, q: NearbyParams): Promise<Aggregated> {
  const key = `nearby:${q.category}:${q.lat.toFixed(4)},${q.lng.toFixed(4)}:${q.radius ?? 'auto'}`;
  try {
    const { data: row } = await supabase.from('nearby_cache').select('key,data,updated_at').eq('key', key).single();
    const ttlMs = 6 * 60 * 60 * 1000;
    if (row) {
      const updatedAt = (row as unknown as { updated_at: string }).updated_at;
      const data = (row as unknown as { data: Aggregated }).data;
      const age = Date.now() - new Date(updatedAt).getTime();
      if (age < ttlMs) return data;
      fetchFresh(q).then((fresh) => {
        void supabase.from('nearby_cache').upsert({ key, data: fresh }).select();
      }).catch(() => {});
      return data;
    }
  } catch {}

  const fresh = await fetchFresh(q);
  try { await supabase.from('nearby_cache').upsert({ key, data: fresh }).select(); } catch {}
  return fresh;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || searchParams.get('latitude');
    const lng = searchParams.get('lng') || searchParams.get('longitude');
    const radius = searchParams.get('radius') || '1500';
    const category = (searchParams.get('category') || 'dining') as CategoryKey;

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Latitude and longitude are required', success: false }, { status: 400 });
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseInt(radius);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(radiusMeters)) {
      return NextResponse.json({ error: 'Invalid coordinates or radius', success: false }, { status: 400 });
    }

    const supabase = createClient();
  const aggregated: Aggregated = await getCachedOrFetch(supabase, { lat: latitude, lng: longitude, category, radius: radiusMeters });

    // Map to existing Business response shape
  const businesses = aggregated.items.map((it) => ({
      id: it.id,
      name: it.name,
      category,
      address: it.address || '',
      latitude: it.latitude ?? latitude,
      longitude: it.longitude ?? longitude,
      place_id: it.place_id,
      rating: it.rating,
      price_level: it.price_level,
      distance: it.distance,
    }));

    return NextResponse.json({
      success: true,
      businesses,
      user_location: { latitude, longitude },
    });
  } catch (error) {
    console.error('Nearby API error:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
