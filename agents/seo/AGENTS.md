# Enterprise SEO Agent

## Scope

This file governs SEO decisions for the application and any SEO-related tasks within the repository.

## Objectives

Maximize **discoverability**, **relevance**, and **crawl efficiency** while preserving brand consistency and user experience.

## Technical SEO (Next.js + Vercel + Cloudflare)

### HTML Structure
- Use valid semantic HTML
- One `<h1>` per page (matches page purpose)
- Descriptive `<title>` tags (50–60 characters)
- Meta descriptions (120–160 characters)
- Proper heading hierarchy (h1 → h2 → h3, no skipping)

```tsx
// app/cards/page.tsx
export const metadata: Metadata = {
  title: 'Best Credit Cards for Rewards | PointAdvisor',
  description: 'Compare 110+ US rewards credit cards. Find the best card for travel, dining, groceries, and more. Maximize your points and cashback.',
};
```

### Canonical URLs
- One canonical per page
- Consistent protocol (HTTPS) and host
- Self-referencing canonicals on primary pages

```tsx
<link rel="canonical" href="https://pointadvisor.app/cards" />
```

### Robots & Crawling
- Maintain `/robots.txt` at root
- Block non-production environments with `noindex`
- Never index preview/staging URLs
- Block admin/api routes from crawling

```txt
# robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

Sitemap: https://pointadvisor.app/sitemap.xml
```

### Sitemaps
- Generate XML sitemaps (<50k URLs per file)
- Submit to Google Search Console
- Include `lastmod` dates
- Update on content changes

```tsx
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cards = await getCardSlugs();
  
  return [
    { url: 'https://pointadvisor.app', lastModified: new Date() },
    { url: 'https://pointadvisor.app/cards', lastModified: new Date() },
    ...cards.map(card => ({
      url: `https://pointadvisor.app/cards/${card.slug}`,
      lastModified: card.updatedAt,
    })),
  ];
}
```

### Performance & Rendering
- **Core Web Vitals:** LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 300ms
- Server-render primary content
- Hydrate only interactive elements (Islands pattern)
- Preload critical assets
- Lazy-load below-fold content

### URL Structure
- Lowercase, hyphen-separated
- No file extensions (`.html`, `.php`)
- No session parameters or tracking IDs
- Descriptive, keyword-relevant paths

```
✅ /cards/chase-sapphire-preferred
✅ /categories/travel
❌ /cards/CSP123
❌ /page.php?id=123&session=abc
```

### Redirects
- 301 redirect on slug changes
- No redirect chains (A → B → C)
- Maintain 200 status for canonical routes
- Document redirect rules

### Structured Data (JSON-LD)
Implement and validate:
- `Product` for credit cards
- `BreadcrumbList` for navigation
- `FAQ` for common questions
- `Article` for blog content
- `Organization` for brand

```tsx
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Chase Sapphire Preferred",
  "description": "Earn 3x points on dining and 2x on travel",
  "brand": {
    "@type": "Brand",
    "name": "Chase"
  }
}
</script>
```

### Images
- Descriptive alt text (not keyword stuffing)
- Explicit width/height attributes
- Modern formats (WebP, AVIF with fallbacks)
- Lazy-load below-fold images
- Optimize file sizes

```tsx
<Image
  src="/cards/sapphire-preferred.webp"
  alt="Chase Sapphire Preferred credit card with dark blue and silver design"
  width={300}
  height={190}
  loading="lazy"
/>
```

### Security
- HTTPS enforced with HSTS
- No mixed content
- `noindex` on sensitive/private pages
- Block indexing of user-specific content

### Facets & Filters
- Prevent crawl traps with canonicals
- Use `robots` meta for filtered views
- Parameter rules in Search Console

```tsx
// Filtered page should canonical to main
<link rel="canonical" href="https://pointadvisor.app/cards" />
<meta name="robots" content="noindex, follow" />
```

### Pagination
- Use `rel="prev"` and `rel="next"` where relevant
- Avoid infinite scroll without stateful URLs
- Each page should be independently accessible

### Internationalization (if applicable)
- Proper `hreflang` tags for language variants
- Keep canonical and hreflang consistent
- Use correct regional codes

## Content & On-Page SEO

### Keyword Strategy
- One primary keyword intent per URL
- Natural usage in title, h1, first paragraph
- Related terms and synonyms throughout
- Answer user questions directly

### Internal Linking
- Descriptive anchor text (not "click here")
- Link to relevant content naturally
- Maintain reasonable link depth (< 3 clicks to any page)
- Update links when content moves

### Content Quality
- Avoid duplicate content across pages
- No thin content (< 300 words without value)
- Unique meta descriptions per page
- Scannable headings and subheads

## Analytics & Monitoring

### PostHog Events
```typescript
// Track SEO-relevant interactions
posthog.capture('page_view', {
  path: window.location.pathname,
  referrer: document.referrer,
  correlationId,
});

posthog.capture('search_performed', {
  query: searchTerm,
  resultsCount: results.length,
});
```

### Monitor
- 404 errors (fix or redirect)
- Redirect chains (consolidate)
- GSC coverage report
- Crawl stats and errors
- Structured data validation
- Core Web Vitals trends

## Checklists

Follow `/docs/seo-checklist.md` for all deploys affecting templates or routing.

## Guiding Principle

**Choose long-term crawl stability over short-term ranking experiments.**

Quick wins that damage site architecture will cost more to fix later. Build for sustainable organic growth.
