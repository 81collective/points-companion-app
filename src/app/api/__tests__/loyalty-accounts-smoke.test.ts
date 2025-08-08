// Smoke tests for loyalty/accounts route

jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}))

import { GET as accountsGET, POST as accountsPOST } from '@/app/api/loyalty/accounts/route'

function buildReq(url: string) {
  return { url } as any
}
function buildBody(body: any) {
  return { json: async () => body } as any
}

describe('loyalty/accounts smoke', () => {
  it('GET returns mock accounts with pagination', async () => {
    const res: any = await accountsGET(buildReq('https://test.local/api/loyalty/accounts?page=1&limit=10'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.pagination).toBeDefined()
  })

  it('POST validation error when required fields missing', async () => {
    const res: any = await accountsPOST(buildBody({}))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('POST creates a mock account', async () => {
    const body = { programId: 'marriott-bonvoy', accountNumber: '****9999', syncEnabled: true }
    const res: any = await accountsPOST(buildBody(body))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.programId).toBe('marriott-bonvoy')
  })
})
