-- Supabase projects created from late 2026 no longer grant the API roles
-- (anon, authenticated, service_role) access to new tables in public by
-- default. The earlier migrations relied on those defaults, so a fresh
-- project needs them made explicit: the same access the original project
-- had, with RLS still deciding which rows each user sees.

-- The server (service role, bypasses RLS) reads and writes every table.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;

-- Browser and signed-in users: read through RLS, as before. Writes stay as
-- the earlier migrations set them (0009/0010: authenticated on the original
-- tables, profiles column-restricted; none for anon).
grant select on all tables in schema public to anon, authenticated;

-- Server-only tables: never readable from the browser, whatever RLS says.
revoke all on public.user_connections from anon, authenticated;
revoke all on public.creators, public.creator_videos, public.creator_payouts from anon, authenticated;
