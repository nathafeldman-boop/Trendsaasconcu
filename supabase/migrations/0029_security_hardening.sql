-- Security hardening after an audit against common attacks on vibe-coded
-- apps. Row level security already guards every table; this removes table
-- rights the public API roles never use, and stops anonymous visitors from
-- calling the admin check.

-- Visitors and signed-in users never empty, trigger on or reference tables
-- through the API (TRUNCATE is not covered by row level security).
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;

-- is_admin() is only meaningful for a signed-in user (used by policies).
revoke execute on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated;
