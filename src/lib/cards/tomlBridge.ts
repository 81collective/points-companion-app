/**
 * TOML to TypeScript Bridge
 * 
 * Converts TOML-loaded card data to match the existing CreditCardTemplate format.
 * This allows gradual migration from TypeScript to TOML configuration while
 * maintaining full backwards compatibility with the existing recommendation system.
 */

import { CreditCardTemplate, RewardCategory } from '@/types/creditCards'
import { 
  loadAllCards, 
  loadCurrentOffers, 
  mergeOffersIntoCards,
  type LoadedCard,
  type CurrentOffersConfig,
  type ElevatedBonus
} from './tomlCardLoader'

/**
 * Convert a LoadedCard to CreditCardTemplate format
 * LoadedCard already extends CreditCardTemplate, so this is mainly for type narrowing
 */
function loadedCardToTemplate(card: LoadedCard): CreditCardTemplate {
  // Build bonus offer string from elevated bonus if present
  const bonusOffer = card.bonusOffer
  // The elevated bonus is already merged into bonusOffer by mergeOffersIntoCards
  
  return {
    id: card.id,
    name: card.name,
    issuer: card.issuer,
    nickname: card.nickname,
    image: card.image,
    rewards: card.rewards,
    popular: card.popular,
    business: card.business,
    version: card.version,
    annualFee: card.annualFee,
    bonusOffer,
  }
}

/**
 * Load all cards from TOML and convert to CreditCardTemplate format
 */
export function loadTomlCardsAsTemplates(): CreditCardTemplate[] {
  const cards = loadAllCards()
  const offers = loadCurrentOffers()
  const mergedCards = mergeOffersIntoCards(cards, offers)
  
  return mergedCards.map(loadedCardToTemplate)
}

/**
 * Get cards with active bonus offers from TOML
 */
export function getCardsWithActiveOffersAsTemplates(): CreditCardTemplate[] {
  const cards = loadAllCards()
  const offers = loadCurrentOffers()
  const mergedCards = mergeOffersIntoCards(cards, offers)
  
  const cardsWithOffers = mergedCards.filter(card => 
    card.hasElevatedBonus || 
    (card.activeSpendingPromos && card.activeSpendingPromos.length > 0)
  )
  
  return cardsWithOffers.map(loadedCardToTemplate)
}

/**
 * Search cards by name or issuer from TOML database
 */
export function searchTomlCardsAsTemplates(query: string): CreditCardTemplate[] {
  const cards = loadAllCards()
  const offers = loadCurrentOffers()
  const mergedCards = mergeOffersIntoCards(cards, offers)
  const queryLower = query.toLowerCase()
  
  const matches = mergedCards.filter(card => 
    card.name.toLowerCase().includes(queryLower) ||
    card.issuer.toLowerCase().includes(queryLower) ||
    card.id.toLowerCase().includes(queryLower) ||
    card.nickname?.toLowerCase().includes(queryLower)
  )
  
  return matches.map(loadedCardToTemplate)
}

/**
 * Get cards by category from TOML database
 */
export function getTomlCardsByCategory(category: RewardCategory): CreditCardTemplate[] {
  const cards = loadAllCards()
  const offers = loadCurrentOffers()
  const mergedCards = mergeOffersIntoCards(cards, offers)
  
  const matches = mergedCards.filter(card => 
    card.rewards.some(reward => reward.category === category)
  )
  
  return matches.map(loadedCardToTemplate)
}

/**
 * Get popular cards from TOML database
 */
export function getPopularTomlCardsAsTemplates(): CreditCardTemplate[] {
  const cards = loadAllCards()
  const offers = loadCurrentOffers()
  const mergedCards = mergeOffersIntoCards(cards, offers)
  
  const popular = mergedCards.filter(card => card.popular === true)
  
  return popular.map(loadedCardToTemplate)
}

/**
 * Get the full LoadedCard data (with extended fields like point value, benefits, etc.)
 */
export function loadFullCardDatabase(): LoadedCard[] {
  const cards = loadAllCards()
  const offers = loadCurrentOffers()
  return mergeOffersIntoCards(cards, offers)
}

// Re-export types for convenience
export type { LoadedCard, CurrentOffersConfig, ElevatedBonus }
