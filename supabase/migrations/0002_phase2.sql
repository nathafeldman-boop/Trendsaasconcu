-- Phase 2: admin roles, access-code gate, builder/marketing progress, Stripe keys.

-- ---------------------------------------------------------------------------
-- profiles: new columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists has_access boolean not null default false,
  add column if not exists last_seen_at timestamptz;

-- Prevent users from granting themselves access/admin via a direct client
-- update — only safe columns are updatable from the client. Privileged
-- columns are only ever changed by security-definer functions below (which
-- run as the table owner and are unaffected by this grant).
revoke update on public.profiles from authenticated;
grant update (first_name, last_seen_at) on public.profiles to authenticated;

-- security definer helper so RLS policies can check admin status without
-- recursing back into profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Bootstrap admin + carry is_admin through on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, is_admin)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.email = 'nathabuisseness@gmail.com'
  );
  return new;
end;
$$;

update public.profiles p
set is_admin = true
from auth.users u
where p.id = u.id and u.email = 'nathabuisseness@gmail.com' and not p.is_admin;

create or replace function public.promote_to_admin(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  select id into v_user_id from auth.users where email = p_email;
  if v_user_id is null then
    return false;
  end if;
  update public.profiles set is_admin = true where id = v_user_id;
  return true;
end;
$$;

grant execute on function public.promote_to_admin(text) to authenticated;

-- ---------------------------------------------------------------------------
-- onboarding_responses: one row per user (upsert target), not one per attempt
-- ---------------------------------------------------------------------------
alter table public.onboarding_responses
  add constraint onboarding_responses_user_id_key unique (user_id);

create policy "Users can update their own onboarding responses"
  on public.onboarding_responses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- access_codes + redemptions: the MVP paywall substitute
-- ---------------------------------------------------------------------------
create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text,
  max_uses integer not null default 1,
  uses_count integer not null default 0,
  revoked boolean not null default false,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table public.access_codes enable row level security;

create policy "Admins can manage access codes"
  on public.access_codes for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.access_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.access_codes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.access_code_redemptions enable row level security;

create policy "Users can view their own redemption"
  on public.access_code_redemptions for select
  using (auth.uid() = user_id);

create policy "Admins can view all redemptions"
  on public.access_code_redemptions for select
  using (public.is_admin());

create or replace function public.redeem_access_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_id uuid;
  v_max_uses integer;
  v_uses_count integer;
  v_revoked boolean;
  v_inserted integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, max_uses, uses_count, revoked
    into v_code_id, v_max_uses, v_uses_count, v_revoked
    from public.access_codes
    where code = p_code
    for update;

  if v_code_id is null or v_revoked or v_uses_count >= v_max_uses then
    return false;
  end if;

  insert into public.access_code_redemptions (code_id, user_id)
  values (v_code_id, auth.uid())
  on conflict (user_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update public.access_codes set uses_count = uses_count + 1 where id = v_code_id;
  end if;

  update public.profiles set has_access = true where id = auth.uid();

  return true;
end;
$$;

grant execute on function public.redeem_access_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- builder_progress + marketing_progress: phase-2 wizard state
-- ---------------------------------------------------------------------------
create table if not exists public.builder_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  has_idea boolean,
  idea_text text,
  chosen_tool text,
  checklist jsonb not null default '{}'::jsonb,
  mvp_launched boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.builder_progress enable row level security;

create policy "Users can manage their own builder progress"
  on public.builder_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view all builder progress"
  on public.builder_progress for select
  using (public.is_admin());

create table if not exists public.marketing_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  chosen_channel text,
  tiktok_url text,
  self_reported_views integer,
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.marketing_progress enable row level security;

create policy "Users can manage their own marketing progress"
  on public.marketing_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view all marketing progress"
  on public.marketing_progress for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- stripe_connections: per-user Stripe key, never selectable by any client role
-- ---------------------------------------------------------------------------
create table if not exists public.stripe_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_secret_key text not null,
  connected_at timestamptz not null default now()
);

alter table public.stripe_connections enable row level security;

create policy "Users can insert their own stripe key"
  on public.stripe_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own stripe key"
  on public.stripe_connections for update
  using (auth.uid() = user_id);

-- Intentionally no SELECT policy: the key is only ever read server-side via
-- the service-role client inside a Server Action / route handler.
