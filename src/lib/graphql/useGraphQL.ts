import { gql } from '@apollo/client/core';
import { useQuery } from '@apollo/client/react';

// Business entity shape returned by GraphQL
export type Business = {
  id: string;
  name: string;
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  priceLevel?: number;
  distance?: number;
  placeId?: string;
};

export type Review = {
  id: string;
  author?: string;
  rating?: number;
  text?: string;
  time?: string;
};

export type Photo = {
  id: string;
  url?: string;
  width?: number;
  height?: number;
};

export type Hours = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
};

export type BusinessesVariables = {
  limit?: number;
  category?: string;
  offset?: number;
};

export type BusinessesData = {
  businesses: Business[];
};

export type BusinessDetailsVariables = {
  id: string;
};

export type BusinessDetails = Business & {
  reviews?: Review[];
  photos?: Photo[];
  hours?: Hours;
};

export type BusinessDetailsData = {
  business: BusinessDetails | null;
};

export type NearbyVariablesLatLng = {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
};

export type NearbyVariablesGps = {
  latitude: number;
  longitude: number;
  radius?: number;
  category?: string;
};

export type NearbyData = {
  nearbyBusinesses: Business[];
};

export const BUSINESSES_QUERY = gql`
  query Businesses($limit: Int, $category: String, $offset: Int) {
    businesses(limit: $limit, category: $category, offset: $offset) {
      id
      name
      category
      address
      latitude
      longitude
      rating
      priceLevel
      distance
      placeId
    }
  }
`;

export const BUSINESS_DETAILS_QUERY = gql`
  query BusinessDetails($id: ID!) {
    business(id: $id) {
      id
      name
      address
      rating
      priceLevel
      distance
      category
      placeId
      latitude
      longitude
      reviews {
        id
        author
        rating
        text
        time
      }
      photos {
        id
        url
        width
        height
      }
      hours {
        monday
        tuesday
        wednesday
        thursday
        friday
        saturday
        sunday
      }
    }
  }
`;

export const NEARBY_BUSINESSES_QUERY = gql`
  query NearbyBusinesses($lat: Float!, $lng: Float!, $radius: Int, $category: String) {
    nearbyBusinesses(lat: $lat, lng: $lng, radius: $radius, category: $category) {
      id
      name
      distance
      latitude
      longitude
    }
  }
`;

export function useBusinessesQuery(variables?: BusinessesVariables) {
  return useQuery<BusinessesData, BusinessesVariables>(BUSINESSES_QUERY, { variables });
}

export function useBusinessDetailsQuery(idOrVars: string | BusinessDetailsVariables) {
  const variables: BusinessDetailsVariables = typeof idOrVars === 'string' ? { id: idOrVars } : idOrVars;

  return useQuery<BusinessDetailsData, BusinessDetailsVariables>(BUSINESS_DETAILS_QUERY, {
    variables,
    skip: !variables.id,
  });
}

export function useNearbyBusinessesQuery(variables: NearbyVariablesLatLng | NearbyVariablesGps) {
  const normalized: NearbyVariablesLatLng = 'lat' in variables
    ? variables
    : {
        lat: variables.latitude,
        lng: variables.longitude,
        radius: variables.radius,
        category: variables.category,
      };

  const raw = useQuery<NearbyData, NearbyVariablesLatLng>(NEARBY_BUSINESSES_QUERY, {
    variables: normalized,
    skip: !normalized.lat || !normalized.lng,
  });

  if (raw.data && Array.isArray(raw.data.nearbyBusinesses)) {
    const data: NearbyData = {
      ...raw.data,
      nearbyBusinesses: [...raw.data.nearbyBusinesses].sort(
        (a: Business, b: Business) => (a.distance ?? 0) - (b.distance ?? 0),
      ),
    };

    return {
      ...raw,
      data,
    } as typeof raw;
  }

  return raw;
}
