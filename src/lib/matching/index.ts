/**
 * Matching Module
 * 
 * Provides intelligent merchant/business matching capabilities
 * including fuzzy name matching, MCC code mapping, and brand detection.
 */

// Core fuzzy matching utilities
export {
  levenshteinDistance,
  similarityScore,
  normalizeBusinessName,
  getCanonicalName,
  findBestMatch,
  detectCategoryFromName,
  detectBrandFromName,
  BUSINESS_ALIASES,
} from './fuzzyMatcher'

// MCC code mapping
export {
  getCategoryFromMCC,
  getHotelBrandFromMCC,
  getAirlineBrandFromMCC,
  isBonusCategoryMCC,
  MCC_CATEGORY_MAP,
  MCC_RANGES,
  AIRLINE_MCCS,
  HOTEL_MCCS,
} from './mccMapping'

// High-level merchant matching service
export {
  matchMerchant,
  getBestCategoryForMerchant,
  merchantMatchesCategory,
  matchMerchants,
  getMerchantSimilarity,
  type MerchantMatchResult,
} from './merchantMatcher'
