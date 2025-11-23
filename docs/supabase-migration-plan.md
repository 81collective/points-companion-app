# Remaining Supabase Migration Plan

## GraphQL resolvers
- Replace the direct `createClient()` calls with Prisma queries. Profiles already live in `prisma.profile`, so the `userProfile` query and `updateUserProfile` mutation can hydrate/upsert via Prisma and reuse the existing `/api/profile` serialization helpers.
- For `addUserCard` (and future card mutations) read/write through `prisma.creditCard`. When GraphQL requests point at catalog cards (not user-owned), translate the ID into a Prisma lookup or fall back to the existing `/api/cards` REST endpoint. Store user-specific metadata (notes, isActive) in a lightweight join table or a JSON column on the `CreditCard` row.
- Wire cache invalidation to Prisma writes by clearing the same tags the route handlers use once the mutation succeeds, keeping GraphQL responses coherent with the REST API.

## Avatar uploads
- Introduce an `/api/profile/avatar` route that accepts `FormData`, streams the file into Cloudflare R2 (preferred) or another storage target, and returns the public URL. The route should reuse `requireServerSession` and update `prisma.profile`/`prisma.user` once the upload succeeds.
- Update `AvatarUploader` to POST the image via `fetch` instead of using Supabase storage directly. On success, call `updateProfile({ avatarUrl })` so the Auth context syncs immediately.
- Until R2 credentials are available, fall back to generating a signed Vercel Blob URL or a temporary data URL, and guard production builds with clear error messaging if no storage backend is configured.

## Deprecated Supabase hook
- ✅ Verified no runtime imports remain, removed `src/hooks/useSupabase.ts`, and dropped the stale mock in `src/lib/__tests__/security-monitor.test.ts`.
- Add a note to sample components (see `/examples`) making it clear they require a custom realtime backend before re-enabling.
- Remove the Supabase connection strings from `.env` scaffolding after the GraphQL and avatar flows no longer reference them.
