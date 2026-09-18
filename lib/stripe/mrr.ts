import type Stripe from "stripe";

// Normalizes any billing interval down to a monthly figure so subscriptions
// on different cadences (weekly, annual...) can be summed into one MRR.
export function computeMrr(subscriptions: Stripe.Subscription[]) {
  let mrrCents = 0;
  let currency = "eur";

  for (const sub of subscriptions) {
    for (const item of sub.items.data) {
      const price = item.price;
      if (!price?.unit_amount || !price.recurring) continue;
      const quantity = item.quantity ?? 1;
      const amount = price.unit_amount * quantity;
      const count = price.recurring.interval_count || 1;
      currency = price.currency ?? currency;

      if (price.recurring.interval === "year") {
        mrrCents += amount / (12 * count);
      } else if (price.recurring.interval === "month") {
        mrrCents += amount / count;
      } else if (price.recurring.interval === "week") {
        mrrCents += (amount * 52) / (12 * count);
      } else if (price.recurring.interval === "day") {
        mrrCents += (amount * 365) / (12 * count);
      }
    }
  }

  return { mrr: Math.round(mrrCents) / 100, currency };
}
