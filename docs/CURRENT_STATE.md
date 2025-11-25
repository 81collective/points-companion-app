# Current Project State

Last updated: 2025-11-24

## Overview

Points Companion App is a credit card rewards optimization platform that helps users maximize their points and cashback.

## Active Work

### Completed This Session
- ✅ TOML-based card database (110+ US rewards cards)
- ✅ Fuzzy merchant matching system
- ✅ Agent skill file framework (14 agent files)
- ✅ Developer experience improvements (PR templates, issue templates, ADRs)
- ✅ CI/CD enhancements (Lighthouse CI, Dependabot, CODEOWNERS)

### In Progress
- None currently

### Next Priorities
1. Add more card issuers to database
2. Implement offer expiration monitoring
3. Build card comparison UI component

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  App Router │ React Server Components │ Islands (Client)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Routes                               │
├─────────────────────────────────────────────────────────────────┤
│  /api/cards/database     │ Card catalog from TOML               │
│  /api/cards/recommendations │ Smart card suggestions            │
│  /api/cards/offers       │ Current bonus offers                 │
│  /api/auth/*             │ NextAuth.js authentication           │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   TOML Cards     │ │   Prisma + Neon  │ │   External APIs  │
│   config/cards/  │ │   User data      │ │   Stripe, etc.   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## Key Components

### Card Database (`config/cards/`)
- 8 TOML files by issuer/category
- 110+ US rewards credit cards
- Loaded at runtime with caching

### Fuzzy Matching (`src/lib/matching/`)
- Levenshtein distance algorithm
- N-gram similarity
- Jaro-Winkler distance
- MCC code mapping (200+ codes)
- Brand detection for hotels/airlines

### Agent System (`agents/`)
- 14 specialized agent skill files
- Task-based quick reference
- Release checklists

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | Prisma + Neon Postgres |
| Auth | NextAuth.js |
| Payments | Stripe |
| Email | Resend |
| Analytics | PostHog |
| CDN | Cloudflare |
| Hosting | Vercel |

---

## File Structure

```
├── .github/              # GitHub configuration
│   ├── workflows/        # CI/CD pipelines
│   ├── CODEOWNERS        # Review assignments
│   └── ISSUE_TEMPLATE/   # Issue templates
├── agents/               # Agent skill files
│   ├── README.md         # Agent index
│   ├── architecture/     # Code quality rules
│   ├── security/         # Security rules
│   └── ...               # Other domains
├── config/               # Configuration files
│   ├── cards/            # TOML card database
│   └── offers/           # Current offers
├── docs/                 # Documentation
│   ├── adr/              # Architecture decisions
│   └── *.md              # Guides and checklists
├── prisma/               # Database schema
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Core libraries
└── scripts/              # Build/dev scripts
```

---

## Environment Variables

See `.env.example` for full list. Required:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection |
| `NEXTAUTH_SECRET` | Auth session encryption |
| `NEXTAUTH_URL` | Canonical app URL |
| `STRIPE_SECRET_KEY` | Stripe API (if payments enabled) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics |

---

## Known Issues

1. **Console warnings in dev mode**: React hydration warnings on complex components
2. **Slow initial load**: Card database loads synchronously on first request
3. **Missing tests**: E2E coverage for card recommendation flow

---

## Recent Commits

| Date | Commit | Description |
|------|--------|-------------|
| 2025-11-24 | `4454560` | Developer experience improvements |
| 2025-11-24 | `58b1c5b` | Agent skill files and checklists |
| 2025-11-24 | `51921cd` | TypeScript fixes for recommendations |
| 2025-11-24 | `7c1b7e2` | Business, airline, hotel cards |
| 2025-11-24 | `6fa8031` | Fuzzy merchant matching |

---

## How to Continue

1. Read `/agents/README.md` for agent file index
2. Check this document for current state
3. Review `CHANGELOG.md` for recent changes
4. Check GitHub Issues for open tasks
5. Follow `docs/AGENT_HANDOFF_GUIDE.md` for documentation standards
