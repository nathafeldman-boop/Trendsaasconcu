-- Creators' email, for the daily reminders to post (lib/email/creator-reminder.ts),
-- and when they turned the reminders off. Sent three times a day by pg_cron,
-- only to creators who haven't posted yet that day.
alter table public.creators add column if not exists email text;
alter table public.creators add column if not exists reminders_off_at timestamptz;

-- 11:00, 17:00 and 21:00 Paris time in winter (10, 16, 20 UTC).
select cron.unschedule('creator-reminders') where exists (select 1 from cron.job where jobname = 'creator-reminders');
select cron.schedule(
  'creator-reminders',
  '0 10,16,20 * * *',
  $$ select net.http_get(url := 'https://www.saasfounder.fr/api/creators/reminders', timeout_milliseconds := 58000) $$
);
