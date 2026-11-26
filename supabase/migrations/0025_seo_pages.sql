-- Generated SEO pages (lib/seo): one row per subject in lib/seo/topics.ts.
-- The generator fills `content` once; a page is public from `published_at`,
-- spread over time so the site grows steadily (about 40 pages a day).
create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  family text not null check (family in ('idees', 'application', 'argent', 'glossaire')),
  slug text not null check (slug ~ '^[a-z0-9-]{1,80}$'),
  topic text not null,
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  attempts integer not null default 0,
  locked_until timestamptz,
  title text,
  description text,
  content jsonb,
  model text,
  generated_at timestamptz,
  published_at timestamptz,
  unique (family, slug)
);

create index if not exists seo_pages_published_idx on public.seo_pages (family, published_at) where status = 'ready';
create index if not exists seo_pages_pending_idx on public.seo_pages (created_at) where status = 'pending';

-- Read and written by the server only (service role).
alter table public.seo_pages enable row level security;
revoke all on public.seo_pages from anon, authenticated;

-- Next publication slot: 36 minutes after the latest one (40 a day), never
-- in the past. Called by the generator for each page it finishes.
create or replace function public.next_seo_slot()
returns timestamptz
language sql
volatile
security definer
set search_path = public
as $$
  select greatest(now(), coalesce(max(published_at), now() - interval '36 minutes') + interval '36 minutes')
  from public.seo_pages
  where status = 'ready';
$$;
revoke all on function public.next_seo_slot() from public, anon, authenticated;
grant execute on function public.next_seo_slot() to service_role;

-- Generate a few pages every 5 minutes until every subject has its page.
select cron.schedule(
  'seo-generate',
  '*/5 * * * *',
  $$ select net.http_get(url := 'https://www.saasfounder.fr/api/seo/generate', timeout_milliseconds := 58000) $$
);
