/**
 * Merchant Matching Service
 * 
 * Combines fuzzy name matching, MCC codes, and brand detection
 * to accurately categorize merchants for credit card recommendations.
 * 
 * @module lib/matching/merchantMatcher
 */

import { RewardCategory } from '@/types/creditCards'
import {
  normalizeBusinessName,
  getCanonicalName,
  similarityScore,
  detectBrandFromName,
  detectCategoryFromName,
  BUSINESS_ALIASES,
} from './fuzzyMatcher'
import {
  getCategoryFromMCC,
  getHotelBrandFromMCC,
  getAirlineBrandFromMCC,
} from './mccMapping'

export interface MerchantMatchResult {
  /** Original merchant name */
  originalName: string
  /** Normalized/canonical name */
  normalizedName: string
  /** Detected reward category */
  category: RewardCategory
  /** Confidence score (0-1) */
  confidence: number
  /** Hotel brand if detected */
  hotelBrand: string | null
  /** Airline brand if detected */
  airlineBrand: string | null
  /** Whether category was determined by MCC code */
  mccBased: boolean
  /** Additional notes about the match */
  notes: string[]
}

/**
 * Map detected categories to RewardCategory enum
 */
const CATEGORY_STRING_TO_ENUM: Record<string, RewardCategory> = {
  'dining': RewardCategory.Dining,
  'groceries': RewardCategory.Groceries,
  'gas': RewardCategory.Gas,
  'travel': RewardCategory.Travel,
  'hotels': RewardCategory.Hotels,
  'drugstores': RewardCategory.Drugstores,
  'home_improvement': RewardCategory.HomeImprovement,
  'streaming': RewardCategory.Streaming,
  'entertainment': RewardCategory.Entertainment,
  'flights': RewardCategory.Flights,
}

/**
 * Map hotel brands to RewardCategory
 */
const HOTEL_BRAND_TO_CATEGORY: Record<string, RewardCategory> = {
  'marriott': RewardCategory.Marriott,
  'hilton': RewardCategory.Hilton,
  'hyatt': RewardCategory.Hyatt,
  'ihg': RewardCategory.IHG,
  'wyndham': RewardCategory.Wyndham,
  'choice': RewardCategory.Choice,
}

/**
 * Map airline brands to RewardCategory
 */
const AIRLINE_BRAND_TO_CATEGORY: Record<string, RewardCategory> = {
  'united': RewardCategory.United,
  'delta': RewardCategory.Delta,
  'american': RewardCategory.American,
  'southwest': RewardCategory.Southwest,
  'jetblue': RewardCategory.JetBlue,
  'alaska': RewardCategory.Alaska,
}

/**
 * Main merchant matching function
 * Takes a merchant name and optional MCC code to determine the best category match
 */
export function matchMerchant(
  merchantName: string,
  mcc?: string | number
): MerchantMatchResult {
  const notes: string[] = []
  let confidence = 0.5 // Base confidence
  let category: RewardCategory = RewardCategory.EverythingElse
  let hotelBrand: string | null = null
  let airlineBrand: string | null = null
  let mccBased = false
  
  // Normalize the name
  const normalizedName = normalizeBusinessName(merchantName)
  const canonicalName = getCanonicalName(merchantName)
  
  // 1. Check MCC code first (most reliable)
  if (mcc) {
    const mccCategory = getCategoryFromMCC(mcc)
    if (mccCategory) {
      category = mccCategory
      confidence = 0.95
      mccBased = true
      notes.push(`MCC ${mcc} mapped to ${mccCategory}`)
      
      // Check for specific hotel/airline brand from MCC
      const mccHotelBrand = getHotelBrandFromMCC(mcc)
      const mccAirlineBrand = getAirlineBrandFromMCC(mcc)
      
      if (mccHotelBrand && mccHotelBrand !== 'general_hotel') {
        hotelBrand = mccHotelBrand
        const brandCategory = HOTEL_BRAND_TO_CATEGORY[mccHotelBrand]
        if (brandCategory) {
          category = brandCategory
          notes.push(`Hotel brand ${mccHotelBrand} from MCC`)
        }
      }
      
      if (mccAirlineBrand && mccAirlineBrand !== 'general_airline') {
        airlineBrand = mccAirlineBrand
        const brandCategory = AIRLINE_BRAND_TO_CATEGORY[mccAirlineBrand]
        if (brandCategory) {
          category = brandCategory
          notes.push(`Airline brand ${mccAirlineBrand} from MCC`)
        }
      }
    }
  }
  
  // 2. Detect brand from name (can override or supplement MCC)
  const brandDetection = detectBrandFromName(merchantName)
  
  if (brandDetection.type === 'hotel' && brandDetection.brand) {
    hotelBrand = brandDetection.brand
    const brandCategory = HOTEL_BRAND_TO_CATEGORY[brandDetection.brand]
    if (brandCategory) {
      // Only override if we had a generic hotels category or lower confidence
      if (category === RewardCategory.Hotels || !mccBased) {
        category = brandCategory
        confidence = Math.max(confidence, 0.9)
        notes.push(`Hotel brand ${brandDetection.brand} detected from name`)
      }
    }
  }
  
  if (brandDetection.type === 'airline' && brandDetection.brand) {
    airlineBrand = brandDetection.brand
    const brandCategory = AIRLINE_BRAND_TO_CATEGORY[brandDetection.brand]
    if (brandCategory) {
      if (category === RewardCategory.Flights || !mccBased) {
        category = brandCategory
        confidence = Math.max(confidence, 0.9)
        notes.push(`Airline brand ${brandDetection.brand} detected from name`)
      }
    }
  }
  
  // 3. If no MCC match, try name-based category detection
  if (!mccBased && category === RewardCategory.EverythingElse) {
    const nameCategory = detectCategoryFromName(merchantName)
    if (nameCategory) {
      const enumCategory = CATEGORY_STRING_TO_ENUM[nameCategory]
      if (enumCategory) {
        category = enumCategory
        confidence = 0.7
        notes.push(`Category ${nameCategory} detected from name keywords`)
      }
    }
  }
  
  // 4. Check against known business aliases for additional confidence
  if (BUSINESS_ALIASES[canonicalName]) {
    confidence = Math.min(confidence + 0.1, 1)
    notes.push(`Known business: ${canonicalName}`)
  }
  
  // 5. Boost confidence if canonical differs from normalized (alias match)
  if (canonicalName !== normalizedName) {
    confidence = Math.min(confidence + 0.05, 1)
    notes.push(`Alias resolved: ${normalizedName} → ${canonicalName}`)
  }
  
  return {
    originalName: merchantName,
    normalizedName: canonicalName,
    category,
    confidence,
    hotelBrand,
    airlineBrand,
    mccBased,
    notes,
  }
}

/**
 * Match a merchant and return the best card category to use for rewards
 */
export function getBestCategoryForMerchant(
  merchantName: string,
  mcc?: string | number
): RewardCategory {
  const result = matchMerchant(merchantName, mcc)
  return result.category
}

/**
 * Check if a merchant matches a specific category
 */
export function merchantMatchesCategory(
  merchantName: string,
  targetCategory: RewardCategory,
  mcc?: string | number
): { matches: boolean; confidence: number } {
  const result = matchMerchant(merchantName, mcc)
  
  if (result.category === targetCategory) {
    return { matches: true, confidence: result.confidence }
  }
  
  // Check for related categories (e.g., Marriott should match Hotels)
  if (targetCategory === RewardCategory.Hotels) {
    const hotelBrands = [
      RewardCategory.Marriott,
      RewardCategory.Hilton,
      RewardCategory.Hyatt,
      RewardCategory.IHG,
      RewardCategory.Wyndham,
      RewardCategory.Choice,
    ]
    if (hotelBrands.includes(result.category)) {
      return { matches: true, confidence: result.confidence }
    }
  }
  
  if (targetCategory === RewardCategory.Travel) {
    const travelCategories = [
      RewardCategory.Flights,
      RewardCategory.Hotels,
      RewardCategory.RentalCars,
      RewardCategory.Marriott,
      RewardCategory.Hilton,
      RewardCategory.Hyatt,
      RewardCategory.United,
      RewardCategory.Delta,
      RewardCategory.American,
      RewardCategory.Southwest,
    ]
    if (travelCategories.includes(result.category)) {
      return { matches: true, confidence: result.confidence * 0.9 }
    }
  }
  
  return { matches: false, confidence: 0 }
}

/**
 * Bulk match multiple merchants
 */
export function matchMerchants(
  merchants: Array<{ name: string; mcc?: string | number }>
): MerchantMatchResult[] {
  return merchants.map(m => matchMerchant(m.name, m.mcc))
}

/**
 * Get similarity score between a merchant and a known business
 */
export function getMerchantSimilarity(
  merchantName: string,
  targetBusiness: string
): number {
  const normalizedMerchant = getCanonicalName(merchantName)
  const normalizedTarget = getCanonicalName(targetBusiness)
  
  // Exact canonical match
  if (normalizedMerchant === normalizedTarget) {
    return 1
  }
  
  // Calculate similarity
  return similarityScore(normalizedMerchant, normalizedTarget)
}

const merchantMatcherExports = {
  matchMerchant,
  getBestCategoryForMerchant,
  merchantMatchesCategory,
  matchMerchants,
  getMerchantSimilarity,
}

export default merchantMatcherExports
