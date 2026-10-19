-- Claude calls made for visitors without an account yet: the idea revealed
-- during the onboarding (app/api/onboarding/idea). Capped per day across
-- everyone, so a bot or a traffic spike can't run up the bill; past the cap
-- the route serves an idea from its built-in library instead.
create table if not exists public.public_ai_usage (
  day date primary key,
  cost_usd numeric(12, 6) not null default 0,
  requests integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.public_ai_usage enable row level security;

create policy "Admins can view public AI usage"
  on public.public_ai_usage for select
  using (public.is_admin());

-- Only the service-role server code writes it.
revoke insert, update, delete on public.public_ai_usage from anon, authenticated;

create or replace function public.add_public_ai_usage(p_cost numeric)
returns numeric
language sql
security definer
set search_path = public
as $$
  insert into public.public_ai_usage (day, cost_usd, requests)
  values ((now() at time zone 'Europe/Paris')::date, p_cost, 1)
  on conflict (day) do update
    set cost_usd = public_ai_usage.cost_usd + excluded.cost_usd,
        requests = public_ai_usage.requests + 1,
        updated_at = now()
  returning cost_usd;
$$;

revoke execute on function public.add_public_ai_usage(numeric) from public, anon, authenticated;
grant execute on function public.add_public_ai_usage(numeric) to service_role;
