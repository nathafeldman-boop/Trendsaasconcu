import Stripe from "stripe";

/**
 * SaaSFounder's own platform billing client (STRIPE_SECRET_KEY). Distinct
 * from the per-user Stripe keys in `stripe_connections`, which read each
 * user's own account to compute their MRR. Returns `null` when unset.
 */
export function createStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}
