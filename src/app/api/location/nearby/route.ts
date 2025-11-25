import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import getRequestUrl from '@/lib/getRequestUrl';
import prisma from '@/lib/prisma';
import { CATEGORY_MAP, CategoryKey } from '@/lib/places/categories';
import { scorePlace, haversineMeters, type BasicPlace } from '@/lib/places/score';
import { classifyBusiness } from '@/lib/classification/businessClassifier';
import { evaluateCards } from '@/lib/cards/engine';
import logger from '@/lib/logger';

const log = logger.child({ component: 'location-nearby-api' });

// Validation schema
const NearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  category: z.string().max(50),
  radius: z.coerce.number().int().min(100).max(50000).optional().default(5000),
  limit: z.coerce.number().int().min(1).max(60).optional().default(20),
});

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
  types?: string[];
};

type MapboxFeature = {
  id: string;
  text?: string;
  place_name?: string;
  center?: [number, number]; // [lng, lat]
  geometry?: { type: string; coordinates: [number, number] };
  properties?: Record<string, unknown>;
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

type GoogleNearbyResponse = { results?: GooglePlaceResult[]; next_page_token?: string; status?: string };

async function googleNearbyPage({ lat, lng, type, keyword, radius, rankByDistance, pageToken }: { lat: number; lng: number; type?: string; keyword?: string; radius?: number; rankByDistance?: boolean; pageToken?: string }): Promise<GoogleNearbyResponse> {
  const params = new URLSearchParams();
  const key = process.env.GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key) return { results: [] };
  params.set('key', key);

  if (pageToken) {
    // When using a pagetoken, most other params are ignored by the API
    params.set('pagetoken', pageToken);
  } else {
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
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return { results: [] };
  const data = (await res.json()) as GoogleNearbyResponse;
  return data;
}

async function googleNearbyAllPages(args: { lat: number; lng: number; type?: string; keyword?: string; radius?: number; rankByDistance?: boolean; maxPages?: number }): Promise<GooglePlaceResult[]> {
  const { maxPages = 2, ...rest } = args;
  const out: GooglePlaceResult[] = [];
  let pageToken: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    // For subsequent pages, wait briefly for token activation per Google guidelines
    if (pageToken) await new Promise((r) => setTimeout(r, 1200));
    const page = await googleNearbyPage({ ...rest, pageToken });
    if (page.results?.length) out.push(...page.results);
    if (page.next_page_token) {
      pageToken = page.next_page_token;
    } else {
      break;
    }
  }
  return out;
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
  source?: 'google' | 'mapbox';
  inferred_category?: string;
  inferred_confidence?: number;
  mcc_candidates?: number[];
  brand_id?: string;
  top_card?: { cardId: string; cardName: string; reasons: string[]; rate: number; valueCentsPerDollar: number };
};

type Aggregated = { items: AggregatedItem[]; origin: LatLng; category: CategoryKey };

async function fetchFresh(q: NearbyParams & { maxRadius?: number; minRating?: number; openNow?: boolean; limit?: number }): Promise<Aggregated> {
  const map = CATEGORY_MAP[q.category];
  const denseArea = !q.radius || q.radius <= 1500;
  const baseRadius = q.radius ?? 1500;
  const maxRadius = q.maxRadius ?? Math.max(baseRadius, 5000);
  const desiredMin = 20; // try to collect at least this many before scoring

  async function batchForRadius(radius: number, pages = 2) {
    const reqs: Promise<GooglePlaceResult[]>[] = [];
    if (map.googleTypes[0]) {
      reqs.push(googleNearbyAllPages({ lat: q.lat, lng: q.lng, type: map.googleTypes[0], rankByDistance: denseArea, radius, maxPages: pages }));
    }
    for (const t of map.googleTypes.slice(1, 3)) {
      reqs.push(googleNearbyAllPages({ lat: q.lat, lng: q.lng, type: t, radius, maxPages: pages }));
    }
    if (map.googleKeywords.length) {
      reqs.push(googleNearbyAllPages({ lat: q.lat, lng: q.lng, keyword: map.googleKeywords.slice(0, 2).join(' '), radius, maxPages: pages }));
    }
    const batches = await Promise.allSettled(reqs);
    const merged: GooglePlaceResult[] = [];
    for (const b of batches) if (b.status === 'fulfilled') merged.push(...b.value);
    return merged;
  }

  const merged: GooglePlaceResult[] = await batchForRadius(baseRadius, 2);
  // If too few, expand radius once more (lighter pages to save latency)
  if (merged.length < desiredMin && baseRadius < maxRadius) {
    const expandedRadius = Math.min(maxRadius, Math.round(baseRadius * 2));
    const extra = await batchForRadius(expandedRadius, 1);
    merged.push(...extra);
  }

  // Mapbox provider (optional, if token available): use keywords as query and bbox from radius
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN as string | undefined;
  async function mapboxSearch(query: string, radius: number, limit = 20): Promise<MapboxFeature[]> {
    if (!mapboxToken) return [];
    const kmPerDegree = 111;
    const latDelta = radius / 1000 / kmPerDegree;
    const lngDelta = radius / 1000 / (kmPerDegree * Math.cos(q.lat * Math.PI / 180));
    const minLng = q.lng - lngDelta;
    const minLat = q.lat - latDelta;
    const maxLng = q.lng + lngDelta;
    const maxLat = q.lat + latDelta;
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
    url.searchParams.set('access_token', mapboxToken);
    url.searchParams.set('proximity', `${q.lng},${q.lat}`);
    url.searchParams.set('types', 'poi');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('language', 'en');
    url.searchParams.set('bbox', `${minLng},${minLat},${maxLng},${maxLat}`);
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { features?: MapboxFeature[] };
    return data.features ?? [];
  }

  if (mapboxToken && map.googleKeywords.length) {
    const mbxQueries = [map.googleKeywords[0]];
    if (map.googleKeywords[1]) mbxQueries.push(map.googleKeywords[1]);
    const mbxBatches = await Promise.allSettled(mbxQueries.map((kw) => mapboxSearch(kw, baseRadius, 15)));
    const mbxFeatures: MapboxFeature[] = [];
    for (const b of mbxBatches) if (b.status === 'fulfilled') mbxFeatures.push(...b.value);
    const mbxAsGoogleShape: GooglePlaceResult[] = mbxFeatures.map((f) => {
      const lng = f.center?.[0] ?? f.geometry?.coordinates?.[0];
      const lat = f.center?.[1] ?? f.geometry?.coordinates?.[1];
      const name = f.text || (f.place_name ? f.place_name.split(',')[0] : '');
      const address = f.place_name || '';
      return {
        name,
        formatted_address: address,
        geometry: { location: lat != null && lng != null ? { lat, lng } : undefined },
        place_id: `mapbox_${f.id}`,
        rating: undefined,
        user_ratings_total: undefined,
        opening_hours: undefined,
        price_level: undefined,
        business_status: 'OPERATIONAL',
      } as GooglePlaceResult;
    });
    merged.push(...mbxAsGoogleShape);
  }
  const deduped = dedupePlaces<GooglePlaceResult>(merged).filter(
    (p) => !p.business_status || p.business_status === 'OPERATIONAL'
  );

  const origin: LatLng = { lat: q.lat, lng: q.lng };
  let filtered = deduped;
  if (q.minRating) {
    filtered = filtered.filter((p) => (p.rating ?? 0) >= (q.minRating as number));
  }
  if (q.openNow) {
    filtered = filtered.filter((p) => p.opening_hours?.open_now === true);
  }
  const scored = filtered
    .map((p) => ({ p, s: scorePlace(p as BasicPlace, origin) }))
    .filter((x) => Number.isFinite(x.s) && x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, q.limit ?? 50);

  const final: AggregatedItem[] = scored.map(({ p, s }) => {
    const pid = (p.place_id as string) || '';
    const loc = p.geometry?.location;
    const name = p.name || 'Unknown';
    const classification = classifyBusiness({
      name,
      googleTypes: Array.isArray(p.types) ? p.types : [],
      mapboxPlaceName: p.formatted_address || p.vicinity || undefined,
    });
    const cardEvals = evaluateCards({ taxonomy: classification.taxonomy, mccCandidates: classification.mccCandidates, brandId: classification.brandId });
    const top = cardEvals[0];
    return {
      id: pid || `${(p.name ?? '').toLowerCase()}|${p.vicinity ?? ''}`,
      name,
      address: p.formatted_address || p.vicinity || '',
      rating: p.rating,
      reviews: p.user_ratings_total,
      price_level: p.price_level,
      place_id: pid,
      latitude: loc?.lat,
      longitude: loc?.lng,
      distance: loc ? haversineMeters(origin, { lat: loc.lat, lng: loc.lng }) : undefined,
      score: s,
      source: pid?.startsWith('mapbox_') ? 'mapbox' : 'google',
      inferred_category: classification.taxonomy,
      inferred_confidence: classification.confidence,
      mcc_candidates: classification.mccCandidates,
      brand_id: classification.brandId,
      top_card: top ? { cardId: top.cardId, cardName: top.cardName, reasons: top.reasons, rate: top.rate, valueCentsPerDollar: top.estValueCentsPerDollar } : undefined,
    };
  });

  return { items: final, origin, category: q.category };
}

type NearbyOptions = NearbyParams & { maxRadius?: number; minRating?: number; openNow?: boolean; limit?: number };

async function getCachedOrFetch(q: NearbyOptions): Promise<Aggregated> {
  const providers = `${process.env.GOOGLE_MAPS_API_KEY ? 'g' : ''}${process.env.MAPBOX_ACCESS_TOKEN ? 'm' : ''}` || 'none';
  const key = `nearby:${q.category}:${q.lat.toFixed(4)},${q.lng.toFixed(4)}:${q.radius ?? 'auto'}:min${q.minRating ?? ''}:open${q.openNow ?? ''}:lim${q.limit ?? ''}:maxR${q.maxRadius ?? ''}:prov${providers}`;
  const ttlMs = 6 * 60 * 60 * 1000;

  try {
    const cache = await prisma.nearbyCache.findUnique({ where: { key } });
    if (cache?.data) {
      const age = Date.now() - cache.updatedAt.getTime();
      if (age < ttlMs) {
        return cache.data as Aggregated;
      }
      const cachedData = cache.data as Aggregated;
      fetchFresh(q)
        .then((fresh) =>
          prisma.nearbyCache.upsert({ where: { key }, update: { data: fresh }, create: { key, data: fresh } })
        )
        .catch(() => {});
      return cachedData;
    }
  } catch (error) {
    logger.warn('Cache lookup failed, continuing without cache', { error, route: '/api/location/nearby' });
  }

  const fresh = await fetchFresh(q);
  try {
    await prisma.nearbyCache.upsert({ where: { key }, update: { data: fresh }, create: { key, data: fresh } });
  } catch (error) {
    logger.warn('Failed to update cache', { error, route: '/api/location/nearby' });
  }
  return fresh;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = getRequestUrl(request);
    const lat = searchParams.get('lat') || searchParams.get('latitude');
    const lng = searchParams.get('lng') || searchParams.get('longitude');
    const radius = searchParams.get('radius') || '1500';
    const category = (searchParams.get('category') || 'dining') as CategoryKey;
  const minRatingParam = searchParams.get('minRating');
  const openNowParam = searchParams.get('openNow');
  const limitParam = searchParams.get('limit');
  const maxRadiusParam = searchParams.get('maxRadius');

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Latitude and longitude are required', success: false }, { status: 400 });
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseInt(radius);
  const minRating = minRatingParam ? parseFloat(minRatingParam) : undefined;
  const openNow = openNowParam === 'true' || openNowParam === '1' ? true : openNowParam === 'false' ? false : undefined;
  const limit = limitParam ? parseInt(limitParam) : undefined;
  const maxRadius = maxRadiusParam ? parseInt(maxRadiusParam) : undefined;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(radiusMeters)) {
      return NextResponse.json({ error: 'Invalid coordinates or radius', success: false }, { status: 400 });
    }

    // Branch: if no server key but a public client key exists, instruct client-side Places usage
    const hasServerKey = !!process.env.GOOGLE_MAPS_API_KEY;
    const hasClientKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!hasServerKey && hasClientKey) {
      return NextResponse.json({
        success: true,
        use_client_places: true,
        client_api_available: true,
        businesses: [],
        user_location: { latitude, longitude },
      });
    }

  const aggregated: Aggregated = await getCachedOrFetch({ lat: latitude, lng: longitude, category, radius: radiusMeters, maxRadius, minRating, openNow, limit });

    // Map to existing Business response shape
  const businesses = aggregated.items.map((it) => {
    // Only override when classifier confidence is high; avoids over-dining bias
    const threshold = 0.65;
    const isConfident = typeof it.inferred_confidence === 'number' ? it.inferred_confidence >= threshold : false;
    const correctedCategory = isConfident && it.inferred_category ? it.inferred_category : category;
    if (process.env.NODE_ENV !== 'production') {
      const catStr = String(category);
      const infStr = it.inferred_category ?? '';
      if (catStr === 'services' && (infStr === 'dining' || infStr === 'coffee')) {
        // Lightweight debug log to surface mislabels during development
        console.debug('[nearby] category corrected', { name: it.name, place_id: it.place_id, from: catStr, to: infStr });
      }
    }
    return ({
      // Ensure Google-sourced places carry a recognizable prefix for tests/consumers
      id: it.place_id ? `google_${it.place_id}` : it.id,
      name: it.name,
      category: correctedCategory,
      address: it.address || '',
      latitude: it.latitude ?? latitude,
      longitude: it.longitude ?? longitude,
      place_id: it.place_id,
      rating: it.rating,
      price_level: it.price_level,
      distance: it.distance,
      // Pass through enrichment for clients that use it
      inferred_category: it.inferred_category,
      inferred_confidence: it.inferred_confidence ?? null,
      mcc_candidates: it.mcc_candidates,
      brand_id: it.brand_id,
      top_card: it.top_card,
    });
  });

    return NextResponse.json({
      success: true,
      businesses,
      user_location: { latitude, longitude },
      meta: {
        category,
        radius: radiusMeters,
        minRating: minRating ?? null,
        openNow: openNow ?? null,
        limit: limit ?? null,
        sources: [
          process.env.GOOGLE_MAPS_API_KEY ? 'google' : null,
          process.env.MAPBOX_ACCESS_TOKEN ? 'mapbox' : null,
        ].filter(Boolean),
      }
    });
  } catch (error) {
    logger.error('Nearby API error', { error, route: '/api/location/nearby' });
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
