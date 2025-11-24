# PointAdvisor App

## Overview

This project is a **Next.js** application backed by **Prisma** + **Neon Postgres** (with NextAuth for sessions). It helps users manage credit cards and transactions and includes AI‑powered recommendations using OpenAI.

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd points-companion-app
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```

## Environment variables

Create an `.env.local` file and provide the following values (or pull them from Vercel with `vercel env pull`):

- `DATABASE_URL` / `POSTGRES_URL_*` – Neon Postgres connection strings (pooled + non pooled) used by the backend.
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET` – required by NextAuth.
- `OPENAI_API_KEY` – API key for OpenAI requests.
- `GOOGLE_PLACES_API_KEY` / `GOOGLE_MAPS_API_KEY` / `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` – mapping and geo search features.
- Optional integrations such as `LOYALTY_API_KEY`, `NEXT_PUBLIC_GA_TRACKING_ID`, or feature flags like `NEXT_PUBLIC_ENABLE_PWA`.

All Supabase-specific environment variables were removed in November 2025 as part of the Neon migration; you can safely delete them from local `.env` files and hosting providers.

## Recent Improvements (Engineering Log)

The following refactors and enhancements were implemented to improve stability, performance, developer experience, and architectural clarity:

### Code Quality & Lint Hygiene
- Removed >150 unused imports, icons, types, and dead variables across realtime, loyalty, security, transactions, AI, executive, analytics, and UI layers (lucide-react icon pruning, unused test utilities, stale constants).
- Resolved React Hooks dependency warnings by wrapping callbacks (`parseRowToTransaction`, security scoring functions, real‑time event handlers) in `useCallback` and using `useMemo` for derived collections (e.g. loyalty accounts list).
- Eliminated duplicate function definitions (e.g. old non-memoized CSV parsing helper) and consolidated logic for clarity.
- Standardized unused parameters by deletion or underscore-based omission (in progress for remaining test + mock files).

### Performance & Runtime Stability
- Memoized expensive or frequently re-created functions in: `TransactionImportProcessor`, `SecurityDashboard`, `LiveDashboard`, `NotificationCenter`, AI modules.
- Reordered declarations (e.g. spending tracker subscriptions) to guarantee stable closure capture and prevent subtle stale state issues.
- Reduced initial bundle weight marginally by pruning unused icon imports & test-only code paths from production modules.
- Converted mock datasets to stable refs to prevent unnecessary re-renders (`mockAuditLogsRef`).

### Real‑Time & Data Flow Enhancements
- Introduced shared realtime abstraction `createRealtimeChannel` (`src/lib/realtime.ts`) to standardize Supabase channel lifecycle (Postgres changes + presence) with cleanup helper and React hook wrapper.
- Migrated `NotificationCenter` to the shared utility (remaining realtime consumers scheduled next) with safe payload casting strategy.
- Centralized metric update logic and reduced repetition in real‑time dashboards.
- Added structured parsing for transaction & loyalty change payloads; guarded geolocation and window usage for SSR safety.

### Testing Additions
- Added isolated CSV parser module (`src/lib/csv/parser.ts`) with unit tests (headers, quoted fields, escaped quotes, empty file error path).
- Added `SecurityMonitor` test suite with Supabase + navigator mocks; exported reset helper for deterministic test state.
- Removed `@ts-ignore` in tests via explicit object mocking patterns.
- Established pattern for forthcoming realtime utility tests (mock channel event registration & subscription lifecycle).

### AI & Analytics Layer
- Integrated Supabase-backed spending pattern extraction in `AIRecommendationEngine` (replacing static mock patterns) with caching layer via `localStorage`.
- Added contextual recommendation scaffolding keyed off time-of-day and (optional) geolocation.
- Simplified Natural Language chat component by removing unused auth context and unused placeholders.

### Transactions Import Experience
- Hardened CSV row parsing with explicit validation and typed mapping usage.
- Introduced memoized parser + dependency-correct transaction processing pipeline to avoid reprocessing or inconsistent duplicate detection.
- Clarified progress state machine and reduced intermediate mutation noise.

### Security & Compliance
- Memoized security score & recommendations calculations to avoid redundant recomputation on peripheral state changes.
- Migrated mock audit data to a ref to eliminate unstable dependency chains in effects.
- Pruned unused validation imports to reduce surface area.

### Executive & Portfolio Modules
- Cleaned portfolio optimizer & payment decision engine of unused hooks and scenario artifacts; removed dormant icon imports.

### PWA / Offline & Misc
- Began cleanup of PWA components (removal of unused network state variables & icons) preparing for future offline robustness work.

### Repository Health
- Large net reduction in lines (removal > additions) while increasing functional clarity.
- Commit history now groups related cleanup operations with descriptive messages for traceability.

## Remaining Technical Debt / Open Warnings
The production build still reports a focused set of `@typescript-eslint/no-unused-vars` warnings in:
- Bonus & loyalty hooks (`useWelcomeBonuses`, `useLoyalty`, bonus calculators)
- Some analytics / performance test files
- PWA indicators (planned retention until feature expansion)
- CSV mapping preview underscore placeholders (`_`) (intentional; can flip rule to allow ignore pattern)

These are now isolated and can be addressed or suppressed systematically depending on roadmap priority.

## Future Enhancements

### Short-Term (1–2 sprints)
- Complete remaining unused variable pruning or add ESLint ignore patterns for intentional placeholders (indexes, underscore params).
- Extend test coverage: duplicate detection path of CSV import pipeline, security score calculation, AI spending pattern derivation, realtime channel abstraction (mock Supabase events).
- Migrate remaining realtime consumers (transactions/metrics dashboards, spending tracker, loyalty modules) onto `createRealtimeChannel`; add typed generic payload support & presence edge‑case tests.
- Introduce lightweight error boundary & toast surfacing for background realtime failures.

### Medium-Term (Quarter)
- Implement background job / edge function to precompute analytics & AI recommendations (reduces client cold-start cost).
- Add offline queue for manual transactions & loyalty updates (Service Worker + IndexedDB synchronization layer).
- Progressive enhancement for AI modules: streaming responses, feedback persistence, recommendation model versioning.
- Security hardening: rate limiting hooks, anomaly scoring service, audit export (CSV / JSON) UI.
- Expand accessibility audit (focus rings, ARIA live regions for real-time updates, prefers-reduced-motion checks).
- Establish performance budgets (First Load JS, route-specific module size) with CI gating threshold.

### Long-Term / Strategic
- Modular plugin architecture for reward providers & loyalty programs (dynamic registry + code splitting).
- Multi-tenant / workspace mode (org-level analytics, role-based access controls for shared accounts).
- Advanced recommendation engine: reinforcement learning feedback loop from user card usage & explicit feedback signals.
- Data lineage & observability: tracing identifiers for transformations (import -> dedupe -> categorize -> analytics).
- Internationalization (currency formatting, locale-aware date parsing in CSV import, translated UI copy).
- GraphQL or TRPC layer introduction for typed end-to-end contracts; potential move to edge runtime.

### Quality / Tooling Roadmap
- Add Jest + React Testing Library coverage for core UI state machines (import, security dashboard, real-time dashboards).
- Integrate Playwright visual regression for executive dashboards & AI panels.
- Add ESLint rule customization to allow `_`-prefixed unused parameters; enforce import ordering & consistent icon set usage.
- Adopt commit lint & conventional release notes automation (semantic-release) for changelog generation.
- CI integration: per-PR size diff + bundle analyzer artifact upload.

### Observability & Metrics
- Add OpenTelemetry tracing for: CSV import lifecycle, AI recommendation generation, real-time subscription throughput.
- Centralize logging adapter (console -> structured logger) with log levels and redaction safeguards.

## Suggested Next Steps
1. Decide suppression vs. elimination strategy for the remaining explicit unused variable warnings.
2. Prioritize test coverage seeds (CSV import + security scoring) to lock in current behavior before further refactors.
3. Stand up a metrics/tracing foundation early to avoid retrofitting observability into AI & realtime layers later.
4. Formalize performance budget targets and wire into CI.

---
This log will evolve as new architectural or performance-focused enhancements are introduced. Keep entries concise, action-oriented, and grouped by domain for ongoing clarity.

## Development

Run the application locally with Turbopack:
```bash
npm run dev
```

## Production

Create an optimized build and start it:
```bash
npm run build
npm start
```

## Database migrations

Schema changes are managed via Prisma. Use the standard commands below:
```bash
npx prisma migrate dev               # create/apply a new migration locally
npx prisma migrate deploy            # apply pending migrations in CI/production
npx prisma db push && prisma studio  # sync schema / inspect data without Supabase
```
Legacy Supabase SQL files remain under `supabase/migrations` for reference only; they no longer drive the application.

## Changelog automation

1. Follow the [Conventional Commits](https://www.conventionalcommits.org/) style when writing commit messages so entries can be categorized automatically.
2. Run `npm run changelog` before cutting a release; the script uses `conventional-changelog` to update `CHANGELOG.md` in place.
3. Review the generated diff (you can edit the notes manually), commit the updated changelog, and then create your release tag.

## Verification scripts

The `scripts/` directory still contains a handful of smoke-test utilities. They now read the same Neon/NextAuth environment variables noted above. Run them with Node as needed:
```bash
node verify-deployment.mjs   # post-deploy smoke test
node diagnose-issues.mjs     # quick API/DB sanity checks
node test-fixes.mjs          # regression helpers used during migrations
```
Feel free to extend these scripts with additional Postgres or API assertions—no Supabase configuration is required anymore.
