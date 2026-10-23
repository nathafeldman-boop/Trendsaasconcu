-- One reminder email for members who leave Stripe Checkout without paying,
-- only if they asked for it (checkbox on the pricing cards). Both columns
-- are written by the server only: the column-restricted UPDATE grant on
-- profiles leaves them out.
alter table public.profiles add column if not exists checkout_reminder_consent_at timestamptz;
alter table public.profiles add column if not exists checkout_reminder_sent_at timestamptz;
