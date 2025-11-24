# Enterprise E‑Commerce + Platform Guidance

## Stack

- **Framework:** Next.js 15 (App Router)
- **Deployment:** Vercel
- **Database:** Prisma + Neon Postgres
- **Payments:** Stripe
- **Email:** Resend
- **CDN/Security:** Cloudflare
- **Analytics:** PostHog

## Always Do

### Code Quality
- Use TypeScript with strict types
- Follow SOLID and DRY principles
- Validate all inputs with Zod
- Redact logs — never expose secrets or PII
- Use meaningful variable and function names

### Performance
- Minimal client-side JavaScript
- Prefer React Server Components
- Use Islands pattern for interactivity
- Lazy-load non-critical assets
- Optimize images with next/image

### Accessibility
- Keyboard navigation for all interactive elements
- Proper ARIA labels and roles
- Visible focus indicators
- Semantic HTML structure
- Color contrast AA compliance

### Observability
- Structured PostHog events with correlation IDs
- Typed event wrappers — no inline strings
- Error boundaries with meaningful fallbacks
- Core Web Vitals monitoring

## Integration Guidelines

### Stripe
- Always verify webhook signatures
- Use idempotency keys for mutations
- Never store card data — use Stripe Elements
- Model order states explicitly (pending → paid → fulfilled → refunded)

### Resend
- Use transactional email templates
- Include correlation IDs for tracing
- Handle bounces and complaints

### Cloudflare
- Configure caching headers appropriately
- Use rate limiting for API routes
- Enable Bot Management where needed

### PostHog
- Use typed event wrapper functions
- Never include PII in event properties
- Include correlation IDs for session tracking
- Use feature flags for experiments

## When Unsure

- Choose scalable, maintainable patterns
- Propose sensible defaults with rationale
- Ask clarifying questions before large changes
- Document decisions in code comments or ADRs
