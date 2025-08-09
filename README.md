# Points Companion App

## Overview

This project is a **Next.js** application that uses **Supabase** for authentication and data storage. It helps users manage credit cards and transactions and includes AI‑powered recommendations using OpenAI.

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

Create an `.env.local` file and provide the following values:

- `OPENAI_API_KEY` – API key for OpenAI requests.
- `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – the anonymous key from Supabase.

These variables are required for both development and production builds.

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
- Introduced a shared realtime abstraction (`src/lib/realtime.ts`) to standardize Supabase channel creation, presence tracking, and cleanup.
- Refactored `NotificationCenter` to use the new helper (remaining: `SpendingTracker`, `LiveDashboard`, `RealTimeSystem`).
- Centralized metric update logic and reduced repetition in real‑time dashboards.
- Added structured parsing for transaction & loyalty change payloads; guarded geolocation and window usage for SSR safety.
- Hardened handler typing (moved to `unknown` + localized safe casting) to satisfy strict build pipeline while avoiding brittle upstream Supabase type coupling.

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
- Added safer navigator mocking in tests (removed `@ts-ignore`) and reinforced SSR guards in components referencing browser globals.

### Repository Health
- Large net reduction in lines (removal > additions) while increasing functional clarity.
- Commit history now groups related cleanup operations with descriptive messages for traceability.
- Eliminated remaining build blockers (lint + type) via targeted handler signature adjustments and removal of deprecated suppression comments.

### Testing & Tooling Additions
- Added initial unit tests for security monitoring & CSV parsing utilities (foundation for upcoming realtime + import pipeline test expansion).
- Enforced stricter no-`@ts-ignore` policy (replaced with explicit environment-safe mocks and localized casting where appropriate).
- Improved error handling patterns (underscore convention for intentionally unused caught errors).

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
- Expand unit tests: CSV import duplicate detection, security score calculation, AI spending pattern derivation, realtime abstraction (channel lifecycle & presence scenarios).
- Migrate remaining realtime consumers (`SpendingTracker`, `LiveDashboard`, `RealTimeSystem`) onto shared subscription utility.
- Introduce lightweight error boundary & toast surfacing for background realtime failures.
- Add deterministic mocks for Supabase realtime events for test isolation.

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
- Add type-safe test factories for transactions & loyalty accounts to reduce duplication.

### Observability & Metrics
- Add OpenTelemetry tracing for: CSV import lifecycle, AI recommendation generation, real-time subscription throughput.
- Centralize logging adapter (console -> structured logger) with log levels and redaction safeguards.

## Suggested Next Steps
1. Decide suppression vs. elimination strategy for the remaining explicit unused variable warnings.
2. Expand test coverage (CSV duplicate detection, realtime channel lifecycle, security scoring) before broader refactors.
3. Stand up a metrics/tracing foundation early to avoid retrofitting observability into AI & realtime layers later.
4. Formalize performance budget targets and wire into CI.
5. Complete migration of remaining realtime components to the shared abstraction and validate with presence + error simulation tests.

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

## Supabase migrations

The SQL migrations live in `supabase/migrations`. To apply them locally, install the [Supabase CLI](https://supabase.com/docs/guides/cli) and run:
```bash
supabase start      # starts local Supabase containers
supabase db reset   # applies migrations from the migrations folder
```

## Verification scripts

The `scripts/` directory contains Node scripts that verify the Supabase instance. They use Supabase credentials defined in each file. Run them with Node:
```bash
node scripts/check-db.mjs        # checks tables exist
node scripts/check-structure.mjs # prints credit_cards table columns
node scripts/verify-data.mjs     # lists sample rows
node scripts/verify-tables.mjs   # describes table structures
```
Customize the Supabase URL and key in each script (or refactor them to read from environment variables) so that they point to your project.
