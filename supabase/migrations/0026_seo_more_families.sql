-- Two more families of generated pages (alternatives, comparatifs) and a
-- faster publication pace: one page every 10 minutes (144 a day) instead of
-- every 36, with the pages already waiting moved up to that pace.

alter table public.seo_pages drop constraint if exists seo_pages_family_check;
alter table public.seo_pages add constraint seo_pages_family_check
  check (family in ('idees', 'application', 'argent', 'glossaire', 'alternatives', 'comparatifs'));

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

-- Pages written but not yet published: one every 10 minutes from now, in
-- their current order.
with queued as (
  select id, row_number() over (order by published_at) as n
  from public.seo_pages
  where status = 'ready' and published_at > now()
)
update public.seo_pages p
set published_at = now() + (q.n * interval '10 minutes')
from queued q
where p.id = q.id;
