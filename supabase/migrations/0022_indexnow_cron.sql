-- Each morning, announce the blog articles published that day to the
-- IndexNow search engines (see app/api/indexnow/route.ts).
select cron.schedule(
  'blog-indexnow',
  '17 6 * * *',
  $$ select net.http_get(url := 'https://www.saasfounder.fr/api/indexnow', timeout_milliseconds := 20000) $$
);
