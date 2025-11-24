import getRequestUrl from '@/lib/getRequestUrl';

describe('getRequestUrl helper', () => {
  const originalEnvNextPub = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnvNextPub;
  });

  test('returns fallback base when input is undefined', () => {
    const url = getRequestUrl(undefined);
    expect(url).toBeInstanceOf(URL);
    expect(url.origin).toBe('http://localhost:3000');
    expect(url.pathname).toBe('/');
  });

  test('parses absolute url string correctly', () => {
    const url = getRequestUrl('https://example.com/path?x=1');
    expect(url.origin).toBe('https://example.com');
    expect(url.pathname).toBe('/path');
    expect(url.searchParams.get('x')).toBe('1');
  });

  test('parses request-like object with relative path using env base', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://pointadvisor.app';
    const url = getRequestUrl({ url: '/api/cards/recommendations?limit=5' });
    expect(url.origin).toBe('https://pointadvisor.app');
    expect(url.pathname).toBe('/api/cards/recommendations');
    expect(url.searchParams.get('limit')).toBe('5');
  });
});
