# Auth Replacement & Astro Migration Plan

## 1. Authentication & User Management
### Direction
Adopt **NextAuth.js** with a Neon-backed credentials provider (username/password) plus optional OAuth providers. All Supabase auth APIs/functions will be removed.

### Implementation Steps
1. **Dependencies & Setup**
   - Install `prisma`, `@prisma/client`, `next-auth`, and `@next-auth/prisma-adapter`.
   - Configure Prisma datasource to use `process.env.DATABASE_URL` (Neon pooled) and generate client.
   - Install `@neondatabase/serverless` for `neon` driver, plus `prisma-neon` adapter if pooling is required.
2. **Database Schema**
   - Define Prisma models for `User`, `Account`, `Session`, `VerificationToken`, plus existing domain tables (profiles, cards, transactions, bonuses, etc.).
   - Run `npx prisma migrate dev` (local) / `prisma migrate deploy` (CI) against Neon.
   - Backfill data from Supabase (export CSV via Supabase dashboard, import into Neon using `neonctl sql` or ORM seed scripts). For passwords, either:
     - Export hashed passwords from Supabase (if accessible) and reuse them, or
     - Force password reset emails / new credential creation.
3. **NextAuth Route Handler**
   - Add `src/app/api/auth/[...nextauth]/route.ts` with credential provider reading via Prisma (bcrypt compare) and optional OAuth providers.
   - Configure `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, provider secrets in env.
4. **Session Handling**
   - Replace `AuthProvider` usage with NextAuth’s `SessionProvider` (`next-auth/react`).
   - Update hooks/components to consume `useSession` instead of Supabase’s `User` object.
5. **Profile & Domain CRUD**
   - Replace Supabase queries with Prisma in server actions/API routes.
6. **Sign-up / Sign-in UI**
   - Update forms to call `signIn('credentials', ...)` / `signOut()` from NextAuth.
   - Replace Supabase client-side auth calls.
7. **Cleanup**
   - Remove `@supabase/*` deps, `src/lib/supabase.ts`, Supabase env vars, and Supabase-specific docs once the new stack is stable.

### Risks & Mitigations
- **Password migration**: If Supabase hashes aren’t exportable, require password reset workflow.
- **Session invalidation**: Log out all users post-cutover to avoid stale Supabase sessions.
- **Email delivery**: If using verification emails, configure SMTP provider and env vars (`EMAIL_SERVER`, `EMAIL_FROM`).

## 2. Neon Data Layer
1. Introduce `src/lib/prisma.ts` (singleton) plus, where needed, a low-level Neon client for LISTEN/NOTIFY or raw SQL.
2. Gradually refactor API routes/hooks to use Prisma instead of `supabase.from(...)`.
3. Split work by domain (transactions, loyalty, analytics, AI cache) to keep PRs manageable.
4. Update tests to mock the Neon client or run against a local Postgres instance.

## 3. Realtime & Storage Replacements
- **Realtime (Recommended)**: Adopt **Ably** Channels for pub/sub. Server-side API routes emit events when Neon writes occur (wrap Prisma mutations to publish). Client replaces Supabase realtime channel with Ably SDK (REST + websockets). This avoids Neon LISTEN/NOTIFY limitations and keeps latency low.
- **Storage (Recommended)**: Use **Cloudflare R2** (S3-compatible, inexpensive egress). Create signed upload URLs via server action, upload directly from browser, store resulting URL in Neon. Migrate existing Supabase `avatars` objects via batch script (download + upload to R2).

## 4. Next.js → Astro Migration
### Goals
- Rebuild the UI using Astro’s island architecture while reusing React components where helpful.

### Phased Approach
1. **Parallel Astro Skeleton**
   - Create `/astro-app` directory (or new workspace branch) initialized with `npm create astro@latest`.
   - Configure Tailwind + any design tokens you need.
   - Mirror essential routes/pages (landing, dashboard) using Astro pages, importing React components as islands via `@astrojs/react`.
2. **Shared UI Library**
   - Move reusable React components into a package (e.g., `packages/ui`) so both Next.js and Astro builds can import them during the transition.
3. **API Strategy**
   - Keep Next.js (or a dedicated Node server) serving API routes while Astro handles the frontend initially.
   - Once stable, migrate API endpoints to Astro’s API routes or a separate serverless backend.
4. **State & Auth Integration**
   - Expose NextAuth session data via HTTP-only cookies; Astro can read them through server-side hooks or call dedicated session endpoints.
   - Replace Next.js `useSession` usage in components with props/data provided by Astro loaders.
5. **Routing & Navigation**
   - Replicate `/dashboard` tabs, analytics, etc., as Astro pages/layouts.
   - For client-heavy experiences (live dashboards, AI chat), use React/Vue/Svelte islands depending on desired DX.
6. **Build & Deployment**
   - Decide whether to deploy Astro to Vercel (supported) while keeping the existing Next.js server purely for APIs, or migrate APIs to Edge Functions/Node server once Astro is primary.
7. **Decommission Next.js**
   - After feature parity is confirmed and traffic is routed to Astro, remove the old Next.js app and consolidate repo structure.

### Key Considerations
- Astro currently excels at content-heavy or static-first sites; ensure dashboard interactivity is maintained via islands.
- Evaluate library compatibility (some Next.js-specific hooks/components may need adjustments).
- Update CI/CD to build both projects during the transition; add automated tests for Astro routes.

## 5. Recommended Sequence
1. Build Neon ORM layer + NextAuth integration inside the existing Next.js app.
2. Swap feature modules from Supabase to Neon incrementally.
3. Once app runs fully on Neon (auth, data, realtime, storage), branch out the Astro frontend migration.
4. Maintain API compatibility so whichever frontend (Next.js or Astro) is live can talk to the same backend.
5. After Astro ship, remove legacy Supabase code, Next.js routes, and redundant env vars.

## 6. Immediate Action Items
1. **Auth**: Scaffold NextAuth + Neon tables; decide on password migration strategy.
2. **Data Layer**: Choose ORM (Prisma vs. Drizzle) and import existing schema.
3. **Astro POC**: Spin up Astro project, install React integration, and port the marketing/landing pages first to validate build pipeline.
4. **Realtime Decision**: Pick LISTEN/NOTIFY bridge vs. hosted pub/sub.
5. **Secret Updates**: Remove Supabase secrets from Vercel envs once Prisma/NextAuth is live. Keep the current OpenAI API key (per request) but ensure it is stored only in Vercel/CI and never echoed to logs.
