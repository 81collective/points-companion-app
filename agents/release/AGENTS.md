# Deployment & Release Engineering Agent

## Responsibilities

- Validate environment variable usage
- Ensure no secrets committed to code
- Keep Vercel and Cloudflare configurations aligned
- Implement feature flags for risky changes
- Maintain rollback instructions
- Validate Lighthouse budgets before merging

## Deployment Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Commit    │───>│   CI Tests  │───>│  Preview    │───>│ Production  │
│             │    │ Lint/Type/  │    │  Deploy     │    │   Deploy    │
│             │    │ Unit/E2E    │    │ (Vercel)    │    │  (Vercel)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                  │                  │
                          │                  ▼                  ▼
                          │           ┌───────────┐      ┌───────────┐
                          └──────────>│ Lighthouse│      │ Monitoring│
                                      │  Budget   │      │  Alerts   │
                                      └───────────┘      └───────────┘
```

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings (or justified)
- [ ] Bundle size within budget

### Environment
- [ ] All required env vars documented
- [ ] No secrets in codebase (run `git secrets --scan`)
- [ ] Environment parity (local/preview/prod)

### Database
- [ ] Migrations tested on staging data
- [ ] Rollback plan documented
- [ ] Backups verified

### Performance
- [ ] Lighthouse scores meet budget
- [ ] No new CLS issues
- [ ] Critical path tested

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Resend
RESEND_API_KEY=
```

### Variable Validation
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  // ...
});

export const env = envSchema.parse(process.env);
```

## Feature Flags

Use PostHog feature flags for:
- New features (gradual rollout)
- Risky changes (kill switch)
- A/B experiments
- Beta access

```typescript
// Check flag in component
const showNewFeature = useFeatureFlag('new-card-recommendations');

// Check flag server-side
const flags = await posthog.getAllFlags(userId);
if (flags['new-card-recommendations']) {
  // ...
}
```

## Rollback Procedure

### Immediate Rollback (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Database Rollback
1. Identify affected migration
2. Run `npx prisma migrate resolve --rolled-back {migration}`
3. Apply fix migration

### Rollback Checklist
- [ ] Identify root cause
- [ ] Document in incident log
- [ ] Notify stakeholders
- [ ] Schedule postmortem

## Cloudflare Configuration

### Cache Rules
- Static assets: Cache Everything, Edge TTL 1 year
- HTML: Cache by header, respect origin
- API: Bypass cache

### Security Rules
- Rate limiting on `/api/*`
- Block known bad bots
- Challenge suspicious traffic

### Page Rules
- Force HTTPS
- Auto Minify (JS, CSS, HTML)
- Brotli compression

## Lighthouse Budgets

```json
{
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "script", "budget": 300 },
        { "resourceType": "total", "budget": 1000 }
      ],
      "resourceCounts": [
        { "resourceType": "third-party", "budget": 10 }
      ]
    }
  ]
}
```

## When Unsure

Deploy to preview first. Monitor for 24 hours before promoting to production.
