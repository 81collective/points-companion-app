import { NextRequest, NextResponse } from 'next/server'
import { 
  loadAllCards, 
  loadCurrentOffers,
  mergeOffersIntoCards,
  getCardsForCategory,
  type LoadedCard
} from '@/lib/cards/tomlCardLoader'

export const dynamic = 'force-dynamic'

// Cache for loaded cards
let cachedCards: LoadedCard[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCards(): LoadedCard[] {
  const now = Date.now()
  if (cachedCards && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedCards
  }
  
  const cards = loadAllCards()
  const offers = loadCurrentOffers()
  cachedCards = mergeOffersIntoCards(cards, offers)
  cacheTimestamp = now
  return cachedCards
}

function getCardById(cards: LoadedCard[], id: string): LoadedCard | null {
  return cards.find(c => c.id === id) || null
}

function searchCards(cards: LoadedCard[], query: string): LoadedCard[] {
  const q = query.toLowerCase()
  return cards.filter(card => 
    card.name.toLowerCase().includes(q) ||
    card.issuer.toLowerCase().includes(q) ||
    card.id.toLowerCase().includes(q) ||
    card.nickname?.toLowerCase().includes(q)
  )
}

function getCardsWithActiveOffers(cards: LoadedCard[]): LoadedCard[] {
  return cards.filter(card => card.hasElevatedBonus || card.activeSpendingPromos?.length)
}

/**
 * GET /api/cards/database
 * 
 * Query the credit card database from TOML configuration
 * 
 * Query params:
 * - id: Get specific card by ID
 * - search: Search cards by name, issuer, or category
 * - issuer: Filter by issuer (chase, amex, capital-one, citi, etc.)
 * - category: Filter by reward category (dining, travel, groceries, etc.)
 * - popular: Filter to only popular cards (true/false)
 * - withOffers: Include only cards with active offers (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const id = searchParams.get('id')
    const search = searchParams.get('search')
    const issuer = searchParams.get('issuer')
    const category = searchParams.get('category')
    const popularOnly = searchParams.get('popular') === 'true'
    const withOffersOnly = searchParams.get('withOffers') === 'true'
    
    // Load all cards with offers merged
    const allCards = getCards()
    
    // Get specific card by ID
    if (id) {
      const card = getCardById(allCards, id)
      if (!card) {
        return NextResponse.json(
          { error: 'Card not found', id },
          { status: 404 }
        )
      }
      return NextResponse.json({ card })
    }
    
    // Search cards
    if (search) {
      const cards = searchCards(allCards, search)
      return NextResponse.json({ 
        cards,
        count: cards.length,
        query: search 
      })
    }
    
    // Get cards with active offers only
    if (withOffersOnly) {
      const cards = getCardsWithActiveOffers(allCards)
      return NextResponse.json({ 
        cards,
        count: cards.length,
        hasOffers: true 
      })
    }
    
    // Start with all cards
    let cards = [...allCards]
    
    // Filter by issuer
    if (issuer) {
      const issuerLower = issuer.toLowerCase()
      cards = cards.filter(card => 
        card.issuer.toLowerCase() === issuerLower ||
        card.issuer.toLowerCase().includes(issuerLower)
      )
    }
    
    // Filter by reward category
    if (category) {
      const categoryCards = getCardsForCategory(allCards, category)
      cards = categoryCards.map(c => c.card)
    }
    
    // Filter to popular cards only
    if (popularOnly) {
      cards = cards.filter(card => card.popular === true)
    }
    
    return NextResponse.json({ 
      cards,
      count: cards.length,
      filters: {
        issuer: issuer || null,
        category: category || null,
        popular: popularOnly,
        withOffers: withOffersOnly
      }
    })
    
  } catch (error) {
    console.error('[cards/database] Error loading card database:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load card database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cards/database/refresh
 * 
 * Force refresh of the card database cache
 */
export async function POST() {
  try {
    // Clear cache and reload
    cachedCards = null
    cacheTimestamp = 0
    const cards = getCards()
    
    return NextResponse.json({ 
      success: true,
      message: 'Card database refreshed',
      cardCount: cards.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[cards/database] Error refreshing:', error)
    return NextResponse.json(
      { error: 'Failed to refresh card database' },
      { status: 500 }
    )
  }
}
