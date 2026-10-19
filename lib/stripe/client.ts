import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * SaaSFounder's own platform billing client (STRIPE_SECRET_KEY). Distinct
 * from the per-user Stripe keys in `stripe_connections`, which read each
 * user's own account to compute their MRR. Returns `null` when unset.
 * One instance per server instance, so warm requests reuse its connections.
 */
export function createStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}
