-- The launch autopilot (/espace/lancement): accounts a member connects so
-- SaaSFounder sets things up for them (GitHub repo, Supabase project,
-- Hostinger DNS), and what it has set up so far.

-- Access tokens, encrypted by the server before they get here
-- (lib/connections/crypto.ts). Read and written only with the service role:
-- no client role can touch this table at all.
create table if not exists public.user_connections (
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('github', 'supabase', 'hostinger')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  account_name text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, provider)
);

alter table public.user_connections enable row level security;
revoke all on public.user_connections from anon, authenticated;

-- What the autopilot created for each member. Nothing secret: the Supabase
-- publishable key is meant to ship in the browser anyway. Members read
-- their own row; only the server writes.
create table if not exists public.launch_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  repo_full_name text,
  repo_url text,
  supabase_ref text,
  supabase_status text,
  supabase_url text,
  supabase_publishable_key text,
  supabase_schema_applied boolean not null default false,
  site_url text,
  domain text,
  domain_connected_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.launch_state enable row level security;

create policy "Users can view their own launch state"
  on public.launch_state for select
  using ((select auth.uid()) = user_id);

create policy "Admins can view all launch states"
  on public.launch_state for select
  using (public.is_admin());

revoke insert, update, delete on public.launch_state from anon, authenticated;
