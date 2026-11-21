// Client-safe plan metadata only — no Stripe price IDs here (those are in
// lib/stripe/prices.ts, server-only).
//
// `amountCents` / `billing` are also what checkout checks the Stripe price
// against, so the amount shown is always the amount actually charged.
// `aiCredit` multiplies the monthly AI budget (lib/claude/guard.ts).
//
// Three plans on the pricing page, at their welcome price for OFFER_MINUTES
// after a visitor first sees it, then at the standard price. The deadline
// is enforced by checkout (profiles.offer_expires_at), so the countdown is
// real, and a subscription started at the welcome price keeps it at every
// renewal. Two offers live outside the cards: the lifetime plan for less to
// someone about to leave the page, and a weekly plan to someone back from
// an unfinished payment.
export function euros(cents: number) {
  return `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: cents % 100 === 0 ? 0 : 2 })} €`;
}

export type PlanId = "monthly" | "quarterly" | "lifetime" | "weekly";
export type PriceTier = "launch" | "standard" | "exit";
export type Billing = { mode: "subscription"; interval: "week" | "month"; count: number } | { mode: "payment" };

type PlanDef = {
  id: PlanId;
  label: string;
  launchCents: number;
  standardCents: number;
  billing: Billing;
  /** After the price: "/ mois", "une fois"... */
  period: string;
  /** Days a payment covers, for the price per day; null for a one-time payment. */
  days: number | null;
  recommended: boolean;
  aiCredit: number;
  /** One line under the plan's name. */
  summary: string;
};

const DEFS: Record<PlanId, PlanDef> = {
  monthly: {
    id: "monthly",
    label: "1 mois",
    launchCents: 2500,
    standardCents: 5000,
    billing: { mode: "subscription", interval: "month", count: 1 },
    period: "/ mois",
    days: 30,
    recommended: false,
    aiCredit: 1,
    summary: "Ton idée + le prompt qui écrit ton site + ton plan de 30 jours",
  },
  quarterly: {
    id: "quarterly",
    label: "3 mois",
    launchCents: 4000,
    standardCents: 10000,
    billing: { mode: "subscription", interval: "month", count: 3 },
    period: "/ 3 mois",
    days: 91,
    recommended: true,
    aiCredit: 2,
    summary: "Ton idée + ton site + ton plan de 30 jours + ton plan marketing et tes scripts vidéo",
  },
  lifetime: {
    id: "lifetime",
    label: "À vie",
    launchCents: 15000,
    standardCents: 50000,
    billing: { mode: "payment" },
    period: "une fois",
    days: null,
    recommended: false,
    aiCredit: 4,
    summary: "Tout, pour toujours : idée + site + plans + scripts vidéo + coach IA + accompagnement",
  },
  weekly: {
    id: "weekly",
    label: "1 semaine",
    launchCents: 499,
    standardCents: 499,
    billing: { mode: "subscription", interval: "week", count: 1 },
    period: "/ semaine",
    days: 7,
    recommended: false,
    aiCredit: 0.5,
    summary: "Ton idée + le prompt qui écrit ton site",
  },
};

export const OFFER_MINUTES = 10;
export const OFFER_MS = OFFER_MINUTES * 60_000;

/** What the lifetime plan costs in the offer shown before leaving the page. */
export const EXIT_OFFER_CENTS = 10000;

export const CARD_PLAN_IDS = ["monthly", "quarterly", "lifetime"] as const;
export const DEFAULT_PLAN: PlanId = "quarterly";

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in DEFS;
}

export function planFor(id: PlanId, tier: PriceTier = "launch") {
  const def = DEFS[id];
  const amountCents =
    tier === "exit" && id === "lifetime" ? EXIT_OFFER_CENTS : tier === "standard" ? def.standardCents : def.launchCents;
  return {
    ...def,
    // The weekly plan has a single price, whatever the countdown says.
    tier: id === "weekly" ? ("launch" as const) : tier,
    amountCents,
    price: euros(amountCents),
    /** "0,83 € / jour", or null for a one-time payment. */
    perDay: def.days ? euros(Math.floor(amountCents / def.days)) : null,
    /** What it goes up to once the countdown ends (null when it doesn't). */
    nextPrice: tier === "launch" && def.standardCents !== def.launchCents ? euros(def.standardCents) : null,
  };
}

export type Plan = ReturnType<typeof planFor>;

export const PLAN_TIERS = {
  launch: CARD_PLAN_IDS.map((id) => planFor(id, "launch")),
  standard: CARD_PLAN_IDS.map((id) => planFor(id, "standard")),
};

// What each plan unlocks in the member area, and the list the pricing page
// shows. A null plan (access code, admin) gets everything.
export type Feature = "idea" | "prompt" | "ideas" | "launch" | "plan30" | "revenue" | "marketing" | "coach" | "support";

const FEATURES: Record<PlanId, Feature[]> = {
  weekly: ["idea", "prompt"],
  monthly: ["idea", "prompt", "ideas", "launch", "plan30", "revenue"],
  quarterly: ["idea", "prompt", "ideas", "launch", "plan30", "revenue", "marketing"],
  lifetime: ["idea", "prompt", "ideas", "launch", "plan30", "revenue", "marketing", "coach", "support"],
};

export function hasFeature(plan: string | null | undefined, feature: Feature) {
  if (!plan || !isPlanId(plan)) return true;
  return FEATURES[plan].includes(feature);
}

/** The cheapest card plan that includes a feature, for the upgrade button. */
export function planWith(feature: Feature): PlanId {
  return CARD_PLAN_IDS.find((id) => FEATURES[id].includes(feature)) ?? "lifetime";
}

export const UNLOCKS: { label: string; feature: Feature }[] = [
  { label: "Une idée de SaaS taillée pour toi", feature: "idea" },
  { label: "Ton site écrit de A à Z (le prompt à coller dans Claude)", feature: "prompt" },
  { label: "Des idées sur une niche que tu choisis", feature: "ideas" },
  { label: "Ton site mis en ligne pour toi (GitHub, Supabase, domaine)", feature: "launch" },
  { label: "Ton plan de lancement, étape par étape", feature: "plan30" },
  { label: "Ton tableau de bord de revenus (Stripe)", feature: "revenue" },
  { label: "Ton plan marketing et tes scripts vidéo", feature: "marketing" },
  { label: "Un coach IA expert des SaaS, qui connaît ton projet", feature: "coach" },
  { label: "Un accompagnement personnalisé", feature: "support" },
];

/** "Toutes les formules", "3 mois et à vie", "À vie". */
export function availability(feature: Feature) {
  const ids = CARD_PLAN_IDS.filter((id) => FEATURES[id].includes(feature));
  if (ids.length === CARD_PLAN_IDS.length) return "Toutes les formules";
  if (ids.length === 1) return DEFS[ids[0]].label;
  return `${ids.slice(0, -1).map((id) => DEFS[id].label).join(", ")} et ${DEFS[ids[ids.length - 1]].label.toLowerCase()}`;
}
