// Smoke tests for location nearby route
jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}))

jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        gte: () => ({ lte: () => ({ gte: () => ({ lte: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }) }) })
      })
    })
  })
}))

import { GET as nearbyGET } from '@/app/api/location/nearby/route'

function buildReq(params: string) {
  return { url: `https://example.test/api/location/nearby${params}` } as any
}

describe('location nearby API smoke', () => {
  it('rejects missing coords', async () => {
    const res: any = await nearbyGET(buildReq(''))
    const data = await res.json()
    expect(data.success).toBe(false)
  })

  it('returns success with coords and no data', async () => {
    const res: any = await nearbyGET(buildReq('?lat=40.0&lng=-73.0&radius=1000'))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.businesses)).toBe(true)
  })
})
