/**
 * Fuzzy Matching Utilities
 * 
 * Provides string matching algorithms for improved merchant/business
 * name matching in recommendations. Uses Levenshtein distance and
 * additional heuristics for common business naming variations.
 * 
 * @module lib/matching/fuzzyMatcher
 */

/**
 * Calculate Levenshtein distance between two strings
 * (minimum number of single-character edits to transform one into another)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length

  // Create distance matrix
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  // Initialize first column and row
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  // Fill in the rest of the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return dp[m][n]
}

/**
 * Calculate similarity score between two strings (0-1, higher is more similar)
 */
export function similarityScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  return 1 - distance / maxLength
}

/**
 * Normalize a business name for comparison
 * Removes common suffixes, punctuation, and standardizes format
 */
export function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common business suffixes
    .replace(/\s*(inc\.?|llc\.?|ltd\.?|corp\.?|corporation|company|co\.?)$/i, '')
    // Remove punctuation
    .replace(/['".,!?&\-_]/g, ' ')
    // Standardize apostrophes
    .replace(/['`']/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Common business name variations/aliases
 * Maps canonical names to their common variations
 */
export const BUSINESS_ALIASES: Record<string, string[]> = {
  // Fast Food
  'mcdonalds': ['mcdonald', 'mc donalds', 'mickey d', 'mickey ds', 'mcd'],
  'burger king': ['bk', 'burger king restaurant'],
  'wendys': ['wendy', 'wendys restaurant'],
  'taco bell': ['tacobell', 'tbell'],
  'chick-fil-a': ['chickfila', 'chic fil a', 'chick fila', 'cfa'],
  'chipotle': ['chipotle mexican grill', 'chipotle grill'],
  'five guys': ['5 guys', 'five guys burgers', '5 guys burgers'],
  'in-n-out': ['in n out', 'innout', 'in and out'],
  'shake shack': ['shakeshack'],
  'panera': ['panera bread', 'panera cafe'],
  'subway': ['subway restaurant', 'subway sandwiches'],
  'dunkin': ['dunkin donuts', 'dunkin doughnuts', 'dd'],
  'starbucks': ['starbucks coffee', 'sbux'],
  
  // Groceries
  'walmart': ['wal mart', 'wal-mart', 'walmart supercenter'],
  'target': ['target store', 'super target'],
  'costco': ['costco wholesale', 'costco warehouse'],
  'sams club': ['sam\'s club', 'sams', 'sam club'],
  'whole foods': ['whole foods market', 'wholefoods', 'wfm'],
  'trader joes': ['trader joe', 'traders joes', 'tj'],
  'kroger': ['krogers', 'kroger grocery'],
  'safeway': ['safeway grocery', 'safeway store'],
  'publix': ['publix super market', 'publix supermarket'],
  'aldi': ['aldi foods', 'aldi grocery'],
  'lidl': ['lidl grocery', 'lidl us'],
  'heb': ['h-e-b', 'h e b', 'heb grocery'],
  
  // Gas Stations
  'shell': ['shell gas', 'shell station', 'shell oil'],
  'chevron': ['chevron gas', 'chevron station'],
  'exxon': ['exxon mobil', 'exxonmobil', 'exxon gas'],
  'mobil': ['mobil gas', 'mobil station'],
  'bp': ['bp gas', 'british petroleum', 'bp station'],
  'texaco': ['texaco gas', 'texaco station'],
  '76': ['76 gas', 'seventy six', 'union 76'],
  'circle k': ['circlek', 'circle-k'],
  'wawa': ['wawa gas', 'wawa convenience'],
  'sheetz': ['sheetz gas', 'sheetz store'],
  'quiktrip': ['qt', 'quik trip', 'quick trip'],
  'racetrac': ['race trac', 'raceway'],
  
  // Drugstores
  'cvs': ['cvs pharmacy', 'cvs health', 'cvs store'],
  'walgreens': ['walgreens pharmacy', 'walgreens drugstore'],
  'rite aid': ['riteaid', 'rite-aid', 'rite aid pharmacy'],
  
  // Home Improvement
  'home depot': ['homedepot', 'the home depot', 'hd'],
  'lowes': ['lowe\'s', 'lowes home improvement'],
  'menards': ['menards home improvement'],
  'ace hardware': ['ace', 'ace hardware store'],
  
  // Hotels
  'marriott': ['marriott hotel', 'marriott bonvoy', 'jw marriott'],
  'hilton': ['hilton hotel', 'hilton honors'],
  'hyatt': ['hyatt hotel', 'hyatt hotels', 'park hyatt', 'grand hyatt'],
  'ihg': ['ihg hotel', 'intercontinental', 'holiday inn'],
  'wyndham': ['wyndham hotel', 'wyndham rewards'],
  'best western': ['bestwestern', 'best western plus', 'best western premier'],
  'hampton inn': ['hampton', 'hampton by hilton'],
  'holiday inn': ['holiday inn express', 'holidayinn'],
  'courtyard': ['courtyard marriott', 'courtyard by marriott'],
  'residence inn': ['residence inn marriott', 'residence inn by marriott'],
  'fairfield inn': ['fairfield', 'fairfield by marriott'],
  'doubletree': ['double tree', 'doubletree by hilton'],
  'embassy suites': ['embassy suites by hilton', 'embassysuites'],
  
  // Airlines
  'american airlines': ['aa', 'american', 'american air'],
  'united airlines': ['ua', 'united', 'united air'],
  'delta': ['delta airlines', 'delta air lines', 'dl'],
  'southwest': ['southwest airlines', 'swa', 'wn'],
  'jetblue': ['jet blue', 'jetblue airways', 'b6'],
  'alaska airlines': ['alaska air', 'as'],
  'spirit': ['spirit airlines', 'nk'],
  'frontier': ['frontier airlines', 'f9'],
  
  // Ride Share / Transportation
  'uber': ['uber ride', 'uber rides', 'uber technologies'],
  'lyft': ['lyft ride', 'lyft rides'],
  'uber eats': ['ubereats', 'uber eat'],
  'doordash': ['door dash', 'doordash delivery'],
  'grubhub': ['grub hub', 'grubhub delivery'],
  'instacart': ['insta cart', 'instacart delivery'],
  
  // Streaming / Entertainment
  'netflix': ['netflix streaming', 'netflix subscription'],
  'hulu': ['hulu streaming', 'hulu subscription'],
  'disney+': ['disney plus', 'disneyplus', 'disney+streaming'],
  'hbo max': ['hbomax', 'hbo', 'max streaming'],
  'spotify': ['spotify premium', 'spotify music'],
  'apple music': ['applemusic', 'apple music subscription'],
  'youtube': ['youtube premium', 'youtube music', 'yt'],
  'amazon prime': ['prime video', 'amazon prime video'],
  
  // Tech / Electronics
  'apple': ['apple store', 'apple inc'],
  'best buy': ['bestbuy', 'best buy electronics'],
  'amazon': ['amazon.com', 'amazon prime', 'amzn'],
}

/**
 * Get canonical name for a business (or return original if no alias found)
 */
export function getCanonicalName(businessName: string): string {
  const normalized = normalizeBusinessName(businessName)
  
  // Check if this is already a canonical name
  if (BUSINESS_ALIASES[normalized]) {
    return normalized
  }
  
  // Check if this matches any alias
  for (const [canonical, aliases] of Object.entries(BUSINESS_ALIASES)) {
    if (aliases.some(alias => {
      const normalizedAlias = normalizeBusinessName(alias)
      return normalized === normalizedAlias || 
             normalized.includes(normalizedAlias) ||
             normalizedAlias.includes(normalized)
    })) {
      return canonical
    }
  }
  
  return normalized
}

/**
 * Find the best matching business from a list of candidates
 */
export function findBestMatch(
  target: string,
  candidates: string[],
  threshold: number = 0.6
): { match: string | null; score: number; index: number } {
  const normalizedTarget = normalizeBusinessName(target)
  const canonicalTarget = getCanonicalName(target)
  
  let bestMatch: string | null = null
  let bestScore = 0
  let bestIndex = -1
  
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]
    const normalizedCandidate = normalizeBusinessName(candidate)
    const canonicalCandidate = getCanonicalName(candidate)
    
    // Check for exact canonical match first
    if (canonicalTarget === canonicalCandidate) {
      return { match: candidate, score: 1, index: i }
    }
    
    // Calculate similarity scores
    const directScore = similarityScore(normalizedTarget, normalizedCandidate)
    const canonicalScore = similarityScore(canonicalTarget, canonicalCandidate)
    
    // Also check if one contains the other (for partial matches like "Marriott" in "JW Marriott")
    const containsBonus = 
      normalizedTarget.includes(normalizedCandidate) || 
      normalizedCandidate.includes(normalizedTarget) ? 0.2 : 0
    
    const score = Math.max(directScore, canonicalScore) + containsBonus
    
    if (score > bestScore) {
      bestScore = score
      bestMatch = candidate
      bestIndex = i
    }
  }
  
  if (bestScore >= threshold) {
    return { match: bestMatch, score: Math.min(bestScore, 1), index: bestIndex }
  }
  
  return { match: null, score: bestScore, index: -1 }
}

/**
 * Detect the business category from name using common keywords
 */
export function detectCategoryFromName(businessName: string): string | null {
  const name = businessName.toLowerCase()
  
  // Restaurant keywords
  const restaurantKeywords = ['restaurant', 'grill', 'cafe', 'coffee', 'pizza', 'burger', 
    'taco', 'sushi', 'bbq', 'bar', 'pub', 'bistro', 'diner', 'kitchen', 'eatery']
  if (restaurantKeywords.some(k => name.includes(k))) return 'dining'
  
  // Gas station keywords
  const gasKeywords = ['gas', 'fuel', 'petroleum', 'station', 'mart']
  if (gasKeywords.some(k => name.includes(k))) return 'gas'
  
  // Grocery keywords
  const groceryKeywords = ['grocery', 'supermarket', 'market', 'foods', 'fresh']
  if (groceryKeywords.some(k => name.includes(k))) return 'groceries'
  
  // Hotel keywords
  const hotelKeywords = ['hotel', 'inn', 'suites', 'resort', 'lodge', 'motel']
  if (hotelKeywords.some(k => name.includes(k))) return 'hotels'
  
  // Travel keywords
  const travelKeywords = ['airlines', 'airways', 'air lines', 'airport', 'rental car']
  if (travelKeywords.some(k => name.includes(k))) return 'travel'
  
  // Drugstore keywords
  const drugstoreKeywords = ['pharmacy', 'drug', 'rx']
  if (drugstoreKeywords.some(k => name.includes(k))) return 'drugstores'
  
  // Home improvement keywords
  const homeKeywords = ['hardware', 'home improvement', 'lumber']
  if (homeKeywords.some(k => name.includes(k))) return 'home_improvement'
  
  // Streaming keywords
  const streamingKeywords = ['streaming', 'subscription', 'premium']
  if (streamingKeywords.some(k => name.includes(k))) return 'streaming'
  
  return null
}

/**
 * Match a merchant name against known brand patterns to detect hotel/airline brands
 */
export function detectBrandFromName(businessName: string): {
  type: 'hotel' | 'airline' | null
  brand: string | null
} {
  const name = businessName.toLowerCase()
  
  // Hotel brand detection
  const hotelBrands: Record<string, string[]> = {
    'marriott': ['marriott', 'bonvoy', 'courtyard', 'residence inn', 'fairfield', 
                 'springhill', 'towneplace', 'aloft', 'w hotel', 'edition', 
                 'st. regis', 'st regis', 'luxury collection', 'ritz-carlton', 'ritz carlton',
                 'sheraton', 'westin', 'le meridien', 'tribute', 'autograph'],
    'hilton': ['hilton', 'hampton inn', 'hampton by hilton', 'doubletree', 'embassy suites',
               'homewood suites', 'home2 suites', 'waldorf astoria', 'conrad', 'canopy', 
               'curio', 'tapestry', 'lxi', 'motto', 'signia', 'tru by hilton'],
    'hyatt': ['hyatt', 'park hyatt', 'grand hyatt', 'andaz', 'alila', 'thompson', 
              'unbound', 'destination', 'hyatt place', 'hyatt house', 'hyatt centric'],
    'ihg': ['intercontinental', 'holiday inn', 'crowne plaza', 'kimpton', 'indigo',
            'even hotels', 'avid hotels', 'staybridge', 'candlewood', 'regent'],
    'wyndham': ['wyndham', 'days inn', 'super 8', 'ramada', 'la quinta', 'wingate',
                'baymont', 'microtel', 'hawthorn', 'trademark'],
    'choice': ['choice hotels', 'comfort inn', 'quality inn', 'sleep inn', 'clarion',
               'econo lodge', 'rodeway inn', 'mainstreet', 'suburban', 'woodspring'],
  }
  
  for (const [brand, patterns] of Object.entries(hotelBrands)) {
    if (patterns.some(p => name.includes(p))) {
      return { type: 'hotel', brand }
    }
  }
  
  // Airline brand detection
  const airlineBrands: Record<string, string[]> = {
    'united': ['united airlines', 'united air'],
    'delta': ['delta airlines', 'delta air'],
    'american': ['american airlines', 'american air', ' aa '],
    'southwest': ['southwest airlines', 'southwest air'],
    'jetblue': ['jetblue', 'jet blue'],
    'alaska': ['alaska airlines', 'alaska air'],
  }
  
  for (const [brand, patterns] of Object.entries(airlineBrands)) {
    if (patterns.some(p => name.includes(p))) {
      return { type: 'airline', brand }
    }
  }
  
  return { type: null, brand: null }
}

export default {
  levenshteinDistance,
  similarityScore,
  normalizeBusinessName,
  getCanonicalName,
  findBestMatch,
  detectCategoryFromName,
  detectBrandFromName,
  BUSINESS_ALIASES,
}
