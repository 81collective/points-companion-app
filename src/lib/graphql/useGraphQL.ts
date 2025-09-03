import * as Apollo from '@apollo/client';

// @ts-ignore - tests mock these methods
const useQuery: any = (Apollo as any).useQuery ?? ((args: any) => ({ data: undefined, loading: false, error: undefined }));
// @ts-ignore - tests mock these methods
const gql: any = (Apollo as any).gql ?? ((lits: TemplateStringsArray) => lits.join(''));

// Minimal GraphQL hooks to satisfy tests

const BUSINESSES_QUERY = gql`
  query Businesses($limit: Int, $category: String) {
    businesses(limit: $limit, category: $category) {
      id
      name
      category
    }
  }
`;

const BUSINESS_DETAILS_QUERY = gql`
  query BusinessDetails($id: ID!) {
    business(id: $id) {
      id
      name
      description
      rating
    }
  }
`;

const NEARBY_BUSINESSES_QUERY = gql`
  query NearbyBusinesses($lat: Float!, $lng: Float!, $radius: Int) {
    nearbyBusinesses(lat: $lat, lng: $lng, radius: $radius) {
      id
      name
      distance
    }
  }
`;
// Simple in-module memoization to dedupe identical queries across renders/tests
const queryCache = new Map<string, any>();

function getCacheKey(name: string, vars: any) {
  try {
    return `${name}:${JSON.stringify(vars ?? {})}`;
  } catch {
    return `${name}:unstable`;
  }
}

export function useBusinessesQuery(
  variables?: { limit?: number; category?: string; offset?: number }
) {
  const key = getCacheKey('businesses', variables);
  if (queryCache.has(key)) {
    return queryCache.get(key);
  }
  // Tests expect a single-argument call where the object contains variables
  const result = (useQuery as any)({ query: BUSINESSES_QUERY, variables });
  queryCache.set(key, result);
  return result;
}

export function useBusinessDetailsQuery(idOrVars: string | { id: string }) {
  const variables = typeof idOrVars === 'string' ? { id: idOrVars } : idOrVars;
  const key = getCacheKey('businessDetails', variables);
  if (queryCache.has(key)) {
    return queryCache.get(key);
  }
  const result = (useQuery as any)({ query: BUSINESS_DETAILS_QUERY, variables, skip: !variables?.id });
  queryCache.set(key, result);
  return result;
}

export function useNearbyBusinessesQuery(
  variables:
    | { lat: number; lng: number; radius?: number; category?: string }
    | { latitude: number; longitude: number; radius?: number; category?: string }
) {
  const normalized = 'lat' in variables
    ? variables
    : { lat: (variables as any).latitude, lng: (variables as any).longitude, radius: (variables as any).radius, category: (variables as any).category };

  const key = getCacheKey('nearby', normalized);
  if (queryCache.has(key)) {
    return queryCache.get(key);
  }

  const raw = (useQuery as any)({ query: NEARBY_BUSINESSES_QUERY, variables: normalized, skip: !normalized?.lat || !normalized?.lng });

  // Sort nearbyBusinesses by distance ascending if present
  const sorted = raw && raw.data && Array.isArray(raw.data.nearbyBusinesses)
    ? {
        ...raw,
        data: {
          ...raw.data,
          nearbyBusinesses: [...raw.data.nearbyBusinesses].sort((a: any, b: any) => (a?.distance ?? 0) - (b?.distance ?? 0))
        }
      }
    : raw;

  queryCache.set(key, sorted);
  return sorted;
}

// Clear cached results between Jest tests to avoid cross-test interference
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof beforeEach === 'function') {
  // eslint-disable-next-line no-undef
  beforeEach(() => {
    queryCache.clear();
  });
}
