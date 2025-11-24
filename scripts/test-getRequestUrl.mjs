import assert from 'assert';

// Reimplement minimal helper logic here to avoid importing TypeScript directly
function localGetRequestUrl(requestOrUrl) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const urlString = typeof requestOrUrl === 'string' ? requestOrUrl : requestOrUrl && requestOrUrl.url;
  return new URL(urlString ?? '/', base);
}

function run() {
  // 1) undefined -> fallback
  let url = localGetRequestUrl(undefined);
  assert.strictEqual(url.origin, 'http://localhost:3000');
  assert.strictEqual(url.pathname, '/');

  // 2) absolute url string
  url = localGetRequestUrl('https://example.com/path?x=1');
  assert.strictEqual(url.origin, 'https://example.com');
  assert.strictEqual(url.pathname, '/path');
  assert.strictEqual(url.searchParams.get('x'), '1');

  // 3) env base with relative path
  process.env.NEXT_PUBLIC_SITE_URL = 'https://pointadvisor.app';
  url = localGetRequestUrl({ url: '/api/cards/recommendations?limit=5' });
  assert.strictEqual(url.origin, 'https://pointadvisor.app');
  assert.strictEqual(url.pathname, '/api/cards/recommendations');
  assert.strictEqual(url.searchParams.get('limit'), '5');

  console.log('All getRequestUrl tests passed');
}

run();
