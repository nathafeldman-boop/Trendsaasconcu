// Client-safe display metadata only — no Stripe price IDs here. Those are
// server-only (see app/api/checkout/route.ts), read from env vars so
// switching between Stripe test/live mode never needs a code change.
export const PLANS = [
  {
    id: "weekly",
    label: "Hebdomadaire",
    price: "9,99 €",
    interval: "semaine",
    recommended: false,
  },
  {
    id: "monthly",
    label: "Mensuel",
    price: "16,99 €",
    interval: "mois",
    recommended: true,
  },
  {
    id: "annual",
    label: "Annuel",
    price: "60 €",
    interval: "an",
    recommended: false,
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];
