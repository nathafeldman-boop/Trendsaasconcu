// Client-safe display metadata only — no Stripe price IDs here. Those are
// server-only (see app/api/checkout/route.ts), read from env vars so
// switching between Stripe test/live mode never needs a code change.
//
// `amountCents` / `months` are also what checkout checks the Stripe price
// against, so the amount shown here is always the amount actually charged.
// `aiCredit` multiplies the monthly AI budget (lib/claude/guard.ts): the
// longer plans get double, and the pricing cards say so.
//
// Two price tiers: the launch prices, for OFFER_MINUTES after a visitor
// first sees the pricing cards, then the standard ones (+60 %). The
// deadline is enforced by checkout (profiles.offer_expires_at), so the
// countdown on the cards is real.
export function euros(cents: number) {
  return `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;
}

const RAW_PLANS = [
  {
    id: "monthly",
    label: "Mensuel",
    launchCents: 1699,
    standardCents: 2719,
    months: 1,
    interval: "mois",
    recommended: false,
    aiCredit: 1,
  },
  {
    id: "quarterly",
    label: "Trimestriel",
    launchCents: 2799,
    standardCents: 4479,
    months: 3,
    interval: "3 mois",
    recommended: true,
    aiCredit: 2,
  },
  {
    id: "annual",
    label: "Annuel",
    launchCents: 6799,
    standardCents: 10879,
    months: 12,
    interval: "an",
    recommended: false,
    aiCredit: 2,
  },
] as const;

export type PriceTier = "launch" | "standard";

export const OFFER_MINUTES = 10;
export const OFFER_MS = OFFER_MINUTES * 60_000;

function buildPlans(tier: PriceTier) {
  const cents = (plan: (typeof RAW_PLANS)[number]) => (tier === "launch" ? plan.launchCents : plan.standardCents);
  const monthlyCents = cents(RAW_PLANS[0]);
  return RAW_PLANS.map((plan) => {
    const amountCents = cents(plan);
    // What the same months cost on the monthly plan, for the savings shown
    // on the longer plans (all null for the monthly one).
    const fullCents = monthlyCents * plan.months;
    const saved = fullCents - amountCents;
    return {
      ...plan,
      amountCents,
      price: euros(amountCents),
      // "soit 9,33 €/mois" under multi-month plans.
      perMonth: plan.months > 1 ? euros(Math.round(amountCents / plan.months)) : null,
      fullPrice: saved > 0 ? euros(fullCents) : null,
      savings: saved > 0 ? euros(saved) : null,
      discountPercent: saved > 0 ? Math.round((saved / fullCents) * 100) : null,
    };
  });
}

export const PLAN_TIERS = { launch: buildPlans("launch"), standard: buildPlans("standard") };
export const PLANS = PLAN_TIERS.launch;

/** How much the standard prices add to the launch ones: 60. */
export const OFFER_INCREASE_PERCENT = Math.round((RAW_PLANS[0].standardCents / RAW_PLANS[0].launchCents - 1) * 100);

export type PlanId = (typeof RAW_PLANS)[number]["id"];
