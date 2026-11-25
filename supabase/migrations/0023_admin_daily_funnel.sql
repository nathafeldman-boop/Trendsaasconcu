-- Per Paris day: how many people visited, signed up, opened a payment and
-- paid, so the admin can read "N visits for M sign-ups today".
-- A visitor is one browser (anon_id, else the account) with a page view.
create or replace function public.admin_daily_funnel(p_days integer default 14)
returns table (day date, visitors bigint, signups bigint, checkouts bigint, payments bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  return query
  with days as (
    select generate_series(
      (now() at time zone 'Europe/Paris')::date - (least(greatest(p_days, 1), 90) - 1),
      (now() at time zone 'Europe/Paris')::date,
      interval '1 day'
    )::date as day
  ),
  ev as (
    select (e.created_at at time zone 'Europe/Paris')::date as day,
           e.name,
           coalesce(e.anon_id::text, e.user_id::text) as who
    from public.events e
    where e.created_at >= now() - make_interval(days => least(greatest(p_days, 1), 90) + 1)
      and e.name in ('page_view', 'checkout_clicked', 'payment_completed')
  ),
  su as (
    select (p.created_at at time zone 'Europe/Paris')::date as day, count(*) as n
    from public.profiles p
    where p.created_at >= now() - make_interval(days => least(greatest(p_days, 1), 90) + 1)
    group by 1
  )
  select d.day,
         (select count(distinct ev.who) from ev where ev.day = d.day and ev.name = 'page_view'),
         coalesce((select su.n from su where su.day = d.day), 0),
         (select count(distinct ev.who) from ev where ev.day = d.day and ev.name = 'checkout_clicked'),
         (select count(distinct ev.who) from ev where ev.day = d.day and ev.name = 'payment_completed')
  from days d
  order by d.day desc;
end;
$$;

revoke all on function public.admin_daily_funnel(integer) from public, anon;
grant execute on function public.admin_daily_funnel(integer) to authenticated;
