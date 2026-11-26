import type { LucideIcon } from "lucide-react";
import {
  Landmark,
} from "lucide-react";
import type { Brand } from "@/components/ui/brand-logo";
import type { IllustrationId } from "@/components/onboarding/illustrations";
import { readFoundIdea } from "@/lib/onboarding/found-idea";

// The onboarding funnel as data, in four acts: simple questions about them
// and what they like, the idea found for them and validated (they try the
// product before signing up), their account, then their business: revenue
// goal, how they get paid, their first sale, two yes/no choices, their
// potential, the phone, the generation of their business — and the plans.
// The order follows the funnels that convert best in our market.
//
// Every note must describe something SaaSFounder actually delivers (idea,
// build prompt, launch autopilot, launch checklist, content ideas, AI coach,
// Stripe MRR dashboard, the 48-hour guarantee on /remboursement) — never
// videos made for them or customer numbers we don't have.

export type Answers = Record<string, string | string[] | number | undefined>;

export type Option = {
  id: string;
  label: string;
  detail?: string;
  /** Shown once picked (or always, with `notesVisible`); the step then waits for "Continuer". */
  note?: string;
  icon?: LucideIcon;
  brand?: Brand;
};

type Base = { id: string; condition?: (a: Answers) => boolean };
type Asked = Base & { kicker: string; title: string; help?: string };

export type Step =
  | (Asked & {
      type: "single";
      options: Option[];
      free?: { placeholder: string };
      notesVisible?: boolean;
      afterChoice?: string;
      grid?: boolean;
    })
  | (Asked & { type: "multi"; options: Option[]; free?: { placeholder: string } })
  | (Asked & { type: "scale" })
  | (Asked & { type: "slider"; min: number; max: number; stepBy: number; initial: number })
  | (Asked & { type: "text"; placeholder: string; optional?: boolean })
  | (Asked & { type: "url"; placeholder: string })
  | (Base & {
      type: "message";
      kicker: string;
      title: string;
      sub?: string;
      cta: string;
      illustration?: IllustrationId;
    })
  | (Base & {
      type:
        | "saas101"
        | "analysis"
        | "projection"
        | "diagnosis"
        | "loading"
        | "idea"
        | "account"
        | "potential"
        | "phone"
        | "build"
        | "commit"
        | "plans";
    });

/**
 * Price used to turn a revenue goal into a number of customers, until the
 * onboarding has found their idea (then its price is used). A division,
 * not a promise.
 */
export const REFERENCE_PRICE = 49;

export const REVENUE_TIERS = [
  {
    upTo: 2500,
    word: "Réaliste",
    note: "C'est le palier qu'un premier SaaS atteint le plus souvent. Rien de spectaculaire, et c'est pour ça qu'il est atteignable.",
  },
  {
    upTo: 6000,
    word: "Accessible",
    note: "Faisable en vendant à des pros, à condition de facturer assez pour ne pas avoir besoin de centaines de clients.",
  },
  {
    upTo: 15000,
    word: "Ambitieux",
    note: "Ici, le prix compte plus que le volume : peu de clients qui paient cher, donc un problème qui leur coûte cher.",
  },
  {
    upTo: Infinity,
    word: "Très ambitieux",
    note: "Au-delà d'un produit lancé seul le soir : il faudra de l'acquisition payante ou une équipe. On te montrera les idées qui tiennent ce palier.",
  },
];

/** Questions that pop up over the loading ring; each "oui" adds a revenue source to the projection. */
export const LEVERS = [
  {
    id: "contenu",
    question: "Prêt à publier une vidéo courte par jour ?",
    detail: "TikTok, Reels ou Shorts : ton écran filmé suffit, pas besoin de montrer ton visage.",
    label: "Contenu court",
    share: [0.2, 0.45] as const,
  },
  {
    id: "prospection",
    question: "Prêt à contacter 10 prospects par jour ?",
    detail: "Des messages courts et personnalisés, sans jamais forcer la vente.",
    label: "Prospection directe",
    share: [0.15, 0.35] as const,
  },
];

export const LOADING_STEPS = [
  "Lecture de tes réponses",
  "Repérage de ta niche",
  "Calcul de tes leviers d'acquisition",
  "Assemblage de ta projection",
];

/** "Ce qui te bloque", from their answer to the brake question. */
export const DIAGNOSIS: Record<string, { strong: string; soft: string }> = {
  methode: { strong: "Il te manque la méthode", soft: "et un plan clé en main." },
  concentration: { strong: "Il te manque un plan découpé", soft: "en petites tâches, une à la fois." },
  essaie: { strong: "Ton effort n'est pas au bon endroit,", soft: "il n'est pas insuffisant." },
  debut: { strong: "Il te manque juste le bon départ", soft: "et un chemin clair." },
};
export const DEFAULT_DIAGNOSIS = { strong: "Il te manque un plan clair", soft: "et les bons outils." };

export const STEPS: Step[] = [
  // ───────── Avant le compte (sur le modèle du questionnaire TrendSaaS) : le rêve,
  // le parcours, ce qui bloque, l'objectif, la projection, puis le compte pour
  // débloquer les résultats.
  {
    type: "single",
    id: "dream",
    kicker: "Ce qui te fait avancer",
    title: "Quel est ton rêve ultime ?",
    help: "Celui auquel tu penses vraiment, pas celui qui sonne sérieux.",
    free: { placeholder: "Ex : offrir une maison à ma mère, vivre au soleil…" },
    options: [
      { id: "mille", label: "Faire mes premiers 1 000 €", detail: "la preuve que ça marche" },
      { id: "liberte", label: "Être libre financièrement", detail: "ne plus dépendre d'un salaire" },
      { id: "parents", label: "Rendre mes proches fiers", detail: "leur montrer que le pari valait le coup" },
      { id: "quitter", label: "Quitter mon travail", detail: "partir sans peur du mois suivant" },
      { id: "etudes", label: "Vivre de mon projet", detail: "plutôt que d'un diplôme ou d'un patron" },
    ],
  },
  {
    type: "message",
    id: "proof",
    illustration: "rocket",
    kicker: "Tu n'es pas seul",
    title: "Créer son SaaS n'a jamais été aussi accessible.",
    sub: "Avec l'IA, plus besoin de savoir coder ni d'avoir une équipe : tu décris ton idée, l'IA construit ton site, et on t'aide à trouver tes premiers clients.",
    cta: "Continuer",
  },
  {
    type: "single",
    id: "experience",
    kicker: "Ton parcours",
    title: "Depuis combien de temps tu fais du SaaS ?",
    help: "Aucune réponse ne te disqualifie. Chacune appelle juste une méthode différente.",
    options: [
      {
        id: "jamais",
        label: "Je n'en ai jamais fait",
        detail: "je pars d'une page blanche",
        note: "Tu arrives au bon moment : avec l'IA, il n'a jamais été aussi simple de construire un premier SaaS sans savoir coder.",
      },
      {
        id: "moins1an",
        label: "Depuis moins d'un an",
        detail: "je m'y suis mis récemment",
        note: "Tu as déjà pris le rythme. C'est maintenant qu'une méthode claire fait la différence.",
      },
      {
        id: "1a3ans",
        label: "Entre 1 et 3 ans",
        detail: "j'ai déjà quelques essais derrière moi",
        note: "Tu as posé les bases. Ce qui manque n'est plus la motivation, c'est la méthode.",
      },
    ],
  },
  { type: "saas101", id: "saas101", condition: (a) => a.experience === "jamais" },
  {
    type: "message",
    id: "almost",
    illustration: "target",
    kicker: "On y est presque",
    title: "Encore quelques questions courtes.",
    sub: "Pour finaliser ton plan, aide-nous à mieux comprendre ton projet.",
    cta: "Continuer",
  },
  {
    type: "single",
    id: "brake",
    kicker: "Ce qui bloque",
    title: "Qu'est-ce qui t'empêche d'y arriver ?",
    help: "La réponse honnête, pas la plus flatteuse. C'est elle qui décide de la forme de ton plan.",
    free: { placeholder: "Ex : personne autour de moi ne fait ça…" },
    options: [
      { id: "methode", label: "Le manque de méthode", detail: "je ne sais pas dans quel ordre faire", note: "C'est exactement ce qu'on te donne : un ordre clair, étape par étape. La méthode s'apprend en quelques jours." },
      { id: "concentration", label: "J'ai du mal à me concentrer", detail: "je pars dans tous les sens", note: "Alors ton plan sera découpé en tâches courtes, une seule à la fois. C'est ce qui marche quand on s'éparpille." },
      { id: "essaie", label: "J'essaie, mais rien ne marche", detail: "je travaille sans résultat", note: "Ce n'est pas l'effort qui manque, c'est l'endroit où le mettre. On va le placer au bon endroit." },
      { id: "debut", label: "Je commence tout juste", detail: "je viens de m'y mettre", note: "Parfait : tu n'as aucune mauvaise habitude à désapprendre." },
    ],
  },
  {
    type: "scale",
    id: "persistence",
    kicker: "Ton tempérament",
    title: "Je suis du genre à persévérer même quand c'est dur.",
    help: "Personne ne te juge. Ta réponse règle simplement la longueur des étapes qu'on te donnera.",
  },
  {
    type: "single",
    id: "hours",
    kicker: "Ton carburant",
    title: "Tu peux y consacrer combien d'heures par semaine ?",
    help: "Sois honnête : un SaaS se construit avec de la régularité, pas avec trois nuits blanches.",
    afterChoice:
      "Un quart d'heure ou plusieurs heures, ce n'est pas la quantité qui décide, c'est ce que tu en fais. Et c'est là-dessus qu'on t'aide.",
    options: [
      { id: "low", label: "Moins de 5 h", detail: "le soir, quand tout est calme" },
      { id: "mid", label: "5 à 15 h", detail: "un vrai projet à côté" },
      { id: "high", label: "Plus de 15 h", detail: "c'est mon projet principal" },
    ],
  },
  {
    type: "slider",
    id: "revenueGoal",
    kicker: "Ton objectif",
    title: "Combien tu veux gagner par mois d'ici 3 mois ?",
    help: "Glisse le curseur. Plus tu vas à droite, plus l'objectif est ambitieux, et plus le chemin change.",
    min: 1000,
    max: 50000,
    stepBy: 500,
    initial: 3000,
  },
  { type: "loading", id: "loading" },
  { type: "projection", id: "projection" },
  { type: "diagnosis", id: "diagnosis" },
  {
    type: "message",
    id: "welcome",
    illustration: "star",
    kicker: "Bienvenue",
    title: "Bienvenue dans SaaSFounder.",
    sub: "Notre but : que tu crées ton SaaS et que tu encaisses dès maintenant. Ton idée, le prompt exact pour la construire avec l'IA et le plan pour trouver tes premiers clients, au même endroit.",
    cta: "Suivant",
  },
  {
    type: "message",
    id: "ideaIntro",
    illustration: "bulb",
    kicker: "L'idée",
    title: "On trouve l'idée faite pour toi.",
    sub: "On part de problèmes que des gens paient déjà pour régler, et on garde celui qui colle à ton temps et à ton objectif.",
    cta: "Suivant",
  },
  {
    type: "message",
    id: "ai",
    illustration: "phone",
    kicker: "Le prompt",
    title: "L'IA écrit le code. Toi, tu pilotes.",
    sub: "Pas besoin de savoir coder : ton prompt de build décrit tout, et ton coach IA t'aide dès que tu bloques, même sur une capture d'écran.",
    cta: "Suivant",
  },
  {
    type: "message",
    id: "life",
    illustration: "podium",
    kicker: "L'objectif",
    title: "Change de vie, une étape à la fois.",
    sub: "Un SaaS qui tourne, ce sont des revenus qui ne dépendent plus de tes heures. Il est temps de t'y mettre.",
    cta: "Continuer",
  },
  // ───────── Le compte : il débloque les résultats.
  { type: "account", id: "account" },
  // ───────── Après le compte : l'idée (cherchée pendant le calcul), puis le business, le potentiel, la génération, les formules.
  { type: "idea", id: "idea" },
  {
    type: "single",
    id: "payments",
    kicker: "Tes paiements",
    title: "Sur quoi tu veux recevoir tes paiements ?",
    help: "Rien n'est définitif : on prépare ton produit pour ce que tu choisis.",
    options: [
      { id: "stripe", label: "Stripe", detail: "cartes, abonnements, le standard des SaaS", brand: "stripe" },
      { id: "paypal", label: "PayPal", detail: "le plus connu des acheteurs", brand: "paypal" },
      { id: "revolut", label: "Revolut", detail: "encaissement rapide, frais bas", brand: "revolut" },
      { id: "banque", label: "Mon compte bancaire", detail: "les paiements arrivent par virement", icon: Landmark },
    ],
  },
  {
    type: "single",
    id: "deadline",
    kicker: "Ta première vente",
    title: "Quand veux-tu faire ta première vente ?",
    help: "Une date change tout : elle décide de la taille du produit qu'on vise et de ton rythme.",
    options: [
      { id: "aujourdhui", label: "Aujourd'hui" },
      { id: "semaine", label: "Cette semaine" },
      { id: "mois", label: "Dans le mois" },
      { id: "3mois", label: "D'ici 3 mois" },
    ],
  },
  {
    type: "single",
    id: "autoClients",
    kicker: "Tes clients",
    title: "Tu veux qu'on t'amène des clients automatiquement ?",
    options: [
      {
        id: "oui",
        label: "Oui",
        detail: "je veux des clients sans courir après",
        note: "Noté : ton plan marketing et tes scripts vidéo seront taillés pour faire venir des clients chaque semaine, sans démarchage.",
      },
      { id: "non", label: "Non", detail: "je préfère m'en charger", note: "D'accord : tu gardes la main, et ton plan te dit quoi faire chaque jour pour trouver tes clients." },
    ],
  },
  {
    type: "single",
    id: "doneForYou",
    kicker: "Ton business",
    title: "Tu veux qu'on crée ton business à ta place ?",
    options: [
      {
        id: "oui",
        label: "Oui",
        detail: "je veux que ce soit fait pour moi",
        note: "Noté : le Pilote auto crée ton dépôt, ta base de données et branche ton domaine pour toi. Toi, tu colles le prompt et tu valides.",
      },
      { id: "non", label: "Non", detail: "je veux le construire moi-même", note: "D'accord : tu construis avec le prompt, étape par étape, et l'IA t'explique tout." },
    ],
  },
  { type: "potential", id: "potential" },
  { type: "phone", id: "phone" },
  { type: "build", id: "build" },
  { type: "commit", id: "commit" },
  { type: "plans", id: "plans" },
];

export function getSequence(answers: Answers) {
  return STEPS.filter((step) => !step.condition || step.condition(answers));
}

export function revenueTier(goal: number) {
  return REVENUE_TIERS.find((tier) => goal <= tier.upTo) ?? REVENUE_TIERS[REVENUE_TIERS.length - 1];
}

/**
 * The potential shown once their business is described: always above their
 * goal (5 000 € → 13 000 €, 50 000 € → 56 000 €), with the customers it
 * takes at their idea's price. A scenario, and labelled so on screen.
 */
export function potential(answers: Answers) {
  const goal = Number(answers.revenueGoal) || 3000;
  const extra = Math.min(9000, Math.max(4000, 8000 - ((goal - 5000) * 2000) / 45000));
  const amount = Math.max(goal + 1000, Math.ceil(Math.min(goal + extra, goal * 2.6) / 1000) * 1000);
  const idea = readFoundIdea(answers);
  const price = idea?.price_per_month ?? REFERENCE_PRICE;
  return { goal, amount, price, customers: Math.ceil(amount / price), ideaTitle: idea?.title ?? null };
}
