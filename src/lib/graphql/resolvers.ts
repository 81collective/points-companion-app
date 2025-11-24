// GraphQL Resolvers for Points Companion App
// Implements the business logic for all GraphQL operations

import { fetchNearbyBusinesses } from '@/services/locationService';
import type { Business } from '@/types/location.types';
import { fetchRecommendations } from '@/services/cardService';
import prisma from '@/lib/prisma';
import { advancedApiCache } from '@/lib/apiCache';

const DEFAULT_NOTIFICATION_SETTINGS = {
  email: true,
  push: true,
  sms: false
};

function defaultPreferencesSnapshot() {
  return {
    defaultLocation: null,
    favoriteCategories: [] as string[],
    notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS }
  };
}

function parseNameParts(name?: string | null) {
  if (!name) {
    return { firstName: null as string | null, lastName: null as string | null };
  }
  const parts = name.trim().split(/\s+/);
  if (!parts.length) {
    return { firstName: null, lastName: null };
  }
  const [first, ...rest] = parts;
  return {
    firstName: first || null,
    lastName: rest.length ? rest.join(' ') : null
  };
}

function normalizePreferences(preferences?: unknown) {
  if (!preferences || typeof preferences !== 'object') {
    return defaultPreferencesSnapshot();
  }

  const prefRecord = preferences as Record<string, unknown>;
  const favoriteCategories = Array.isArray(prefRecord.favoriteCategories)
    ? prefRecord.favoriteCategories.filter((entry): entry is string => typeof entry === 'string')
    : [];

  const notificationSettingsRaw = prefRecord.notificationSettings as Record<string, unknown> | undefined;
  const notificationSettings = {
    email: typeof notificationSettingsRaw?.email === 'boolean' ? notificationSettingsRaw.email : DEFAULT_NOTIFICATION_SETTINGS.email,
    push: typeof notificationSettingsRaw?.push === 'boolean' ? notificationSettingsRaw.push : DEFAULT_NOTIFICATION_SETTINGS.push,
    sms: typeof notificationSettingsRaw?.sms === 'boolean' ? notificationSettingsRaw.sms : DEFAULT_NOTIFICATION_SETTINGS.sms
  };

  const defaultLocationRaw = prefRecord.defaultLocation as { lat?: number; lng?: number } | undefined;
  const defaultLocation =
    defaultLocationRaw && typeof defaultLocationRaw.lat === 'number' && typeof defaultLocationRaw.lng === 'number'
      ? { lat: defaultLocationRaw.lat, lng: defaultLocationRaw.lng }
      : null;

  return {
    defaultLocation,
    favoriteCategories,
    notificationSettings
  };
}

function buildDefaultAnalytics() {
  return {
    totalCards: 0,
    totalValue: 0,
    monthlyEarnings: 0,
    topCategories: [],
    spendingByCategory: [],
    recommendationsCount: 0
  };
}

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

    // Loyalty programs
    loyaltyPrograms: async (_parent: unknown, { category: _category }: { category?: string }, _context: Context) => {
      // Return empty list or fetch from a loyalty service / database
      return [];
    },

    loyaltyProgram: async (_parent: unknown, { id: _id }: { id: string }, _context: Context) => {
      // Return null or fetch a loyalty program by id
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

      try {
        const [profile, userRecord, cardCount] = await Promise.all([
          prisma.profile.findUnique({ where: { userId: context.user.id } }),
          prisma.user.findUnique({
            where: { id: context.user.id },
            select: { email: true, firstName: true, lastName: true, avatarUrl: true }
          }),
          prisma.creditCard.count({ where: { userId: context.user.id } })
        ]);

        const nameParts = [profile?.firstName || userRecord?.firstName, profile?.lastName || userRecord?.lastName]
          .filter(Boolean)
          .join(' ');

        const userProfile = {
          id: profile?.id || context.user.id,
          email: profile?.email || userRecord?.email || context.user.email,
          name: nameParts || null,
          avatarUrl: profile?.avatarUrl ?? userRecord?.avatarUrl ?? null,
          preferences: normalizePreferences(profile?.dashboardPreferences),
          cards: [],
          analytics: {
            ...buildDefaultAnalytics(),
            totalCards: cardCount
          }
        };

        context.cache.set(cacheKey, userProfile, {
          ttl: 30 * 60 * 1000, // 30 minutes
          tags: ['user', `user:${context.user.id}`]
        });

        return userProfile;
      } catch (error) {
        console.error('GraphQL userProfile error:', error);
        throw new Error('Failed to fetch user profile');
      }
    },

    // User cards list
    userCards: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.user) return [];
      try {
        const cards = await prisma.creditCard.findMany({ where: { userId: context.user.id } });
        // Map to GraphQL UserCard shape
        return cards.map((c: { id: string; name?: string; issuer?: string | null; createdAt?: Date }) => ({
          id: c.id,
          cardId: c.id,
          card: {
            id: c.id,
            name: c.name,
            issuer: c.issuer ?? 'Unknown',
            category: 'CREDIT_CARD',
            rewardRate: 1,
            annualFee: 0,
            signupBonus: null,
            imageUrl: null,
            applyUrl: null,
            features: [],
            pros: [],
            cons: [],
            bestFor: [],
            matchScore: 0,
            monthlyValue: 0,
          },
          addedDate: c.createdAt?.toISOString?.() ?? new Date().toISOString(),
          isActive: true,
          notes: null
        }));
      } catch (error) {
        console.error('GraphQL userCards error:', error);
        return [];
      }
    },

    // User analytics moved to Query block

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
        const rawName = typeof input.name === 'string' ? input.name.trim() : null;
        const { firstName, lastName } = parseNameParts(rawName);
        const nextEmail = typeof input.email === 'string' && input.email.trim()
          ? input.email.trim()
          : context.user.email;

        await prisma.profile.upsert({
          where: { userId: context.user.id },
          update: {
            email: nextEmail,
            firstName: firstName ?? undefined,
            lastName: lastName ?? undefined
          },
          create: {
            userId: context.user.id,
            email: nextEmail,
            firstName,
            lastName,
            dashboardPreferences: defaultPreferencesSnapshot()
          }
        });

        await prisma.user.update({
          where: { id: context.user.id },
          data: {
            firstName: firstName ?? undefined,
            lastName: lastName ?? undefined
          }
        });

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
    
    // User cards list
    // (moved to Query block) - mutation-specific userCards removed

    // User analytics moved to Query block

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
        const cardLabel = input.cardId?.trim();
        if (!cardLabel) {
          throw new Error('Card identifier is required');
        }

        await prisma.creditCard.create({
          data: {
            userId: context.user.id,
            name: cardLabel,
            issuer: null,
            network: null,
            last4: '0000',
            rewards: input.notes ? [String(input.notes)] : []
          }
        });

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
