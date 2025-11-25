/**
 * AI-Enhanced Business Classifier
 * 
 * Uses GPT to classify businesses when the rule-based classifier has low confidence.
 * This provides more accurate categorization for card recommendations.
 */

import { getOpenAIClient, isOpenAIConfigured } from '../openai-server';
import { classifyBusiness, Classification, ProviderSignals } from './businessClassifier';
import { Taxonomy } from './mccMap';
import logger from '../logger';

const log = logger.child({ component: 'ai-business-classifier' });

// Valid taxonomy values for validation
const VALID_TAXONOMIES: Taxonomy[] = [
  'dining', 'coffee', 'groceries', 'gas', 'shopping', 
  'pharmacy', 'entertainment', 'travel', 'electronics', 
  'hotels', 'home_improvement'
];

// Cache for AI classifications to reduce API calls
const classificationCache = new Map<string, Classification>();
const CACHE_MAX_SIZE = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  classification: Classification;
  timestamp: number;
}

const cacheWithTTL = new Map<string, CacheEntry>();

function getCacheKey(name: string, googleTypes?: string[]): string {
  return `${name.toLowerCase().trim()}|${(googleTypes || []).sort().join(',')}`;
}

function getFromCache(key: string): Classification | null {
  const entry = cacheWithTTL.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cacheWithTTL.delete(key);
    return null;
  }
  
  return entry.classification;
}

function setCache(key: string, classification: Classification): void {
  // Evict oldest entries if cache is full
  if (cacheWithTTL.size >= CACHE_MAX_SIZE) {
    const oldest = Array.from(cacheWithTTL.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) cacheWithTTL.delete(oldest[0]);
  }
  
  cacheWithTTL.set(key, { classification, timestamp: Date.now() });
}

/**
 * Classify a single business using AI when rule-based confidence is low
 */
export async function classifyBusinessWithAI(input: {
  name: string;
  googleTypes?: string[];
  mapboxPlaceName?: string;
  address?: string;
}): Promise<Classification> {
  // First, try rule-based classification
  const ruleBasedResult = classifyBusiness({
    name: input.name,
    googleTypes: input.googleTypes,
    mapboxPlaceName: input.mapboxPlaceName,
  });

  // If confidence is high enough, use rule-based result
  if (ruleBasedResult.confidence >= 0.7) {
    return ruleBasedResult;
  }

  // Check cache
  const cacheKey = getCacheKey(input.name, input.googleTypes);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  // If OpenAI is not configured, return rule-based result
  if (!isOpenAIConfigured) {
    log.debug('OpenAI not configured, using rule-based classification', { name: input.name });
    return ruleBasedResult;
  }

  const client = getOpenAIClient();
  if (!client) {
    return ruleBasedResult;
  }

  try {
    const prompt = buildClassificationPrompt(input);
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective
      messages: [
        {
          role: 'system',
          content: `You are an expert at categorizing businesses for credit card rewards optimization.
          
Classify businesses into EXACTLY ONE of these categories:
- dining: Restaurants, fast food, cafeterias, meal delivery
- coffee: Coffee shops, cafes, tea houses
- groceries: Supermarkets, grocery stores, food markets, bodegas
- gas: Gas stations, fuel stations, EV charging
- shopping: Retail stores, department stores, malls, online shopping
- pharmacy: Drugstores, pharmacies, medical supplies
- entertainment: Movies, theaters, attractions, events, sports
- travel: Airlines, hotels, car rentals, travel agencies
- electronics: Electronics stores, tech retailers, computer stores
- hotels: Hotels, motels, lodging, resorts
- home_improvement: Hardware stores, home goods, furniture

Respond with ONLY a JSON object: {"taxonomy": "category_name", "confidence": 0.0-1.0, "reason": "brief explanation"}`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.1, // Low temperature for consistent results
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) {
      return ruleBasedResult;
    }

    // Parse AI response
    const parsed = JSON.parse(text);
    const taxonomy = parsed.taxonomy as Taxonomy;
    
    // Validate taxonomy
    if (!VALID_TAXONOMIES.includes(taxonomy)) {
      log.warn('AI returned invalid taxonomy', { name: input.name, taxonomy });
      return ruleBasedResult;
    }

    const aiClassification: Classification = {
      taxonomy,
      mccCandidates: ruleBasedResult.mccCandidates, // Keep MCC candidates from rule-based
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.8)),
      brandId: ruleBasedResult.brandId,
    };

    // Cache the result
    setCache(cacheKey, aiClassification);

    log.debug('AI classified business', {
      name: input.name,
      taxonomy,
      confidence: aiClassification.confidence,
      reason: parsed.reason,
    });

    return aiClassification;
  } catch (error) {
    log.warn('AI classification failed, using rule-based', { name: input.name, error });
    return ruleBasedResult;
  }
}

/**
 * Batch classify multiple businesses - more efficient for bulk operations
 */
export async function classifyBusinessesBatch(
  businesses: Array<{
    id: string;
    name: string;
    googleTypes?: string[];
    mapboxPlaceName?: string;
    address?: string;
  }>
): Promise<Map<string, Classification>> {
  const results = new Map<string, Classification>();
  const needsAI: typeof businesses = [];

  // First pass: use rule-based for high-confidence, check cache
  for (const biz of businesses) {
    const ruleBasedResult = classifyBusiness({
      name: biz.name,
      googleTypes: biz.googleTypes,
      mapboxPlaceName: biz.mapboxPlaceName,
    });

    if (ruleBasedResult.confidence >= 0.7) {
      results.set(biz.id, ruleBasedResult);
      continue;
    }

    const cacheKey = getCacheKey(biz.name, biz.googleTypes);
    const cached = getFromCache(cacheKey);
    if (cached) {
      results.set(biz.id, cached);
      continue;
    }

    needsAI.push(biz);
  }

  // If no AI calls needed or OpenAI not configured, return
  if (needsAI.length === 0 || !isOpenAIConfigured) {
    // Fill in rule-based results for remaining
    for (const biz of needsAI) {
      results.set(biz.id, classifyBusiness({
        name: biz.name,
        googleTypes: biz.googleTypes,
        mapboxPlaceName: biz.mapboxPlaceName,
      }));
    }
    return results;
  }

  const client = getOpenAIClient();
  if (!client) {
    for (const biz of needsAI) {
      results.set(biz.id, classifyBusiness({
        name: biz.name,
        googleTypes: biz.googleTypes,
        mapboxPlaceName: biz.mapboxPlaceName,
      }));
    }
    return results;
  }

  // Batch AI classification (up to 20 at a time to avoid token limits)
  const batchSize = 20;
  for (let i = 0; i < needsAI.length; i += batchSize) {
    const batch = needsAI.slice(i, i + batchSize);
    
    try {
      const batchPrompt = batch.map((biz, idx) => 
        `${idx + 1}. "${biz.name}"${biz.address ? ` at ${biz.address}` : ''}${biz.googleTypes?.length ? ` (types: ${biz.googleTypes.slice(0, 3).join(', ')})` : ''}`
      ).join('\n');

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at categorizing businesses for credit card rewards.

Categories: dining, coffee, groceries, gas, shopping, pharmacy, entertainment, travel, electronics, hotels, home_improvement

Respond with a JSON array of objects, one per business:
[{"index": 1, "taxonomy": "category", "confidence": 0.0-1.0}]`
          },
          { role: 'user', content: `Classify these businesses:\n${batchPrompt}` }
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (text) {
        const parsed = JSON.parse(text) as Array<{ index: number; taxonomy: Taxonomy; confidence: number }>;
        
        for (const item of parsed) {
          const biz = batch[item.index - 1];
          if (biz && VALID_TAXONOMIES.includes(item.taxonomy)) {
            const ruleBasedResult = classifyBusiness({
              name: biz.name,
              googleTypes: biz.googleTypes,
              mapboxPlaceName: biz.mapboxPlaceName,
            });
            
            const classification: Classification = {
              taxonomy: item.taxonomy,
              mccCandidates: ruleBasedResult.mccCandidates,
              confidence: Math.min(1, Math.max(0, item.confidence)),
              brandId: ruleBasedResult.brandId,
            };
            
            results.set(biz.id, classification);
            setCache(getCacheKey(biz.name, biz.googleTypes), classification);
          }
        }
      }
    } catch (error) {
      log.warn('Batch AI classification failed', { error });
    }

    // Fill in any missing with rule-based
    for (const biz of batch) {
      if (!results.has(biz.id)) {
        results.set(biz.id, classifyBusiness({
          name: biz.name,
          googleTypes: biz.googleTypes,
          mapboxPlaceName: biz.mapboxPlaceName,
        }));
      }
    }
  }

  return results;
}

function buildClassificationPrompt(input: {
  name: string;
  googleTypes?: string[];
  mapboxPlaceName?: string;
  address?: string;
}): string {
  let prompt = `Classify this business: "${input.name}"`;
  
  if (input.address) {
    prompt += `\nAddress: ${input.address}`;
  }
  
  if (input.googleTypes?.length) {
    prompt += `\nGoogle Places types: ${input.googleTypes.slice(0, 5).join(', ')}`;
  }
  
  if (input.mapboxPlaceName) {
    prompt += `\nFull name: ${input.mapboxPlaceName}`;
  }
  
  return prompt;
}
