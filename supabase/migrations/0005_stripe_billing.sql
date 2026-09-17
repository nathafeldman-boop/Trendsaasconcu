-- SaaSFounder's own subscription billing (distinct from stripe_connections,
-- which holds each user's OWN Stripe key for their MRR dashboard).

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan text;

-- No column grant added for authenticated on these three: only the
-- service-role webhook handler ever writes them (same pattern as
-- is_admin/has_access — see 0002_phase2.sql for why).
