// Smoke tests for /api/assistant/topics route to ensure structured JSON and fallback classification work

jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}))

import { POST as topicsPOST } from '@/app/api/assistant/topics/route'

// Helper to build a minimal NextRequest-like object for JSON body
function buildReq(body: any) {
  return {
    json: async () => body,
  } as any
}

describe('assistant topics API', () => {
  const ORIGINAL_KEY = process.env.OPENAI_API_KEY

  beforeAll(() => {
    // Force heuristic fallback path
    delete (process.env as any).OPENAI_API_KEY
  })

  afterAll(() => {
    process.env.OPENAI_API_KEY = ORIGINAL_KEY
  })

  it('returns empty structures for empty input', async () => {
    const res: any = await topicsPOST(buildReq({ messages: [] }))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.topics)).toBe(true)
    expect(Array.isArray(data.categories)).toBe(true)
    expect(Array.isArray(data.trending_terms)).toBe(true)
    expect(Array.isArray(data.pain_points)).toBe(true)
  })

  it('classifies sample messages with fallback heuristic', async () => {
    const sample = {
      messages: [
        { content: 'Best card for dining rewards?' },
        { content: 'Gas cashback rates this quarter' },
        { content: 'Travel lounge access and insurance terms' },
        { content: 'App error when viewing benefits' },
      ]
    }
    const res: any = await topicsPOST(buildReq(sample))
    const data = await res.json()

    expect(data.success).toBe(true)
    // topics
    expect(Array.isArray(data.topics)).toBe(true)
    expect(data.topics.length).toBeGreaterThan(0)
    // categories include known buckets
    const categoryNames = (data.categories || []).map((c: any) => c.name)
    expect(categoryNames.length).toBeGreaterThan(0)
    expect(categoryNames).toEqual(expect.arrayContaining([
      'rewards_optimization',
      'travel_planning',
      'benefits_terms',
    ]))
  })
})
