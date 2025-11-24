export type LatLng = { lat: number; lng: number };

export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export type BasicPlace = {
  place_id?: string;
  name?: string;
  geometry?: { location?: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  opening_hours?: { open_now?: boolean };
  price_level?: number;
};

export function scorePlace(place: BasicPlace, origin: LatLng): number {
  if (place.business_status && place.business_status !== 'OPERATIONAL') return -Infinity;

  const rating = place.rating ?? 0;
  const reviews = place.user_ratings_total ?? 0;
  const openBoost = place.opening_hours?.open_now ? 0.2 : 0;
  const price = place.price_level ?? 2;

  const loc = place.geometry?.location;
  const distanceM = loc ? haversineMeters(origin, { lat: loc.lat, lng: loc.lng }) : 5000;

  const distanceKm = distanceM / 1000;
  const distanceScore = Math.max(0, 1 - Math.log1p(distanceKm) / Math.log(10));

  const ratingScore = rating / 5;
  const reviewWeight = Math.min(1, Math.log1p(reviews) / Math.log(1000));
  const pricePenalty = Math.max(0, (price - 2) * 0.05);

  return (
    ratingScore * (0.55 + 0.25 * reviewWeight) +
    distanceScore * 0.25 +
    openBoost -
    pricePenalty
  );
}

// Ensure this file is considered a module
export {};
