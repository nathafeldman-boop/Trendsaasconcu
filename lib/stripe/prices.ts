import Stripe from "stripe";
import { PLAN_TIERS, type PlanId, type PriceTier } from "@/lib/stripe/plans";

// Server-only: which Stripe Price object each plan maps to, for the launch
// prices and the standard ones (+60 %, once the member's launch offer has
// expired). Tried in order:
//   1. the env vars, when they point at a price that matches the plan;
//   2. the price with the plan's lookup key (saasfounder_monthly_launch...);
//   3. the live prices of the account SaaSFounder started on;
//   4. none of those: the product and price are created, with that lookup
//      key. A fresh Stripe account (one of SaaSFounder's own instead of the
//      shared one) only needs STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.

export type Plan = (typeof PLAN_TIERS.launch)[number];

const ENV_PRICE_IDS: Record<PriceTier, Record<PlanId, string | undefined>> = {
  launch: {
    monthly: process.env.STRIPE_PRICE_MONTHLY?.trim(),
    quarterly: process.env.STRIPE_PRICE_QUARTERLY?.trim(),
    annual: process.env.STRIPE_PRICE_ANNUAL?.trim(),
  },
  standard: {
    monthly: process.env.STRIPE_PRICE_MONTHLY_STANDARD?.trim(),
    quarterly: process.env.STRIPE_PRICE_QUARTERLY_STANDARD?.trim(),
    annual: process.env.STRIPE_PRICE_ANNUAL_STANDARD?.trim(),
  },
};
const KNOWN_PRICE_IDS: Record<PriceTier, Record<PlanId, string>> = {
  launch: {
    monthly: "price_1US2a9Rd6r34OMU6nW5QxKJc",
    quarterly: "price_1USDsMRd6r34OMU6Qu96X804",
    annual: "price_1USDvxRd6r34OMU6jVVz0K0j",
  },
  standard: {
    monthly: "price_1USc3zRd6r34OMU6z6rmNXP4",
    quarterly: "price_1USc47Rd6r34OMU6P2P8afeD",
    annual: "price_1USc4KRd6r34OMU6mOoBBswV",
  },
};

const PRODUCT_NAME = "SaaSFounder — Lance ton SaaS avec l'IA";
const PRODUCT_DESCRIPTION =
  "Ton mini-accompagnement pour créer ton SaaS avec l'IA et encaisser tes premiers paiements : ton idée, ton prompt de build, ton coach IA et ton plan marketing.";

function lookupKey(tier: PriceTier, planId: PlanId) {
  return `saasfounder_${planId}_${tier}`;
}

function billedMonths(price: Stripe.Price) {
  const recurring = price.recurring;
  if (!recurring) return null;
  const count = recurring.interval_count || 1;
  if (recurring.interval === "month") return count;
  if (recurring.interval === "year") return 12 * count;
  return null;
}

// Never charge something other than what /tarifs shows: a price for
// another amount or billing period is refused.
function priceMatches(price: Stripe.Price, plan: Plan) {
  const ok =
    price.active && price.unit_amount === plan.amountCents && price.currency === "eur" && billedMonths(price) === plan.months;
  if (!ok) {
    console.error(
      `Stripe price ${price.id} doesn't match plan ${plan.id}: expected ${plan.amountCents} eur every ${plan.months} month(s), got ${price.unit_amount} ${price.currency} every ${billedMonths(price)} month(s)${price.active ? "" : " (archived)"}`
    );
  }
  return ok;
}

async function retrieveMatching(stripe: Stripe, priceId: string, plan: Plan) {
  try {
    const price = await stripe.prices.retrieve(priceId);
    return priceMatches(price, plan) ? price.id : null;
  } catch (err) {
    if (err instanceof Stripe.errors.StripeInvalidRequestError && err.code === "resource_missing") {
      console.error(`Stripe price ${priceId} (plan ${plan.id}) doesn't exist in this Stripe account.`);
      return null;
    }
    throw err;
  }
}

async function findByLookupKey(stripe: Stripe, plan: Plan, tier: PriceTier) {
  const { data } = await stripe.prices.list({ lookup_keys: [lookupKey(tier, plan.id)], active: true, limit: 1 });
  return data[0] && priceMatches(data[0], plan) ? data[0].id : null;
}

// The plan's product: the one its other tier's price already uses, or a new one.
async function productFor(stripe: Stripe, plan: Plan, origin: string) {
  const { data } = await stripe.prices.list({
    lookup_keys: [lookupKey("launch", plan.id), lookupKey("standard", plan.id)],
    limit: 2,
  });
  const existing = data[0]?.product;
  if (existing) return typeof existing === "string" ? existing : existing.id;
  const product = await stripe.products.create(
    {
      name: PRODUCT_NAME,
      description: PRODUCT_DESCRIPTION,
      images: [`${origin}/brand/stripe-icon.png`],
      metadata: { plan: plan.id },
    },
    { idempotencyKey: `saasfounder-product-${plan.id}` }
  );
  return product.id;
}

async function createPrice(stripe: Stripe, plan: Plan, tier: PriceTier, origin: string) {
  const price = await stripe.prices.create(
    {
      product: await productFor(stripe, plan, origin),
      currency: "eur",
      unit_amount: plan.amountCents,
      recurring: plan.months === 12 ? { interval: "year" } : { interval: "month", interval_count: plan.months },
      // Takes the key from an older price (say, after a price change).
      lookup_key: lookupKey(tier, plan.id),
      transfer_lookup_key: true,
      nickname: `${plan.label} · ${tier === "launch" ? "prix de lancement" : "tarif standard"}`,
      metadata: { plan: plan.id, tier },
    },
    { idempotencyKey: `saasfounder-price-${tier}-${plan.id}-${plan.amountCents}` }
  );
  console.info(`Created Stripe price ${price.id} for plan ${plan.id} (${tier}).`);
  return price.id;
}

// Prices are immutable in Stripe: once resolved, a plan's price stays valid
// for this server instance's lifetime and warm requests skip the lookup.
const resolved = new Map<string, string>();
// Creations run one after the other, so the two tiers of a plan share one product.
let creating: Promise<unknown> = Promise.resolve();

export async function resolvePrice(stripe: Stripe, plan: Plan, tier: PriceTier, origin: string) {
  const key = `${tier}:${plan.id}`;
  const cached = resolved.get(key);
  if (cached) return cached;

  let priceId: string | null = null;
  const envId = ENV_PRICE_IDS[tier][plan.id];
  if (envId) priceId = await retrieveMatching(stripe, envId, plan);
  priceId ??= await findByLookupKey(stripe, plan, tier);
  if (!priceId && KNOWN_PRICE_IDS[tier][plan.id] !== envId) {
    priceId = await retrieveMatching(stripe, KNOWN_PRICE_IDS[tier][plan.id], plan);
  }
  if (!priceId) {
    const next = creating.then(() => createPrice(stripe, plan, tier, origin));
    creating = next.catch(() => undefined);
    priceId = await next;
  }
  resolved.set(key, priceId);
  return priceId;
}
