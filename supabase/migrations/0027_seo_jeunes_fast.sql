-- The persona family (jeunes) and a faster pace: the generator runs every
-- minute, and a page goes live as soon as it is written.

alter table public.seo_pages drop constraint if exists seo_pages_family_check;
alter table public.seo_pages add constraint seo_pages_family_check
  check (family in ('idees', 'application', 'argent', 'glossaire', 'alternatives', 'comparatifs', 'jeunes'));

create or replace function public.next_seo_slot()
returns timestamptz
language sql
volatile
security definer
set search_path = public
as $$ select now() $$;
revoke all on function public.next_seo_slot() from public, anon, authenticated;
grant execute on function public.next_seo_slot() to service_role;

select cron.alter_job(
  (select jobid from cron.job where jobname = 'seo-generate'),
  schedule := '* * * * *'
);
