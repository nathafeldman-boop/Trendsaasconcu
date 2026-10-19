import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeMrr } from "@/lib/stripe/mrr";

export type PriceInUse = {
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  subscriptions: number;
};

export type StripeMetrics =
  | { connected: false; error?: undefined }
  | { connected: true; error: true }
  | {
      connected: true;
      error?: false;
      currency: string;
      mrr: number;
      activeSubscriptions: number;
      trialing: number;
      pastDue: number;
      newLast30: number;
      canceledLast30: number;
      /** MRR per active subscription. */
      arpu: number;
      prices: PriceInUse[];
    };

const DAY = 24 * 60 * 60;

/**
 * Reads the user's OWN Stripe account (the key they connected in Revenus)
 * and boils it down to what the dashboard, the recommendations and the
 * coach need. Looks at the latest 100 subscriptions, which covers every
 * account at the stage our users are at.
 */
export async function getStripeMetrics(userId: string): Promise<StripeMetrics> {
  const admin = createAdminClient();
  if (!admin) return { connected: false };

  const { data: connection } = await admin
    .from("stripe_connections")
    .select("stripe_secret_key")
    .eq("user_id", userId)
    .maybeSingle();
  if (!connection?.stripe_secret_key) return { connected: false };

  try {
    const stripe = new Stripe(connection.stripe_secret_key, { timeout: 8000, maxNetworkRetries: 0 });
    const all = await stripe.subscriptions.list({ status: "all", limit: 100 });
    const now = Math.floor(Date.now() / 1000);

    const active = all.data.filter((s) => s.status === "active");
    const { mrr, currency } = computeMrr(active);

    const prices = new Map<string, PriceInUse>();
    for (const sub of active) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (!price?.unit_amount || !price.recurring) continue;
        const existing = prices.get(price.id);
        if (existing) {
          existing.subscriptions += 1;
        } else {
          prices.set(price.id, {
            amount: price.unit_amount / 100,
            currency: price.currency,
            interval: price.recurring.interval,
            intervalCount: price.recurring.interval_count || 1,
            subscriptions: 1,
          });
        }
      }
    }

    return {
      connected: true,
      currency,
      mrr,
      activeSubscriptions: active.length,
      trialing: all.data.filter((s) => s.status === "trialing").length,
      pastDue: all.data.filter((s) => s.status === "past_due" || s.status === "unpaid").length,
      newLast30: all.data.filter((s) => s.created > now - 30 * DAY && s.status !== "canceled").length,
      canceledLast30: all.data.filter((s) => s.status === "canceled" && (s.canceled_at ?? 0) > now - 30 * DAY).length,
      arpu: active.length ? Math.round((mrr / active.length) * 100) / 100 : 0,
      prices: [...prices.values()].sort((a, b) => b.subscriptions - a.subscriptions),
    };
  } catch (err) {
    console.error("getStripeMetrics: Stripe read failed:", err instanceof Error ? err.message : err);
    return { connected: true, error: true };
  }
}
