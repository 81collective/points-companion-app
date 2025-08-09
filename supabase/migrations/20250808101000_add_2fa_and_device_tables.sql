-- 2FA (TOTP) and device/session tracking tables
-- Create user_totp_secrets table
create table if not exists user_totp_secrets (
  user_id uuid primary key references profiles(id) on delete cascade,
  secret text not null,
  enabled boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create user_devices table
create table if not exists user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  device_fingerprint text,
  user_agent text,
  ip_address text,
  last_seen timestamptz default now(),
  created_at timestamptz default now(),
  trusted boolean default false
);

-- RLS
alter table user_totp_secrets enable row level security;
alter table user_devices enable row level security;

-- Policies
create policy if not exists "select_own_totp" on user_totp_secrets for select using (auth.uid() = user_id);
create policy if not exists "update_own_totp" on user_totp_secrets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "select_own_devices" on user_devices for select using (auth.uid() = user_id);
create policy if not exists "manage_own_devices" on user_devices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
