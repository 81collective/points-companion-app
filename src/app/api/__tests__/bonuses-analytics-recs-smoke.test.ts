// Smoke tests for bonuses analytics and recommendations routes

jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}))

import { GET as analyticsGET } from '@/app/api/bonuses/analytics/route'
import { GET as recsGET, POST as recsPOST } from '@/app/api/bonuses/recommendations/route'

function buildReq(url: string) {
  return { url } as any
}
function buildBody(body: any) {
  return { json: async () => body } as any
}

describe('bonuses analytics & recommendations smoke', () => {
  it('analytics GET returns mock analytics', async () => {
    const res: any = await analyticsGET(buildReq('https://test.local/api/bonuses/analytics?timeframe=30d'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  it('recommendations GET 400 without bonusId', async () => {
    const res: any = await recsGET(buildReq('https://test.local/api/bonuses/recommendations'))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('recommendations GET with bonusId returns data', async () => {
    const res: any = await recsGET(buildReq('https://test.local/api/bonuses/recommendations?bonusId=abc&urgency=high'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('recommendations POST validates bonusId', async () => {
    const res: any = await recsPOST(buildBody({}))
    const data = await res.json()
    expect(res.status).toBe(400)
  })

  it('recommendations POST returns personalized recs', async () => {
    const body = { bonusId: 'b1', userSpendingPatterns: [{ category: 'Groceries', monthlyAverage: 300 }], monthlyBudget: 4000, timeRemaining: 10 }
    const res: any = await recsPOST(buildBody(body))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })
})
