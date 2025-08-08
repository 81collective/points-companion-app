// Tests the client-fallback path in location/nearby when only NEXT_PUBLIC key is set

// Minimal Next.js server mocks
jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}));

// Supabase mock with select-chain (gte/lte/eq/limit)
jest.mock('@/lib/supabase', () => ({
  createClient: () => {
    const chain: any = {
      gte: () => chain,
      lte: () => chain,
      eq: () => chain,
      limit: () => Promise.resolve({ data: [], error: null })
    };
    return {
      from: () => ({
        select: () => chain,
      })
    };
  }
}));

import { GET as nearbyGET } from '@/app/api/location/nearby/route';

function buildReq(params: string) {
  return { url: `https://example.test/api/location/nearby${params}` } as any;
}

describe('location nearby API - client fallback when only NEXT_PUBLIC key present', () => {
  const originalEnv = process.env;
  let originalFetch: any;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    const envCopy = { ...originalEnv } as any;
    delete envCopy.GOOGLE_MAPS_API_KEY; // ensure no server key
    envCopy.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'public_key';
    envCopy.NODE_ENV = 'test';
    process.env = envCopy;

    originalFetch = global.fetch as any;
    global.fetch = jest.fn(); // should not be called in this path
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    logSpy.mockRestore();
  });

  it('instructs client-side places fetch and returns DB results', async () => {
    const res: any = await nearbyGET(buildReq('?lat=40.0&lng=-73.0&radius=1000&category=dining'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.use_client_places).toBe(true);
    expect(data.client_api_available).toBe(true);
    expect(Array.isArray(data.businesses)).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
