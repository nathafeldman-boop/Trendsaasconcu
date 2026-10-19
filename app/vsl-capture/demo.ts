import { ideaToText, type FoundIdea } from "@/lib/onboarding/found-idea";
import type { StripeMetrics } from "@/lib/stripe/metrics";
import { EMPTY_LAUNCH_STATE, type LaunchState } from "@/lib/launch/state";

// The demo member the VSLs follow: Camille, beauty, 3 000 €/month goal.
// Same idea as the onboarding library's beauty one, so every scene of the
// video tells the same story. Demo data only, shown as such in the player.

export const DEMO_USER_ID = "00000000-0000-4000-8000-00000000c0de";
export const DEMO_FIRST_NAME = "Camille";
export const DEMO_GOAL = 3000;

export const DEMO_IDEA: FoundIdea = {
  title: "RappelBeauté",
  pitch: "Moins de rendez-vous manqués et des clientes qui reviennent, sans y penser.",
  target: "Instituts de beauté, ongleries et barbiers indépendants",
  problem: "Les rendez-vous non honorés et les clientes qui ne reviennent pas font perdre du chiffre chaque semaine.",
  price_per_month: 39,
  mvp: [
    "Prise de rendez-vous en ligne avec acompte",
    "Rappel automatique la veille",
    "Relance des clientes absentes depuis 6 semaines",
    "Fiche cliente avec l'historique",
  ],
  why_you: "Tu as choisi la beauté et les pros : des commerces nombreux, faciles à contacter, et qui paient pour remplir leur agenda.",
  build_time: "2 à 3 semaines",
  first_customers: "Contacte les instituts de ton secteur sur Instagram et Google Maps, montre la démo sur ton téléphone et offre le premier mois.",
};

export const DEMO_IDEA_TEXT = ideaToText(DEMO_IDEA);

export const DEMO_PROMPT = `Tu es un développeur expert. Construis « RappelBeauté », une application web (Next.js, Supabase, Stripe) pour les instituts de beauté, ongleries et barbiers indépendants.

Le problème : les rendez-vous non honorés et les clientes qui ne reviennent pas font perdre du chiffre chaque semaine.

Fonctionnalités de la première version :
1. Prise de rendez-vous en ligne avec acompte (Stripe)
2. Rappel automatique par SMS ou e-mail la veille
3. Relance des clientes absentes depuis 6 semaines
4. Fiche cliente avec l'historique des visites

Abonnement : 39 € par mois, essai de 14 jours.
Interface en français, simple, pensée d'abord pour le téléphone.
Commence par la page d'accueil, puis l'inscription, puis l'agenda.`;

export const DEMO_LAUNCH: LaunchState = {
  ...EMPTY_LAUNCH_STATE,
  repo_full_name: "camille-dev/rappelbeaute",
  repo_url: "https://github.com/camille-dev/rappelbeaute",
  supabase_ref: "qhxkvbnrtwplmzcadyes",
  supabase_status: "ACTIVE_HEALTHY",
  supabase_url: "https://qhxkvbnrtwplmzcadyes.supabase.co",
  supabase_publishable_key: "sb_publishable_demo",
  supabase_schema_applied: true,
  site_url: "https://rappelbeaute.netlify.app",
  domain: "rappelbeaute.fr",
  domain_connected_at: "2026-10-12T09:00:00.000Z",
};

export const DEMO_METRICS: StripeMetrics = {
  connected: true,
  currency: "eur",
  mrr: 1170,
  activeSubscriptions: 30,
  trialing: 4,
  pastDue: 1,
  newLast30: 9,
  canceledLast30: 1,
  arpu: 39,
  prices: [{ amount: 39, currency: "eur", interval: "month", intervalCount: 1, subscriptions: 30 }],
};

export const DEMO_COACH = [
  { role: "user", content: "Comment je trouve mes 10 premiers instituts ?" },
  {
    role: "assistant",
    content: `Avec RappelBeauté à 39 € par mois, 10 instituts, c'est déjà **390 € qui tombent chaque mois**. Voilà le plan :

1. Liste 30 instituts de ta ville sur Google Maps, en priorité ceux qui prennent les rendez-vous par téléphone.
2. Envoie-leur un message court sur Instagram (prompt ci-dessous).
3. Propose 30 jours offerts contre un avis honnête.
4. Relance une seule fois, 3 jours plus tard.

\`\`\`
Écris un message Instagram de 4 lignes pour une gérante d'institut : je lui propose de tester gratuitement RappelBeauté, qui réduit les rendez-vous manqués. Ton chaleureux, sans forcer la vente.
\`\`\``,
  },
] as const;
