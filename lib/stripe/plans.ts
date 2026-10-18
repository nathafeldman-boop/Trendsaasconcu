// Client-safe display metadata only — no Stripe price IDs here. Those are
// server-only (see app/api/checkout/route.ts), read from env vars so
// switching between Stripe test/live mode never needs a code change.
//
// `amountCents` / `months` are also what checkout checks the Stripe price
// against, so the amount shown here is always the amount actually charged.
function euros(cents: number) {
  return `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;
}

const RAW_PLANS = [
  {
    id: "monthly",
    label: "Mensuel",
    amountCents: 1699,
    months: 1,
    interval: "mois",
    recommended: false,
  },
  {
    id: "quarterly",
    label: "Trimestriel",
    amountCents: 2799,
    months: 3,
    interval: "3 mois",
    recommended: true,
  },
  {
    id: "annual",
    label: "Annuel",
    amountCents: 6799,
    months: 12,
    interval: "an",
    recommended: false,
  },
] as const;

export const PLANS = RAW_PLANS.map((plan) => ({
  ...plan,
  price: euros(plan.amountCents),
  // "soit 9,33 €/mois" under multi-month plans; null for the monthly one.
  perMonth: plan.months > 1 ? euros(Math.round(plan.amountCents / plan.months)) : null,
}));

export type PlanId = (typeof RAW_PLANS)[number]["id"];
