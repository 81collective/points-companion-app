/**
 * Zod Validation Schemas
 * 
 * Centralized validation for all API boundaries.
 * Per agents/security/AGENTS.md: All inputs must be validated with Zod.
 */

import { z } from 'zod';

// =============================================================================
// Common Schemas
// =============================================================================

export const CoordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CorrelationIdSchema = z.string().uuid().optional();

// =============================================================================
// Cards API Schemas
// =============================================================================

export const RecommendationsQuerySchema = z.object({
  category: z.string().max(50).optional(),
  businessId: z.string().max(100).optional(),
  businessName: z.string().max(200).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  fields: z.string().max(500).optional(),
}).refine(
  (data) => data.category || data.businessId,
  { message: 'Either category or businessId is required' }
);

export const CardDatabaseQuerySchema = z.object({
  issuer: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  popular: z.enum(['true', 'false']).optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const CardOffersQuerySchema = z.object({
  cardId: z.string().max(100).optional(),
  active: z.enum(['true', 'false']).default('true'),
});

// =============================================================================
// Location API Schemas
// =============================================================================

export const NearbySearchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().min(100).max(50000).default(5000),
  category: z.string().max(50).optional(),
  limit: z.coerce.number().int().min(1).max(60).default(20),
});

export const GeocodeSchema = z.object({
  address: z.string().min(1).max(500),
});

// =============================================================================
// Transactions API Schemas
// =============================================================================

export const TransactionSchema = z.object({
  amount: z.coerce.number().positive(),
  merchantName: z.string().min(1).max(200),
  category: z.string().max(50).optional(),
  date: z.coerce.date(),
  cardId: z.string().max(100),
});

export const TransactionImportSchema = z.object({
  transactions: z.array(TransactionSchema).min(1).max(1000),
  source: z.enum(['csv', 'manual', 'api']).default('manual'),
});

// =============================================================================
// Auth Schemas
// =============================================================================

export const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(1).max(100).optional(),
});

export const TOTPVerifySchema = z.object({
  token: z.string().length(6).regex(/^\d+$/),
});

// =============================================================================
// Helpers
// =============================================================================

/**
 * Parse and validate query params from URLSearchParams
 */
export function parseQueryParams<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}

/**
 * Safe parse that returns result object instead of throwing
 */
export function safeParseQuery<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
) {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.safeParse(params);
}

// Type exports
export type RecommendationsQuery = z.infer<typeof RecommendationsQuerySchema>;
export type CardDatabaseQuery = z.infer<typeof CardDatabaseQuerySchema>;
export type NearbySearch = z.infer<typeof NearbySearchSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
