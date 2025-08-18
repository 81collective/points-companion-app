-- Create nearby_cache table for caching aggregated nearby search results
create table if not exists public.nearby_cache (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.nearby_cache enable row level security;

-- Allow reads to anon and authenticated users
create policy if not exists read_nearby_cache on public.nearby_cache
  for select to anon, authenticated
  using (true);

-- Allow writes from service_role and authenticated (adjust if needed)
create policy if not exists write_nearby_cache on public.nearby_cache
  for insert, update to service_role, authenticated
  using (true)
  with check (true);
