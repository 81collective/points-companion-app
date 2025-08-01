-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist
drop table if exists public.transactions;
drop table if exists public.credit_cards;

-- Create credit_cards table
create table public.credit_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  last4 text not null,
  rewards text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for credit_cards
alter table public.credit_cards enable row level security;

create policy "Users can view their own cards"
  on public.credit_cards for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cards"
  on public.credit_cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cards"
  on public.credit_cards for update
  using (auth.uid() = user_id);

create policy "Users can delete their own cards"
  on public.credit_cards for delete
  using (auth.uid() = user_id);

-- Create transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  card_id uuid references public.credit_cards,
  amount decimal not null,
  date timestamp with time zone not null,
  merchant text not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for transactions
alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Function to ensure test user exists
create or replace function ensure_test_user() returns uuid as $$
declare
  test_user_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
begin
  -- First try to insert the user
  insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) values (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'test@example.com',
    '',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  ) on conflict (id) do nothing;

  -- Add user to auth.identities if needed
  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    created_at,
    updated_at
  ) values (
    test_user_id,
    test_user_id,
    test_user_id,
    json_build_object('sub', test_user_id),
    'email',
    now(),
    now()
  ) on conflict (id) do nothing;

  return test_user_id;
end;
$$ language plpgsql security definer;

-- Add sample transactions (last 30 days)
do $$ 
declare
  v_user_id uuid;
  v_card_id uuid;
begin
  -- Create test user and get ID
  v_user_id := ensure_test_user();
  
  -- First insert credit cards
  insert into public.credit_cards (user_id, name, last4, rewards)
  values 
    (v_user_id, 'Chase Sapphire Preferred', '4567', array['dining:3', 'travel:2', 'streaming:3', 'online_grocery:3']),
    (v_user_id, 'American Express Gold', '1234', array['restaurants:4', 'groceries:4', 'travel:3']),
    (v_user_id, 'Capital One Venture', '9012', array['travel:5', 'hotels:10', 'car_rental:5']);

  -- Select one card ID for transactions
  select id into v_card_id from public.credit_cards where user_id = v_user_id limit 1;

  -- Then insert transactions
  insert into public.transactions (user_id, card_id, amount, date, merchant, category)
  select 
    v_user_id,
    v_card_id,
    (random() * 100 + 20)::numeric(10,2),
    now() - (interval '1 day' * floor(random() * 30)),
    case floor(random() * 5)
      when 0 then 'Whole Foods'
      when 1 then 'Shell Gas'
      when 2 then 'Amazon'
      when 3 then 'Uber'
      else 'Cheesecake Factory'
    end,
    case floor(random() * 5)
      when 0 then 'groceries'
      when 1 then 'gas'
      when 2 then 'shopping'
      when 3 then 'travel'
      else 'dining'
    end
  from generate_series(1, 30);
end $$;
