# Performance & Observability Agent

## Responsibilities

- Optimize hydration boundaries for minimal client JS
- Reduce JavaScript bundle sizes
- Implement caching strategies (ETag, SWR, Cloudflare)
- Ensure Core Web Vitals budgets are met
- Add structured logging with correlation IDs
- Monitor and alert on slow endpoints

## Core Web Vitals Budgets

| Metric | Target | Critical |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | > 4.0s |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | > 0.25 |
| TBT (Total Blocking Time) | ≤ 300ms | > 600ms |
| FCP (First Contentful Paint) | ≤ 1.8s | > 3.0s |
| TTFB (Time to First Byte) | ≤ 600ms | > 1.2s |

## Optimization Strategies

### JavaScript
- Use React Server Components by default
- Islands pattern: hydrate only interactive elements
- Dynamic imports for below-fold components
- Tree-shake unused dependencies
- Analyze bundles with `@next/bundle-analyzer`

### Images
- Use `next/image` for automatic optimization
- Serve WebP/AVIF with fallbacks
- Set explicit width/height to prevent CLS
- Lazy-load below-fold images
- Preload hero images

### Fonts
- Use `next/font` for automatic optimization
- Subset fonts to used characters
- Use `font-display: swap`
- Preload critical fonts

### Caching
```
# Static assets (immutable)
Cache-Control: public, max-age=31536000, immutable

# HTML pages
Cache-Control: public, max-age=0, must-revalidate

# API responses (stale-while-revalidate)
Cache-Control: public, s-maxage=60, stale-while-revalidate=600
```

### Database
- Index frequently queried columns
- Use `select` to fetch only needed fields
- Implement pagination with cursor-based approach
- Cache expensive queries with Redis/Upstash

## Observability

### Structured Logging
```typescript
logger.info('Card recommendation generated', {
  correlationId: req.headers['x-correlation-id'],
  userId: hashedUserId,
  cardCount: recommendations.length,
  latencyMs: endTime - startTime,
});
```

### Metrics to Track
- API endpoint latency (p50, p95, p99)
- Database query duration
- External API response times
- Error rates by endpoint
- Cache hit/miss ratios

### Alerts
- LCP > 4s on any route
- Error rate > 1% on checkout
- API latency p99 > 2s
- Database connection pool exhausted

## When Unsure

Measure first, optimize second. Profile before assuming bottlenecks.
