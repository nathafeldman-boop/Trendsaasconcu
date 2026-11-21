-- Creator program: creators sign up from a shared link (name, TikTok
-- handle, phone, where to pay them), add their video links, and are paid
-- per view. Views are refreshed every 10 minutes by pg_cron calling the
-- site's /api/creators/refresh.
--
-- No RLS policies on purpose: only the server (service role) reads and
-- writes these tables. Creators reach their own page through a secret token
-- link, admins through /admin/createurs.

create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  tiktok_handle text not null,
  phone text not null,
  payout_method text not null,
  payout_details text not null,
  consent_at timestamptz not null default now()
);
create unique index if not exists creators_tiktok_handle_key on public.creators (lower(tiktok_handle));

create table if not exists public.creator_videos (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators (id) on delete cascade,
  created_at timestamptz not null default now(),
  url text not null,
  video_id text not null unique,
  author text,
  posted_at timestamptz,
  views bigint not null default 0,
  views_checked_at timestamptz,
  last_error text,
  status text not null default 'active' check (status in ('active', 'rejected')),
  rejected_reason text
);
create index if not exists creator_videos_creator_idx on public.creator_videos (creator_id);
create index if not exists creator_videos_checked_idx on public.creator_videos (views_checked_at nulls first) where status = 'active';

create table if not exists public.creator_payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators (id) on delete cascade,
  created_at timestamptz not null default now(),
  amount_cents integer not null check (amount_cents > 0),
  note text
);
create index if not exists creator_payouts_creator_idx on public.creator_payouts (creator_id);

alter table public.creators enable row level security;
alter table public.creator_videos enable row level security;
alter table public.creator_payouts enable row level security;

-- Every 10 minutes: ask the site to refresh the views of the videos not
-- checked in the last 9 minutes (the endpoint does nothing more often).
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('creator-views') where exists (select 1 from cron.job where jobname = 'creator-views');
select cron.schedule(
  'creator-views',
  '*/10 * * * *',
  $$ select net.http_get(url := 'https://www.saasfounder.fr/api/creators/refresh', timeout_milliseconds := 55000) $$
);
