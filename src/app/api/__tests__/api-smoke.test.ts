// Phase 2 API route smoke tests: ensure handlers return structured JSON without executing heavy logic.
// These tests intentionally mock heavy dependencies (OpenAI, DB updates, categorizer) to provide minimal coverage.

jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}))

// Mocks for heavy libs
jest.mock('@/lib/transactionCategorizer', () => ({
  categorizeTransaction: jest.fn(async () => ({ category: 'dining', confidence: 0.9 })),
  batchCategorize: jest.fn(async (arr: any[]) => arr.map(() => ({ category: 'dining', confidence: 0.9 })))
}))

jest.mock('@/lib/cardDataUpdater', () => ({
  CardDataUpdater: {
    fetchLatestCards: jest.fn(async () => ([{ id: 'c1' }, { id: 'c2' }])),
    updateDatabase: jest.fn(async () => true),
    getCurrentQuarterlyCategories: jest.fn(async () => ([{ category: 'gas', multiplier: 5 }]))
  }
}))

jest.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(async () => ({ choices: [{ message: { content: '[]' } }] }))
      }
    }
  }
}))

import { POST as categorizePOST } from '@/app/api/categorize/route'
import { POST as cardsPOST, GET as cardsGET } from '@/app/api/cards/update/route'
import { POST as recPOST } from '@/app/api/recommendations/route'

// Helper to build a minimal NextRequest-like object for JSON body
function buildReq(body: any) {
  return {
    json: async () => body,
  } as any
}

describe('API smoke tests', () => {
  it('categorize POST single transaction', async () => {
    const res: any = await categorizePOST(buildReq({ merchant: 'Cafe', amount: 12.5, description: 'Coffee' }))
    const data = await res.json()
    expect(data.category).toBe('dining')
  })

  it('categorize POST batch', async () => {
    const res: any = await categorizePOST(buildReq([{ merchant: 'Cafe', amount: 10 }]))
    const data = await res.json()
    expect(Array.isArray(data.results)).toBe(true)
    expect(data.results[0].category).toBe('dining')
  })

  it('cards update POST', async () => {
    const res: any = await cardsPOST()
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.cardsUpdated).toBeDefined()
  })

  it('cards update GET', async () => {
    const res: any = await cardsGET()
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data.cards)).toBe(true)
  })

  it('recommendations POST', async () => {
    const res: any = await recPOST(buildReq({ transactions: [], cards: [] }))
    const data = await res.json()
    expect(Array.isArray(data.recommendations)).toBe(true)
  })
})
