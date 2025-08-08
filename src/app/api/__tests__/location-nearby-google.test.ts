// Tests the Google Places server-side branch in location/nearby

// Minimal Next.js server mocks
jest.mock('next/server', () => ({
  NextResponse: { json: (data: any, init?: any) => ({ json: () => Promise.resolve(data), status: init?.status || 200 }) },
  NextRequest: class {}
}));

// Supabase mock with select-chain (gte/lte/eq/limit) and upsert support
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
        upsert: () => Promise.resolve({ data: [], error: null })
      })
    };
  }
}));

import { GET as nearbyGET } from '@/app/api/location/nearby/route';

function buildReq(params: string) {
  return { url: `https://example.test/api/location/nearby${params}` } as any;
}

describe('location nearby API - Google server branch', () => {
  const originalEnv = process.env;
  let originalFetch: any;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GOOGLE_MAPS_API_KEY: 'test_key', NODE_ENV: 'test' } as any;
    originalFetch = global.fetch;
    // Mock fetch to simulate Google Places Nearby Search API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'OK',
        results: [
          {
            name: 'Test Restaurant',
            vicinity: '123 Test St',
            geometry: { location: { lat: 40.0005, lng: -73.0005 } },
            place_id: 'place_123',
            rating: 4.5,
            price_level: 2
          }
        ]
      })
    });
    // Silence noisy logs
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    logSpy.mockRestore();
  });

  it('uses Google Places when server key is set and merges results', async () => {
    const res: any = await nearbyGET(buildReq('?lat=40.0&lng=-73.0&radius=1000&category=dining'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.businesses)).toBe(true);
    expect(data.businesses.length).toBeGreaterThan(0);

    // The pushed Google entry should carry an id prefix and our place fields mapped
    const googleBusiness = data.businesses.find((b: any) => b.id && String(b.id).startsWith('google_'));
    expect(googleBusiness).toBeTruthy();
    expect(googleBusiness.place_id).toBe('place_123');
    expect(googleBusiness.name).toBe('Test Restaurant');
    expect(googleBusiness.latitude).toBeCloseTo(40.0005, 5);
    expect(googleBusiness.longitude).toBeCloseTo(-73.0005, 5);
  });
});
