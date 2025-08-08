// Smoke tests for cards recommendations GET route
// Covers validation error, basic category mapping, businessName brand detection & distance bonus paths

jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}))

// Mock supabase client to return no business so that businessName path is used
jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'not found' } })
        })
      })
    })
  })
}))

import { GET as recGET } from '@/app/api/cards/recommendations/route'

// Helper to build minimal request-like object with url
function buildReq(url: string) {
  return { url } as any
}

describe('cards/recommendations GET smoke', () => {
  it('returns 400 when missing category and businessId', async () => {
    const res: any = await recGET(buildReq('https://test.local/api/cards/recommendations'))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns recommendations for category only', async () => {
    const res: any = await recGET(buildReq('https://test.local/api/cards/recommendations?category=dining'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.recommendations)).toBe(true)
    expect(data.recommendations.length).toBeGreaterThan(0)
  })

  it('brand + distance path with businessName and coords', async () => {
    // Need category or businessId per route validation; include category=hotels to exercise brand logic
    const res: any = await recGET(buildReq('https://test.local/api/cards/recommendations?category=hotels&businessName=Marriott%20Downtown&lat=40&lng=-73'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.business?.name).toContain('Marriott')
    expect(data.recommendations[0]).toHaveProperty('reasons')
  })
})
