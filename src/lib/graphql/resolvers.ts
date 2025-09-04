// GraphQL Resolvers for Points Companion App
// Implements the business logic for all GraphQL operations

import { fetchNearbyBusinesses } from '@/services/locationService';
import type { Business } from '@/types/location.types';
import { fetchRecommendations } from '@/services/cardService';
import { createClient } from '@/lib/supabase';
import { advancedApiCache } from '@/lib/apiCache';

interface Context {
  user?: {
    id: string;
    email: string;
  };
  cache: typeof advancedApiCache;
}

type NearbyFilters = {
  radius?: number;
  minRating?: number;
  maxPrice?: number;
};

type NearbyQueryInput = {
  location: { lat: number; lng: number };
  category?: string;
  filters?: NearbyFilters;
  limit?: number;
  offset?: number;
};

type CachedNearby = { data: unknown[]; totalCount?: number };
type CachedRecommendations = { data: unknown[] };

export const resolvers = {
  Query: {
    // Business queries
    nearbyBusinesses: async (
  _parent: unknown,
  { query }: { query: NearbyQueryInput },
      context: Context
    ) => {
      try {
        const { location, category, filters, limit = 20, offset = 0 } = query;

        // Generate cache key
        const cacheKey = context.cache.generateKey({
          lat: location.lat.toFixed(4),
          lng: location.lng.toFixed(4),
          category,
          ...filters,
          limit,
          offset
        }, 'graphql_nearby');

        // Check cache first
        const cached = context.cache.get(cacheKey);
        if (cached && typeof cached === 'object' && 'data' in cached) {
          const cacheData = cached as CachedNearby;
          return {
            edges: cacheData.data.map((business, index: number) => ({
              node: business,
              cursor: Buffer.from(`${offset + index}`).toString('base64')
            })),
            pageInfo: {
              hasNextPage: cacheData.data.length === limit,
              hasPreviousPage: offset > 0,
              startCursor: Buffer.from(`${offset}`).toString('base64'),
              endCursor: Buffer.from(`${offset + cacheData.data.length - 1}`).toString('base64')
            },
            totalCount: cacheData.totalCount || cacheData.data.length
          };
        }

        // Fetch from service
        const result = await fetchNearbyBusinesses(
          location.lat,
          location.lng,
          category || 'dining',
          filters?.radius || 5000
        );

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch businesses');
        }

        // Apply filters
  let businesses = result.data || [];
        if (filters) {
          if (typeof filters.minRating === 'number') {
            const minRating = filters.minRating;
            businesses = businesses.filter((b: Business) => (b.rating || 0) >= minRating);
          }
          if (typeof filters.maxPrice === 'number') {
            const maxPrice = filters.maxPrice;
            businesses = businesses.filter((b: Business) => (b.price_level || 0) <= maxPrice);
          }
          // Note: openNow filter would require additional API data not currently available
        }

        // Apply pagination
        const totalCount = businesses.length;
        const paginatedBusinesses = businesses.slice(offset, offset + limit);

        const response = {
          data: paginatedBusinesses,
          totalCount,
          timestamp: new Date().toISOString()
        };

        // Cache the result
        context.cache.set(cacheKey, response, {
          ttl: 10 * 60 * 1000, // 10 minutes
          tags: ['businesses', `category:${category}`, `location:${location.lat.toFixed(2)},${location.lng.toFixed(2)}`]
        });

        return {
          edges: paginatedBusinesses.map((business, index: number) => ({
            node: business,
            cursor: Buffer.from(`${offset + index}`).toString('base64')
          })),
          pageInfo: {
            hasNextPage: paginatedBusinesses.length === limit && offset + limit < totalCount,
            hasPreviousPage: offset > 0,
            startCursor: Buffer.from(`${offset}`).toString('base64'),
            endCursor: Buffer.from(`${offset + paginatedBusinesses.length - 1}`).toString('base64')
          },
          totalCount
        };
      } catch (error) {
        console.error('GraphQL nearbyBusinesses error:', error);
        throw new Error('Failed to fetch nearby businesses');
      }
    },

  business: async (_parent: unknown, { id }: { id: string }, context: Context) => {
      // Implementation for single business lookup
      const cacheKey = context.cache.generateKey({ id }, 'graphql_business');

      const cached = context.cache.get(cacheKey);
      if (cached) return cached;

      // This would typically fetch from a business service
      // For now, return null as we don't have a single business endpoint
      return null;
    },

    // Card queries
    cardRecommendations: async (
  _parent: unknown,
  { query }: { query?: { filters?: { category?: string; location?: { lat: number; lng: number }; businessId?: string; businessName?: string; limit?: number } } },
      context: Context
    ) => {
      try {
        const { filters } = query || {};

        // Generate cache key
        const cacheKey = context.cache.generateKey({
          ...filters,
          type: 'recommendations'
        }, 'graphql_recommendations');

        // Check cache first
        const cached = context.cache.get(cacheKey);
        if (cached && typeof cached === 'object' && 'data' in cached) {
          const cacheData = cached as CachedRecommendations;
          return cacheData.data;
        }

        // Fetch from service
        const result = await fetchRecommendations(
          filters?.category || 'dining',
          filters?.location?.lat,
          filters?.location?.lng,
          filters?.businessId,
          filters?.businessName
        );

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch recommendations');
        }

        const recommendations = result.data || [];

        // Apply additional filters
  let filteredRecommendations = recommendations;
        if (filters?.limit) {
          filteredRecommendations = filteredRecommendations.slice(0, filters.limit);
        }

        // Cache the result
        context.cache.set(cacheKey, {
          data: filteredRecommendations,
          timestamp: new Date().toISOString()
        }, {
          ttl: 15 * 60 * 1000, // 15 minutes
          tags: ['recommendations', `category:${filters?.category}`]
        });

        return filteredRecommendations;
      } catch (error) {
        console.error('GraphQL cardRecommendations error:', error);
        throw new Error('Failed to fetch card recommendations');
      }
    },

  card: async (_parent: unknown, { id }: { id: string }, context: Context) => {
      // Implementation for single card lookup
      const cacheKey = context.cache.generateKey({ id }, 'graphql_card');

      const cached = context.cache.get(cacheKey);
      if (cached) return cached;

      // This would typically fetch from a card service
      // For now, return null
      return null;
    },

    // User queries
  userProfile: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const cacheKey = context.cache.generateKey(
        { userId: context.user.id },
        'graphql_user_profile'
      );

      const cached = context.cache.get(cacheKey);
      if (cached) return cached;

      // Fetch user profile from Supabase
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', context.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error('Failed to fetch user profile');
      }

      const userProfile = profile || {
        id: context.user.id,
        email: context.user.email,
        name: null,
        preferences: {
          favoriteCategories: [],
          notificationSettings: {
            email: true,
            push: true,
            sms: false
          }
        }
      };

      // Cache the result
      context.cache.set(cacheKey, userProfile, {
        ttl: 30 * 60 * 1000, // 30 minutes
        tags: ['user', `user:${context.user.id}`]
      });

      return userProfile;
    },

    // Health check
    health: async () => {
      return {
        success: true,
        message: 'GraphQL API is healthy',
        data: new Date().toISOString()
      };
    }
  },

  Mutation: {
    // User mutations
    updateUserProfile: async (
  _parent: unknown,
  { input }: { input: Record<string, unknown> },
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: context.user.id,
            ...input,
            updated_at: new Date().toISOString()
          });

        if (error) {
          throw new Error('Failed to update user profile');
        }

        // Invalidate user cache
        context.cache.clearByTags([`user:${context.user.id}`]);

        return {
          success: true,
          message: 'User profile updated successfully'
        };
      } catch (error) {
        console.error('GraphQL updateUserProfile error:', error);
        throw new Error('Failed to update user profile');
      }
    },

    // Card mutations
    addUserCard: async (
      _parent: unknown,
      { input }: { input: { cardId: string; notes?: string } },
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('user_cards')
          .insert({
            user_id: context.user.id,
            card_id: input.cardId,
            notes: input.notes,
            is_active: true,
            added_date: new Date().toISOString()
          });

        if (error) {
          throw new Error('Failed to add user card');
        }

        // Invalidate user cards cache
        context.cache.clearByTags([`user:${context.user.id}`, 'user_cards']);

        return {
          success: true,
          message: 'Card added to collection successfully'
        };
      } catch (error) {
        console.error('GraphQL addUserCard error:', error);
        throw new Error('Failed to add card to collection');
      }
    }
  },

  // Field resolvers for complex types
  Business: {
  category: (parent: { category?: string }) => {
      // Map internal categories to GraphQL enum
      const categoryMap: Record<string, string> = {
        restaurant: 'RESTAURANT',
        hotel: 'HOTEL',
        gas_station: 'GAS_STATION',
        grocery_store: 'GROCERY_STORE',
        department_store: 'DEPARTMENT_STORE',
        entertainment: 'ENTERTAINMENT',
        travel: 'TRAVEL'
      };

  return parent.category && categoryMap[parent.category] ? categoryMap[parent.category] : 'OTHER';
    }
  },

  CardRecommendation: {
    category: (parent: { category?: string }) => {
      // Map internal categories to GraphQL enum
      const categoryMap: Record<string, string> = {
        dining: 'DINING',
        travel: 'TRAVEL',
        grocery: 'GROCERY',
        gas: 'GAS',
        entertainment: 'ENTERTAINMENT',
        department_store: 'DEPARTMENT_STORE',
        hotel: 'HOTEL',
        airline: 'AIRLINE',
        credit_card: 'CREDIT_CARD'
      };

  return parent.category && categoryMap[parent.category] ? categoryMap[parent.category] : 'OTHER';
    }
  }
};
