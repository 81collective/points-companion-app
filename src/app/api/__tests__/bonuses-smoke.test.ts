// Smoke tests for bonuses API route
jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}))

import { GET as bonusesGET, POST as bonusesPOST } from '@/app/api/bonuses/route'

function buildReq(urlParams: string = '', body?: any) {
  const url = `https://example.test/api/bonuses${urlParams}`
  return {
    url,
    json: async () => body,
  } as any
}

describe('bonuses API smoke', () => {
  it('GET returns success with data array', async () => {
    const res: any = await bonusesGET(buildReq('?status=active'))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('POST validates required fields', async () => {
    const res: any = await bonusesPOST(buildReq('', { cardName: 'X', cardIssuer: 'Y', requiredSpend: 1000, deadline: '2030-01-01', bonusAmount: 10000, bonusType: 'points' }))
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.cardName).toBe('X')
  })
})
