import Stripe from "stripe";
import type { Plan, PlanId, PriceTier } from "@/lib/stripe/plans";

// Server-only: which Stripe Price object each plan and tier maps to. Tried
// in order:
//   1. the price with its lookup key (saasfounder_monthly_launch...);
//   2. the live prices created for it in the account SaaSFounder runs on;
//   3. none of those: the product and price are created, with that lookup
//      key. A fresh Stripe account (one of SaaSFounder's own instead of the
//      shared one) only needs STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.

const KNOWN_PRICE_IDS: Record<string, string> = {
  monthly_launch: "price_1UeH9nRd6r34OMU637aPUPMa",
  monthly_standard: "price_1UeH9rRd6r34OMU66QTv0oNw",
  quarterly_launch: "price_1UeH9zRd6r34OMU6elW69dIp",
  quarterly_standard: "price_1UeHADRd6r34OMU695XEIJ03",
  lifetime_launch: "price_1UeHAQRd6r34OMU6GStTCejv",
  lifetime_standard: "price_1UeHAWRd6r34OMU6w8XVYKQz",
  lifetime_exit: "price_1UeHAZRd6r34OMU6jbP7SZG6",
  weekly_launch: "price_1UeHAfRd6r34OMU6Wlthi2rP",
};

const PRODUCTS: Record<PlanId, { name: string; description: string }> = {
  monthly: {
    name: "SaaSFounder — Lance ton SaaS avec l'IA",
    description:
      "Ton idée de SaaS sur mesure, le prompt qui écrit ton site, la mise en ligne guidée et ton plan de lancement. Résiliable à tout moment.",
  },
  quarterly: {
    name: "SaaSFounder — Lance ton SaaS avec l'IA",
    description:
      "Ton idée de SaaS sur mesure, le prompt qui écrit ton site, la mise en ligne guidée, ton plan de lancement, ton plan marketing et tes scripts vidéo. Résiliable à tout moment.",
  },
  lifetime: {
    name: "SaaSFounder — Accès à vie",
    description:
      "Tout, pour toujours : ton idée sur mesure, le prompt qui écrit ton site, la mise en ligne guidée, tes plans, tes scripts vidéo et le coach IA. Paiement unique, sans abonnement.",
  },
  weekly: {
    name: "SaaSFounder — 1 semaine",
    description: "Pour commencer tout de suite : ton idée de SaaS sur mesure et le prompt qui écrit ton site. Résiliable à tout moment.",
  },
};

function key(plan: Plan, tier: PriceTier) {
  return `${plan.id}_${plan.id === "weekly" ? "launch" : tier}`;
}

function lookupKey(plan: Plan, tier: PriceTier) {
  return `saasfounder_${key(plan, tier)}`;
}

// Never charge something other than what the pricing page shows: a price
// for another amount or billing period is refused.
function priceMatches(price: Stripe.Price, plan: Plan) {
  const billing = plan.billing;
  const sameBilling =
    billing.mode === "payment"
      ? price.type === "one_time"
      : price.recurring?.interval === billing.interval && (price.recurring.interval_count || 1) === billing.count;
  const ok = price.active && price.unit_amount === plan.amountCents && price.currency === "eur" && sameBilling;
  if (!ok) {
    console.error(
      `Stripe price ${price.id} doesn't match plan ${plan.id}: expected ${plan.amountCents} eur (${JSON.stringify(billing)}), got ${price.unit_amount} ${price.currency} (${price.type} ${price.recurring?.interval ?? ""}×${price.recurring?.interval_count ?? ""})${price.active ? "" : " (archived)"}`
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
  const { data } = await stripe.prices.list({ lookup_keys: [lookupKey(plan, tier)], active: true, limit: 1 });
  return data[0] && priceMatches(data[0], plan) ? data[0].id : null;
}

// The plan's product: the one its other prices already use, or a new one.
async function productFor(stripe: Stripe, plan: Plan, origin: string) {
  const { data } = await stripe.prices.list({
    lookup_keys: ["launch", "standard", "exit"].map((tier) => `saasfounder_${plan.id}_${tier}`),
    limit: 3,
  });
  const existing = data[0]?.product;
  if (existing) return typeof existing === "string" ? existing : existing.id;
  const product = await stripe.products.create(
    {
      ...PRODUCTS[plan.id],
      images: [`${origin}/brand/stripe-icon.png`],
      statement_descriptor: "SAASFOUNDER",
      metadata: { plan: plan.id },
    },
    { idempotencyKey: `saasfounder-product-${plan.id}-v2` }
  );
  return product.id;
}

async function createPrice(stripe: Stripe, plan: Plan, tier: PriceTier, origin: string) {
  const billing = plan.billing;
  const price = await stripe.prices.create(
    {
      product: await productFor(stripe, plan, origin),
      currency: "eur",
      unit_amount: plan.amountCents,
      ...(billing.mode === "subscription" ? { recurring: { interval: billing.interval, interval_count: billing.count } } : {}),
      // Takes the key from an older price (say, after a price change).
      lookup_key: lookupKey(plan, tier),
      transfer_lookup_key: true,
      nickname: `${plan.label} · ${tier}`,
      metadata: { plan: plan.id, tier },
    },
    { idempotencyKey: `saasfounder-price-${key(plan, tier)}-${plan.amountCents}` }
  );
  console.info(`Created Stripe price ${price.id} for plan ${plan.id} (${tier}).`);
  return price.id;
}

// Prices are immutable in Stripe: once resolved, a plan's price stays valid
// for this server instance's lifetime and warm requests skip the lookup.
const resolved = new Map<string, string>();
// Creations run one after the other, so the prices of a plan share one product.
let creating: Promise<unknown> = Promise.resolve();

export async function resolvePrice(stripe: Stripe, plan: Plan, tier: PriceTier, origin: string) {
  const cacheKey = `${key(plan, tier)}:${plan.amountCents}`;
  const cached = resolved.get(cacheKey);
  if (cached) return cached;

  let priceId = await findByLookupKey(stripe, plan, tier);
  const known = KNOWN_PRICE_IDS[key(plan, tier)];
  if (!priceId && known) priceId = await retrieveMatching(stripe, known, plan);
  if (!priceId) {
    const next = creating.then(() => createPrice(stripe, plan, tier, origin));
    creating = next.catch(() => undefined);
    priceId = await next;
  }
  resolved.set(cacheKey, priceId);
  return priceId;
}
