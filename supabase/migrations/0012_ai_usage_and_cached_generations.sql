-- Per-user, per-month Claude spend, so one customer can't burn through the
-- API credit: every AI route checks it before calling Claude and adds the
-- real cost of the response afterwards (lib/claude/guard.ts).
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null,
  cost_usd numeric(12, 6) not null default 0,
  requests integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

alter table public.ai_usage enable row level security;

create policy "Users can view their own AI usage"
  on public.ai_usage for select
  using ((select auth.uid()) = user_id);

create policy "Admins can view all AI usage"
  on public.ai_usage for select
  using (public.is_admin());

-- Read-only for clients: only the service-role server code writes it, so a
-- user can't reset their own counter.
revoke insert, update, delete on public.ai_usage from anon, authenticated;

create or replace function public.add_ai_usage(p_user_id uuid, p_cost numeric)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.ai_usage (user_id, month, cost_usd, requests)
  values (p_user_id, to_char(now() at time zone 'utc', 'YYYY-MM'), p_cost, 1)
  on conflict (user_id, month) do update
    set cost_usd = ai_usage.cost_usd + excluded.cost_usd,
        requests = ai_usage.requests + 1,
        updated_at = now();
$$;

revoke execute on function public.add_ai_usage(uuid, numeric) from public, anon, authenticated;
grant execute on function public.add_ai_usage(uuid, numeric) to service_role;

-- Generated once, then served from here: the 3 ideas and the build prompt
-- are the expensive calls, and re-opening the page must not pay for them
-- again. build_prompt_key is the idea + tool the prompt was written for.
alter table public.builder_progress
  add column if not exists ai_ideas jsonb,
  add column if not exists build_prompt text,
  add column if not exists build_prompt_key text;
