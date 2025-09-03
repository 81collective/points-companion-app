// React hooks for GraphQL queries and mutations
// Provides a clean interface for interacting with the GraphQL API

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advancedApiCache } from '@/lib/apiCache';

interface GraphQLError {
  message: string;
  extensions?: Record<string, any>;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

// Generic GraphQL query function
async function graphqlQuery<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return result.data!;
}

// Nearby Businesses Query Hook
export function useNearbyBusinessesGraphQL(
  location: { lat: number; lng: number } | null,
  category?: string,
  options?: {
    radius?: number;
    limit?: number;
    enabled?: boolean;
  }
) {
  const query = `
    query GetNearbyBusinesses($location: LocationInput!, $category: BusinessCategory, $filters: BusinessFilters, $limit: Int) {
      nearbyBusinesses(query: {
        location: $location
        category: $category
        filters: $filters
        limit: $limit
      }) {
        edges {
          node {
            id
            name
            address
            category
            location {
              lat
              lng
            }
            rating
            priceLevel
            distance
            isOpen
            photoUrl
            placeId
            reviews
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `;

  return useQuery({
    queryKey: ['nearbyBusinesses', location, category, options],
    queryFn: () => graphqlQuery(query, {
      location,
      category,
      filters: {
        radius: options?.radius || 5000
      },
      limit: options?.limit || 20
    }),
    enabled: options?.enabled !== false && !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Card Recommendations Query Hook
export function useCardRecommendationsGraphQL(
  category?: string,
  businessId?: string,
  location?: { lat: number; lng: number },
  options?: {
    limit?: number;
    enabled?: boolean;
  }
) {
  const query = `
    query GetCardRecommendations($filters: CardRecommendationFilters) {
      cardRecommendations(query: { filters: $filters }) {
        id
        name
        issuer
        category
        rewardRate
        annualFee
        signupBonus
        imageUrl
        applyUrl
        features
        pros
        cons
        bestFor
        matchScore
        monthlyValue
      }
    }
  `;

  return useQuery({
    queryKey: ['cardRecommendations', category, businessId, location, options],
    queryFn: () => graphqlQuery(query, {
      filters: {
        category,
        businessId,
        location,
        limit: options?.limit
      }
    }),
    enabled: options?.enabled !== false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// User Profile Query Hook
export function useUserProfileGraphQL() {
  const query = `
    query GetUserProfile {
      userProfile {
        id
        email
        name
        preferences {
          favoriteCategories
          notificationSettings {
            email
            push
            sms
          }
        }
        cards {
          id
          cardId
          card {
            id
            name
            issuer
            category
          }
          addedDate
          isActive
          notes
        }
        analytics {
          totalCards
          totalValue
          monthlyEarnings
          topCategories {
            category
            count
            totalValue
            averageReward
          }
        }
      }
    }
  `;

  return useQuery({
    queryKey: ['userProfile'],
    queryFn: () => graphqlQuery(query),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Add User Card Mutation Hook
export function useAddUserCardGraphQL() {
  const queryClient = useQueryClient();

  const mutation = `
    mutation AddUserCard($input: AddUserCardInput!) {
      addUserCard(input: $input) {
        success
        message
      }
    }
  `;

  return useMutation({
    mutationFn: (variables: { cardId: string; notes?: string }) =>
      graphqlQuery(mutation, { input: variables }),
    onSuccess: () => {
      // Invalidate and refetch user profile and cards
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userCards'] });
    }
  });
}

// Update User Preferences Mutation Hook
export function useUpdateUserPreferencesGraphQL() {
  const queryClient = useQueryClient();

  const mutation = `
    mutation UpdateUserPreferences($input: UpdateUserPreferencesInput!) {
      updateUserPreferences(input: $input) {
        success
        message
      }
    }
  `;

  return useMutation({
    mutationFn: (variables: {
      favoriteCategories?: string[];
      notificationSettings?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
      }
    }) =>
      graphqlQuery(mutation, { input: variables }),
    onSuccess: () => {
      // Invalidate user profile
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
}

// Health Check Query Hook
export function useGraphQLHealth() {
  const query = `
    query HealthCheck {
      health {
        success
        message
        data
      }
    }
  `;

  return useQuery({
    queryKey: ['graphqlHealth'],
    queryFn: () => graphqlQuery(query),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

// Cache-aware query wrapper
export function useCachedGraphQLQuery<T = any>(
  queryKey: string[],
  query: string,
  variables?: Record<string, any>,
  options?: {
    ttl?: number;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Check advanced cache first
      const cacheKey = advancedApiCache.generateKey(
        { query, variables },
        'graphql_query'
      );

      const cached = advancedApiCache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch from GraphQL API
      const result = await graphqlQuery<T>(query, variables);

      // Cache the result
      if (options?.ttl) {
        advancedApiCache.set(cacheKey, result, {
          ttl: options.ttl,
          tags: ['graphql', queryKey[0]]
        });
      }

      return result;
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime || 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
