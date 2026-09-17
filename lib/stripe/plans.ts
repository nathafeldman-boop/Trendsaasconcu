export const PLANS = [
  {
    id: "weekly",
    label: "Hebdomadaire",
    price: "9,99 €",
    interval: "semaine",
    priceId: "price_1UGlKLRd6r34OMU60kyhAwLb",
    recommended: false,
  },
  {
    id: "monthly",
    label: "Mensuel",
    price: "16,99 €",
    interval: "mois",
    priceId: "price_1UGlIkRd6r34OMU6NG4M3tTK",
    recommended: true,
  },
  {
    id: "annual",
    label: "Annuel",
    price: "60 €",
    interval: "an",
    priceId: "price_1UGlLHRd6r34OMU6mnaBytQZ",
    recommended: false,
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];
