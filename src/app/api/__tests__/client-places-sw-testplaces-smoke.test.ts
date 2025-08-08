// Smoke tests for client-places, sw, and test-places route files

jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}))

import { GET as clientPlacesGET } from '@/app/api/location/client-places/route'
import { GET as swGET, POST as swPOST } from '@/app/api/sw/route'
import { GET as testPlacesGET } from '@/app/api/test-places/route'

function buildReq(url: string) { return { url } as any }
function buildBody(body: any) { return { json: async () => body } as any }

describe('misc route files smoke', () => {
  it('client-places GET validates coords', async () => {
    const resMissing: any = await clientPlacesGET(buildReq('https://t.local/api/location/client-places'))
    const dataMissing = await resMissing.json()
    expect(dataMissing.success).toBe(false)

    const res: any = await clientPlacesGET(buildReq('https://t.local/api/location/client-places?lat=1&lng=2&category=cafe&radius=1000'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.use_client_side_places).toBe(true)
  })

  it('sw GET root and sync actions', async () => {
    const resRoot: any = await swGET(buildReq('https://t.local/api/sw'))
    const dataRoot = await resRoot.json()
    expect(dataRoot).toHaveProperty('message')

    const resSync: any = await swGET(buildReq('https://t.local/api/sw?action=sync'))
    const dataSync = await resSync.json()
    expect(resSync.status).toBe(200)
    expect(dataSync.success).toBe(true)
  })

  it('sw POST handles types and errors', async () => {
    const ok: any = await swPOST(buildBody({ type: 'BACKGROUND_SYNC', data: {} }))
    const okData = await ok.json()
    expect(ok.status).toBe(200)
    expect(okData.success).toBe(true)

    const badType: any = await swPOST(buildBody({ type: 'UNKNOWN' }))
    expect(badType.status).toBe(400)
  })

  it('test-places GET success path', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: 'OK', results: [{ name: 'X' }] }) })

    const res: any = await testPlacesGET()
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.api_key_working).toBe(true)
  })
})
