// Client-safe display metadata only — no Stripe price IDs here. Those are
// server-only (see app/api/checkout/route.ts), read from env vars so
// switching between Stripe test/live mode never needs a code change.
//
// `amountCents` / `months` are also what checkout checks the Stripe price
// against, so the amount shown here is always the amount actually charged.
// `aiCredit` multiplies the monthly AI budget (lib/claude/guard.ts): the
// longer plans get double, and the pricing cards say so.
export function euros(cents: number) {
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
    aiCredit: 1,
  },
  {
    id: "quarterly",
    label: "Trimestriel",
    amountCents: 2799,
    months: 3,
    interval: "3 mois",
    recommended: true,
    aiCredit: 2,
  },
  {
    id: "annual",
    label: "Annuel",
    amountCents: 6799,
    months: 12,
    interval: "an",
    recommended: false,
    aiCredit: 2,
  },
] as const;

const MONTHLY_CENTS = RAW_PLANS[0].amountCents;

export const PLANS = RAW_PLANS.map((plan) => {
  // What the same months cost on the monthly plan, for the savings shown
  // on the longer plans (all null for the monthly one).
  const fullCents = MONTHLY_CENTS * plan.months;
  const saved = fullCents - plan.amountCents;
  return {
    ...plan,
    price: euros(plan.amountCents),
    // "soit 9,33 €/mois" under multi-month plans.
    perMonth: plan.months > 1 ? euros(Math.round(plan.amountCents / plan.months)) : null,
    fullPrice: saved > 0 ? euros(fullCents) : null,
    savings: saved > 0 ? euros(saved) : null,
    discountPercent: saved > 0 ? Math.round((saved / fullCents) * 100) : null,
  };
});

export type PlanId = (typeof RAW_PLANS)[number]["id"];
