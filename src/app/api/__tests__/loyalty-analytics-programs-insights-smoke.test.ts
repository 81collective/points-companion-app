// Smoke tests for loyalty analytics, programs, insights

jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}))

import { GET as analyticsGET } from '@/app/api/loyalty/analytics/route'
import { GET as programsGET } from '@/app/api/loyalty/programs/route'
import { GET as insightsGET } from '@/app/api/loyalty/insights/route'

function buildReq(url: string) { return { url } as any }

describe('loyalty analytics/programs/insights smoke', () => {
  it('analytics GET returns mock analytics', async () => {
    const res: any = await analyticsGET()
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  it('programs GET returns programs list', async () => {
    const res: any = await programsGET(buildReq('https://t.local/api/loyalty/programs'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('insights GET returns insights', async () => {
    const res: any = await insightsGET()
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })
})
