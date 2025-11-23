# Neon Migration Plan

## Goal
Replace the current Supabase-dependent stack (auth, realtime, storage, SQL access, CLI workflows) with Neon Postgres plus alternative services so the Points Companion app no longer depends on Supabase URLs, keys, or APIs.

---
## 1. Current Supabase Footprint
| Area | Purpose | Key Files / Notes |
| --- | --- | --- |
| **Auth + Profiles** | Email/password auth, session handling, profile table reads/writes | `src/contexts/AuthContext.tsx`, `src/lib/supabase.ts`, profile surfaces in `src/components/profile/*`, `supabase/migrations/**/*profiles*` |
| **Data access (API routes & hooks)** | `createClient()` is used for nearly every DB interaction (recommendations, nearby businesses, onboarding progress, analytics, etc.) | `src/app/api/**/route.ts`, `src/hooks/useEnhancedAnalytics.ts`, `src/components/dashboard/**`, `src/lib/ai/**` |
| **Realtime** | Supabase realtime channels drive `LiveDashboard`, notification center, action inbox, etc. | `src/lib/realtime.ts`, `src/components/realtime/LiveDashboard.tsx`, `src/hooks/useRealtime*`, `README` Phase 5 notes |
| **Storage** | Avatar uploads via Supabase Storage bucket `avatars` | `src/components/profile/AvatarUploader.tsx` |
| **Migrations / SQL** | All schema lives in Supabase SQL migration files | `supabase/migrations/*.sql` |
| **Tooling & Docs** | Env templates / CI expect Supabase env vars | `.env.local`, `.env.example`, `.env.* pulled from Vercel`, `README.md`, `STARTUP_GUIDE.md`, `.github/workflows/ci.yml`, numerous docs referencing Supabase prompts |
| **Error handling / observability** | Retry helpers and error classifiers look for `supabase` substrings | `src/lib/errorHandling.ts`, `src/components/error/ErrorBoundary.tsx`, logging scattered across components |

Removing Supabase means every one of these touch points needs a replacement (auth provider, SQL client, storage target, realtime transport, and documentation/scripts).

---
## 2. Migration Strategy Overview
1. **Decide on the new auth solution**
   - Options: NextAuth (Credentials + OAuth), Clerk/Auth0, or fully custom (credentials stored in Neon with bcrypt + JWT).
   - Deliverables:
     - New `users` table in Neon (with hashed password, email verification flag, etc.).
     - Session persistence (NextAuth DB tables or custom session tokens in Redis/Neon).
     - Replacement for `AuthProvider`, `useAuth`, and any server-side `supabase.auth` usage.
     - Migration path for existing Supabase users (export + import hashed passwords via Supabase Admin API, or force reset).

2. **Stand up a Neon data layer**
   - Choose driver (recommended: `@neondatabase/serverless` with Drizzle ORM or Prisma for typed queries).
   - Create a shared client (`src/lib/db.ts`) that exposes pooled/non-pooled connections using `DATABASE_URL`, `POSTGRES_URL`, etc. already present in the Vercel envs.
   - Refactor every `createClient().from('table')...` call into SQL/ORM queries.
   - Replace `rpc`/`auth` helpers with new service/repository modules.

3. **Migrations & schema management**
   - Convert Supabase SQL files into a migration tool that works with Neon (e.g., [drizzle-kit](https://github.com/drizzle-team/drizzle-kit) or [Prisma Migrate]).
   - Run historical Supabase SQL against Neon once (via `psql` or `neonctl sql`).
   - Establish new workflow: `npm run db:migrate` -> runs migrations against Neon for dev/preview/prod.

4. **Realtime replacement**
   - Supabase realtime provided Postgres CDC + websockets. Options:
     1. Use Neon’s [logical replication/webhooks](https://neon.tech/docs/guides/listen-notify) + custom WebSocket server (e.g., via Next.js Route Handlers or a small Node worker) to broadcast `LISTEN/NOTIFY` events.
     2. Adopt a hosted pub/sub (Ably, Pusher, Liveblocks) for notifications, while polling Neon for consistency.
   - Update `src/lib/realtime.ts` and all consumers.

5. **Storage replacement**
   - Select object storage (AWS S3, Cloudflare R2, Supabase Storage alternative) for avatars and other media.
   - Update `AvatarUploader` to upload via signed URL to new bucket. Remove Supabase Storage SDK.

6. **Environment variables**
   - Replace Supabase envs in `.env` templates, CI, docs with Neon/envs used by new services.
   - Proposed map:
     | Old | Replacement |
     | --- | --- |
     | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL` | Remove; front-end should not query DB directly. Introduce API routes hitting Neon via server-side client. |
     | `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY` | Remove; use server-side auth tokens or NextAuth envs. |
     | `SUPABASE_SERVICE_ROLE_KEY` | Remove; rely on Neon credentials stored as `DATABASE_URL`/`POSTGRES_*`. |
   - Introduce new envs for auth provider secrets (e.g., `AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_GOOGLE_ID`, etc. if NextAuth) and storage provider credentials.
    - ✅ Status: `.env` templates, CI, and docs no longer mention Supabase keys as of Nov 2025.

7. **Docs & scripts**
   - Update `README`, `STARTUP_GUIDE`, `instructions.txt`, and `IMPROVEMENT_PROMPT_PLAN.md` to reflect Neon workflows.
   - Replace Supabase CLI instructions with `neonctl`, `psql`, or ORM-specific commands.

8. **Testing & rollout**
   - Add integration tests targeting Neon (can run against a local Neon branch or Docker Postgres).
   - Validate auth flows, avatar uploads, realtime dashboards, and analytics queries.
   - Stage rollout: deploy to preview with feature flags, run smoke tests, then cut over production env + rotate Supabase secrets.

---
## 3. Work Packages & Sequencing
1. **Bootstrap Neon ORM layer**
   - Add dependency (`@neondatabase/serverless`, `drizzle-orm` or `prisma`).
   - Generate schema from existing Supabase SQL.
   - Provide helper functions/hook replacements.

2. **Authentication rewrite**
   - Choose provider; scaffold new API routes (`/api/auth/[...nextauth]` if NextAuth) or custom endpoints.
   - Update UI components/hook consumers to use new context (remove Supabase-specific `User` type, adapt to new session object).

3. **Feature-by-feature data migration**
   - For each module (transactions, loyalty, recommendations, onboarding, analytics, GPS caches):
     - Replace Supabase queries with Neon equivalents.
     - Update types and DTOs.
     - Remove `createClient()` usage.

4. **Realtime + notifications**
   - Implement new hub (LISTEN/NOTIFY + websockets or third-party service) and swap `createRealtimeChannel` consumers.

5. **Storage switch**
   - Migrate `avatars` bucket data (if needed) and update uploader.

6. **Cleanup & validation**
   - Remove Supabase packages from `package.json`.
   - Delete `src/lib/supabase.ts`, Supabase-specific hooks, and docs.
   - Update CI/env references, run full test suite, document final steps.

---
## 4. Immediate Next Steps
1. **Confirm auth direction** (NextAuth vs. custom) and storage provider.
2. **Set up Neon schema tooling** (Drizzle/Prisma) and import Supabase SQL.
3. **Create engineering issues** per work package for incremental delivery.
4. **Rotate leaked secrets** noted during `.env.local` inspection (Supabase + OpenAI + Google Maps) even though Supabase will be removed.

Once these decisions are made, we can start replacing the Supabase env values in Vercel with Neon-focused variables and remove Supabase codepaths in the repo.
