-- Second wave: pages go live one every 10 minutes (144 a day) again, so the
-- site grows at a steady pace instead of in bursts.
create or replace function public.next_seo_slot()
returns timestamptz
language sql
volatile
security definer
set search_path = public
as $$
  select greatest(now(), coalesce(max(published_at), now() - interval '10 minutes') + interval '10 minutes')
  from public.seo_pages
  where status = 'ready';
$$;
revoke all on function public.next_seo_slot() from public, anon, authenticated;
grant execute on function public.next_seo_slot() to service_role;
