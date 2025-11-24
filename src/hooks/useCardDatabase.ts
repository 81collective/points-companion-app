import { useState, useEffect, useCallback } from 'react'

export interface CardReward {
  category: string
  multiplier: number
  cap?: number
  notes?: string
}

export interface CardOffer {
  welcome_bonus?: string
  bonus_points?: number
  spend_requirement?: number
  time_period?: string
  expires?: string
  verified?: boolean
}

export interface CreditCard {
  id: string
  name: string
  issuer: string
  annual_fee: number
  point_value_cents: number
  foreign_transaction_fee: boolean
  popular: boolean
  rewards: CardReward[]
  offers?: CardOffer
}

export interface CardDatabaseFilters {
  issuer?: string
  category?: string
  popular?: boolean
  withOffers?: boolean
  includeOffers?: boolean
}

export interface UseCardDatabaseResult {
  cards: CreditCard[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  searchCards: (query: string) => Promise<CreditCard[]>
  getCardById: (id: string) => Promise<CreditCard | null>
  getCardsWithOffers: () => Promise<CreditCard[]>
  getPopularCards: () => Promise<CreditCard[]>
  getCardsByIssuer: (issuer: string) => Promise<CreditCard[]>
  getCardsByCategory: (category: string) => Promise<CreditCard[]>
}

const API_BASE = '/api/cards/database'

/**
 * Hook for accessing the TOML-based credit card database
 * 
 * @param filters - Optional filters to apply to the card list
 * @param autoFetch - Whether to fetch cards on mount (default: true)
 */
export function useCardDatabase(
  filters?: CardDatabaseFilters,
  autoFetch: boolean = true
): UseCardDatabaseResult {
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const buildUrl = useCallback((baseFilters?: CardDatabaseFilters) => {
    const params = new URLSearchParams()
    const f = baseFilters || filters
    
    if (f?.issuer) params.set('issuer', f.issuer)
    if (f?.category) params.set('category', f.category)
    if (f?.popular) params.set('popular', 'true')
    if (f?.withOffers) params.set('withOffers', 'true')
    if (f?.includeOffers === false) params.set('includeOffers', 'false')
    
    const queryString = params.toString()
    return queryString ? `${API_BASE}?${queryString}` : API_BASE
  }, [filters])

  const fetchCards = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(buildUrl())
      if (!response.ok) {
        throw new Error(`Failed to fetch cards: ${response.statusText}`)
      }
      const data = await response.json()
      setCards(data.cards || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cards'
      setError(message)
      console.error('[useCardDatabase] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [buildUrl])

  const searchCards = useCallback(async (query: string): Promise<CreditCard[]> => {
    try {
      const response = await fetch(`${API_BASE}?search=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      return data.cards || []
    } catch (err) {
      console.error('[useCardDatabase] Search error:', err)
      return []
    }
  }, [])

  const getCardById = useCallback(async (id: string): Promise<CreditCard | null> => {
    try {
      const response = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`)
      if (!response.ok) return null
      const data = await response.json()
      return data.card || null
    } catch (err) {
      console.error('[useCardDatabase] Get by ID error:', err)
      return null
    }
  }, [])

  const getCardsWithOffers = useCallback(async (): Promise<CreditCard[]> => {
    try {
      const response = await fetch(`${API_BASE}?withOffers=true`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      return data.cards || []
    } catch (err) {
      console.error('[useCardDatabase] Get with offers error:', err)
      return []
    }
  }, [])

  const getPopularCards = useCallback(async (): Promise<CreditCard[]> => {
    try {
      const response = await fetch(`${API_BASE}?popular=true`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      return data.cards || []
    } catch (err) {
      console.error('[useCardDatabase] Get popular error:', err)
      return []
    }
  }, [])

  const getCardsByIssuer = useCallback(async (issuer: string): Promise<CreditCard[]> => {
    try {
      const response = await fetch(`${API_BASE}?issuer=${encodeURIComponent(issuer)}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      return data.cards || []
    } catch (err) {
      console.error('[useCardDatabase] Get by issuer error:', err)
      return []
    }
  }, [])

  const getCardsByCategory = useCallback(async (category: string): Promise<CreditCard[]> => {
    try {
      const response = await fetch(`${API_BASE}?category=${encodeURIComponent(category)}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      return data.cards || []
    } catch (err) {
      console.error('[useCardDatabase] Get by category error:', err)
      return []
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchCards()
    }
  }, [autoFetch, fetchCards])

  return {
    cards,
    loading,
    error,
    refetch: fetchCards,
    searchCards,
    getCardById,
    getCardsWithOffers,
    getPopularCards,
    getCardsByIssuer,
    getCardsByCategory
  }
}

/**
 * Get the best card for a specific spending category
 */
export function getBestCardForCategory(
  cards: CreditCard[], 
  category: string
): CreditCard | null {
  const categoryLower = category.toLowerCase()
  
  let bestCard: CreditCard | null = null
  let bestMultiplier = 0
  
  for (const card of cards) {
    for (const reward of card.rewards) {
      if (reward.category.toLowerCase().includes(categoryLower)) {
        // Calculate effective value: multiplier * point value
        const effectiveValue = reward.multiplier * card.point_value_cents
        if (effectiveValue > bestMultiplier) {
          bestMultiplier = effectiveValue
          bestCard = card
        }
      }
    }
  }
  
  return bestCard
}

/**
 * Calculate the effective cash back rate for a card in a category
 */
export function calculateEffectiveRate(
  card: CreditCard,
  category: string
): number {
  const categoryLower = category.toLowerCase()
  
  for (const reward of card.rewards) {
    if (reward.category.toLowerCase().includes(categoryLower)) {
      // Return effective rate as percentage (e.g., 3x points at 2 cents = 6%)
      return (reward.multiplier * card.point_value_cents) / 100
    }
  }
  
  // Check for "all purchases" or "everything else" category
  const baseReward = card.rewards.find(r => 
    r.category.toLowerCase().includes('all') || 
    r.category.toLowerCase().includes('everything')
  )
  
  if (baseReward) {
    return (baseReward.multiplier * card.point_value_cents) / 100
  }
  
  return 0
}

/**
 * Get cards sorted by effective rate for a category
 */
export function sortCardsByCategory(
  cards: CreditCard[],
  category: string
): CreditCard[] {
  return [...cards].sort((a, b) => {
    const rateA = calculateEffectiveRate(a, category)
    const rateB = calculateEffectiveRate(b, category)
    return rateB - rateA
  })
}

export default useCardDatabase
