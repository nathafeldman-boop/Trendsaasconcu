-- Product analytics: one row per thing a visitor or member does (page view,
-- onboarding step, plan click, payment, idea saved...). Written only by the
-- server (/api/track and server routes, with the service role), read only by
-- admins, so the dashboard can show the whole funnel and each user's journey.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  -- Random id kept in the visitor's browser: ties a visitor's events
  -- together before and after they create an account.
  anon_id uuid,
  user_id uuid references auth.users (id) on delete set null,
  session_id uuid,
  name text not null check (name ~ '^[a-z0-9_]{1,60}$'),
  path text check (char_length(path) <= 300),
  props jsonb not null default '{}'::jsonb check (pg_column_size(props) <= 4000),
  -- First-touch source of the visitor (utm_source, referrer site, or the
  -- app whose in-app browser they came from).
  source text check (char_length(source) <= 100),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  country text check (char_length(country) <= 2)
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_name_created_at_idx on public.events (name, created_at desc);
create index if not exists events_user_id_idx on public.events (user_id, created_at) where user_id is not null;
create index if not exists events_anon_id_idx on public.events (anon_id, created_at) where anon_id is not null;

alter table public.events enable row level security;

create policy "Admins can read events"
  on public.events for select
  using (public.is_admin());

revoke insert, update, delete on public.events from anon, authenticated;

-- Everything the admin dashboard shows for the last p_days days, in one
-- round trip. Visitor-level steps count distinct browsers (anon_id),
-- member-level steps count distinct accounts.
create or replace function public.admin_analytics(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_since timestamptz := now() - make_interval(days => greatest(1, least(p_days, 365)));
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  -- Days are counted in French time.
  with ev as (
    select * from public.events where created_at >= v_since
  ),
  visitor_first_source as (
    select distinct on (anon_id) anon_id, coalesce(source, 'direct') as source
    from ev where anon_id is not null
    order by anon_id, created_at
  ),
  user_anon as (
    select distinct user_id, anon_id from ev where user_id is not null and anon_id is not null
  ),
  signups as (
    select id as user_id, created_at from public.profiles where created_at >= v_since
  ),
  payers as (
    select distinct user_id from ev where name = 'payment_completed' and user_id is not null
  )
  select jsonb_build_object(
    'kpis', jsonb_build_object(
      'visitors', (select count(distinct anon_id) from ev where name = 'page_view'),
      'sessions', (select count(distinct session_id) from ev where name = 'page_view'),
      'pageviews', (select count(*) from ev where name = 'page_view'),
      'signups', (select count(*) from signups),
      'payments', (select count(*) from payers),
      'checkouts', (select count(distinct coalesce(user_id::text, anon_id::text)) from ev where name = 'checkout_clicked')
    ),
    'funnel', jsonb_build_array(
      jsonb_build_object('step', 'Visite le site', 'count', (select count(distinct anon_id) from ev where name = 'page_view')),
      jsonb_build_object('step', 'Commence le questionnaire', 'count', (select count(distinct anon_id) from ev where name = 'onboarding_step')),
      jsonb_build_object('step', 'Crée son compte', 'count', (select count(*) from signups)),
      jsonb_build_object('step', 'Voit les prix', 'count', (select count(distinct coalesce(user_id::text, anon_id::text)) from ev where name = 'pricing_viewed')),
      jsonb_build_object('step', 'Clique sur une formule', 'count', (select count(distinct coalesce(user_id::text, anon_id::text)) from ev where name = 'checkout_clicked')),
      jsonb_build_object('step', 'Paie', 'count', (select count(*) from payers)),
      jsonb_build_object('step', 'Choisit son idée', 'count', (select count(distinct user_id) from ev where name = 'idea_saved')),
      jsonb_build_object('step', 'Génère son prompt', 'count', (select count(distinct user_id) from ev where name = 'build_prompt_generated')),
      jsonb_build_object('step', 'Lance sa MVP', 'count', (select count(distinct user_id) from ev where name = 'mvp_launched'))
    ),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'visitors', d.visitors, 'signups', d.signups, 'payments', d.payments) order by d.day)
      from (
        select g.day::date as day,
          (select count(distinct anon_id) from ev where name = 'page_view' and (created_at at time zone 'Europe/Paris')::date = g.day::date) as visitors,
          (select count(*) from signups where (created_at at time zone 'Europe/Paris')::date = g.day::date) as signups,
          (select count(distinct user_id) from ev where name = 'payment_completed' and (created_at at time zone 'Europe/Paris')::date = g.day::date) as payments
        from generate_series((v_since at time zone 'Europe/Paris')::date, (now() at time zone 'Europe/Paris')::date, interval '1 day') as g(day)
      ) d
    ), '[]'::jsonb),
    'onboarding', coalesce((
      select jsonb_agg(jsonb_build_object('step', s.step, 'index', s.idx, 'visitors', s.visitors) order by s.idx, s.step)
      from (
        select props->>'step' as step,
          min((props->>'index')::int) as idx,
          count(distinct anon_id) as visitors
        from ev
        where name = 'onboarding_step' and props ? 'step'
        group by props->>'step'
      ) s
    ), '[]'::jsonb),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object('source', s.source, 'visitors', s.visitors, 'signups', s.signups, 'payments', s.payments) order by s.visitors desc)
      from (
        select vfs.source,
          count(distinct vfs.anon_id) as visitors,
          count(distinct ua.user_id) filter (where ua.user_id in (select user_id from signups)) as signups,
          count(distinct ua.user_id) filter (where ua.user_id in (select user_id from payers)) as payments
        from visitor_first_source vfs
        left join user_anon ua on ua.anon_id = vfs.anon_id
        group by vfs.source
        order by visitors desc
        limit 12
      ) s
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('device', d.device, 'visitors', d.visitors) order by d.visitors desc)
      from (
        select coalesce(device, 'inconnu') as device, count(distinct anon_id) as visitors
        from ev where name = 'page_view' group by 1
      ) d
    ), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('country', c.country, 'visitors', c.visitors) order by c.visitors desc)
      from (
        select coalesce(country, '?') as country, count(distinct anon_id) as visitors
        from ev where name = 'page_view' group by 1 order by 2 desc limit 8
      ) c
    ), '[]'::jsonb),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', p.path, 'views', p.views, 'visitors', p.visitors) order by p.views desc)
      from (
        select path, count(*) as views, count(distinct anon_id) as visitors
        from ev where name = 'page_view' and path is not null group by path order by 2 desc limit 12
      ) p
    ), '[]'::jsonb),
    'actions', coalesce((
      select jsonb_agg(jsonb_build_object('name', a.name, 'count', a.total, 'users', a.users) order by a.users desc, a.total desc)
      from (
        select name, count(*) as total, count(distinct coalesce(user_id::text, anon_id::text)) as users
        from ev where name <> 'page_view' and name <> 'onboarding_step'
        group by name
      ) a
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.admin_analytics(integer) from public, anon;
grant execute on function public.admin_analytics(integer) to authenticated;
