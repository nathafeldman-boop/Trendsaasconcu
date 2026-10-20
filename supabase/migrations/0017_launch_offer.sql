-- The launch offer on the pricing cards: launch prices for 10 minutes from
-- the first time a member sees them, then the standard prices (+60 %).
-- Checkout reads this to pick the Stripe price, so it's set by the server
-- only: the column-restricted UPDATE grant on profiles leaves it out.
alter table public.profiles add column if not exists offer_expires_at timestamptz;
