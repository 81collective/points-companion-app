/**
 * getRequestUrl helper
 * Safely constructs a URL given a request-like object or string.
 */
export function getRequestUrl(requestOrUrl?: { url?: string } | string | undefined) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const urlString = typeof requestOrUrl === 'string' ? requestOrUrl : requestOrUrl?.url;
  return new URL(urlString ?? '/', base);
}

export default getRequestUrl;
