import type { LucideIcon } from "lucide-react";
import { Sprout, Zap, Briefcase, Compass } from "lucide-react";
import type { Brand } from "@/components/ui/brand-logo";
import type { IllustrationId } from "@/components/onboarding/illustrations";

// The onboarding funnel as data, in four acts: where you are, what you want,
// your account, then what's in your way — ending on the plans. The order
// follows the funnel that converts best in our market (account mid-way,
// once the person has invested in their answers; a personalised note after
// the answers that hurt; a projection before the pitch).
//
// Every note must describe something SaaSFounder actually delivers (idea,
// build prompt, launch checklist, content ideas, AI coach, Stripe MRR
// dashboard) — never videos made for them, a guarantee, or customer numbers
// we don't have.

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
        | "loading"
        | "projection"
        | "barrier"
        | "account"
        | "objective"
        | "journey"
        | "commitment"
        | "plans";
    });

/** Price used to turn a revenue goal into a number of customers. A division, not a promise. */
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
  "Calcul du temps que tu peux y mettre",
  "Choix du format d'idée le plus réaliste",
  "Estimation des clients nécessaires",
  "Préparation de ta projection",
];

export const JOURNEY = [
  { num: "01", title: "On trouve ton idée et on écrit ton prompt de build", body: "Une idée choisie pour ton profil, et le prompt à coller dans Claude, Replit ou Lovable." },
  { num: "02", title: "Tu lances ton site avec l'IA, checklist en main", body: "Une étape à la fois, avec de l'aide détaillée dès que tu bloques." },
  { num: "03", title: "On t'aide à trouver tes premiers clients", body: "Ton plan marketing, tes idées de contenu, et ton MRR Stripe suivi en direct." },
];

export const STEPS: Step[] = [
  // ───────── Acte 1 · Où tu en es
  {
    type: "single",
    id: "age",
    kicker: "Pour commencer",
    title: "Tu as quel âge ?",
    help: "On n'avance pas au même rythme à vingt et à cinquante ans. Ça change le temps devant toi, pas tes chances.",
    grid: true,
    options: [
      { id: "16-18", label: "16 – 18 ans", detail: "le temps joue pour toi", icon: Sprout },
      { id: "19-30", label: "19 – 30 ans", detail: "de l'énergie à revendre", icon: Zap },
      { id: "31-60", label: "31 – 60 ans", detail: "un vrai réseau, peu de temps", icon: Briefcase },
      { id: "60plus", label: "60 ans et plus", detail: "une expérience qui vaut de l'or", icon: Compass },
    ],
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
    type: "single",
    id: "currentIncome",
    condition: (a) => Boolean(a.experience) && a.experience !== "jamais",
    kicker: "Où tu en es",
    title: "Combien te rapporte ton activité en ligne par mois ?",
    help: "Ce que tu gagnes aujourd'hui, pas ce que tu vises. L'objectif viendra plus tard.",
    options: [
      { id: "rien", label: "Rien pour l'instant", detail: "pas encore de revenus en ligne", note: "Normal, et c'est précisément là qu'on intervient : passer de zéro à un premier paiement." },
      { id: "100-1000", label: "100 – 1 000 € par mois", detail: "les premiers euros rentrent", note: "Tu as prouvé que des gens paient. Il reste à rendre ça régulier." },
      { id: "1000-5000", label: "1 000 – 5 000 € par mois", detail: "c'est devenu un vrai revenu", note: "Belle base. L'enjeu maintenant : un système qui tourne sans toi à chaque étape." },
      { id: "10000plus", label: "Plus de 10 000 € par mois", detail: "l'activité tient toute seule", note: "À ce niveau, ce qui freine n'est plus le produit mais tout ce qu'il y a autour." },
    ],
  },
  {
    type: "single",
    id: "platforms",
    condition: (a) => Boolean(a.experience) && a.experience !== "jamais",
    kicker: "Ta présence",
    title: "Tu publies sur combien de plateformes ?",
    help: "Celles où tu postes vraiment, pas celles où tu as juste un compte.",
    options: [
      { id: "4plus", label: "4 et plus", detail: "je suis un peu partout" },
      { id: "2-3", label: "2 ou 3", detail: "une principale, une ou deux secondaires" },
      { id: "1", label: "1 seule", detail: "je concentre tout au même endroit" },
      { id: "aucune", label: "Aucune pour l'instant", detail: "je ne publie nulle part" },
    ],
  },
  {
    type: "single",
    id: "site",
    condition: (a) => Boolean(a.experience) && a.experience !== "jamais",
    kicker: "Ta vitrine",
    title: "As-tu déjà un SaaS en ligne ?",
    help: "Même une version minimale, même sans client.",
    options: [
      { id: "oui", label: "Oui", detail: "il tourne déjà quelque part" },
      { id: "non", label: "Pas encore", detail: "rien de publié pour le moment" },
    ],
  },
  {
    type: "url",
    id: "siteUrl",
    condition: (a) => a.site === "oui",
    kicker: "Ton site",
    title: "Donne-nous son adresse.",
    help: "On la garde dans ton dossier : elle sert à l'analyse détaillée dans ton espace.",
    placeholder: "monsaas.fr",
  },
  { type: "analysis", id: "analysis", condition: (a) => a.site === "oui" },

  // ───────── Acte 2 · Ce que tu vises
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
    title: "Combien tu veux gagner par mois avec ton SaaS ?",
    help: "Glisse le curseur. Plus tu vas à droite, plus l'objectif est ambitieux, et plus le chemin change.",
    min: 1000,
    max: 50000,
    stepBy: 500,
    initial: 3000,
  },
  { type: "loading", id: "loading" },
  { type: "projection", id: "projection" },
  {
    type: "barrier",
    id: "barrier",
    condition: (a) => a.site !== "oui" || a.currentIncome === "rien" || a.experience === "jamais",
  },
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
    id: "ideas",
    illustration: "bulb",
    kicker: "L'idée",
    title: "Trouve l'idée qui a déjà des clients.",
    sub: "On part de problèmes pour lesquels des gens paient déjà, et on garde l'idée qui colle à ton temps, ton budget et tes forces.",
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

  // ───────── Acte 3 · Ton compte (once the answers are worth keeping)
  { type: "account", id: "account" },

  // ───────── Acte 4 · Ce qui te freine, et le plan
  {
    type: "single",
    id: "payments",
    kicker: "Tes paiements",
    title: "Sur quoi tu veux recevoir tes paiements ?",
    help: "Rien n'est définitif : on prépare ton produit pour l'outil que tu choisis.",
    options: [
      { id: "stripe", label: "Stripe", detail: "cartes, abonnements, le standard des SaaS", brand: "stripe" },
      { id: "paypal", label: "PayPal", detail: "le plus connu des acheteurs", brand: "paypal" },
      { id: "revolut", label: "Revolut", detail: "encaissement rapide, frais bas", brand: "revolut" },
      { id: "nsp", label: "Je ne sais pas encore", detail: "on te conseillera" },
    ],
  },
  {
    type: "multi",
    id: "frustrations",
    kicker: "Ce qui pique",
    title: "Qu'est-ce qui t'énerve le plus dans ta situation ?",
    help: "Plusieurs réponses possibles. Coche ce qui te traverse vraiment l'esprit le dimanche soir.",
    free: { placeholder: "Ex : je n'apprends plus rien…" },
    options: [
      { id: "plafond", label: "Mes revenus sont plafonnés", detail: "travailler plus ne me fera pas gagner beaucoup plus", note: "Un abonnement casse ce plafond : chaque client continue de payer le mois suivant, que tu travailles ou non ce jour-là." },
      { id: "temps", label: "Je n'ai plus de temps à moi", detail: "mes journées ne m'appartiennent pas", note: "C'est pris en compte : ton plan tient en tâches courtes, et l'IA fait le plus long à ta place." },
      { id: "comparaison", label: "Je vois d'autres réussir", detail: "et ils ne sont pas plus doués que moi", note: "Ils ne le sont pas. Ce qu'ils avaient, c'est une méthode, et c'est ce qu'on te donne." },
      { id: "train", label: "J'ai peur de rater le coche", detail: "l'IA rebat les cartes et je regarde", note: "Tu es au bon endroit au bon moment : ton idée et ton prompt sortent aujourd'hui, pas dans six mois." },
    ],
  },
  {
    type: "single",
    id: "blocker",
    kicker: "Le vrai blocage",
    title: "Qu'est-ce qui t'a arrêté jusqu'ici ?",
    help: "On construit ton plan autour de ton point faible, pas l'inverse.",
    free: { placeholder: "Ex : je n'ose pas en parler autour de moi…" },
    options: [
      { id: "idea", label: "Trouver la bonne idée", detail: "j'en ai cinquante, aucune ne me convainc" },
      { id: "build", label: "Construire le produit", detail: "je bloque devant la page blanche" },
      { id: "sell", label: "Trouver des clients", detail: "je sais faire, je ne sais pas vendre" },
      { id: "finish", label: "Aller au bout", detail: "je démarre fort, puis j'abandonne" },
    ],
  },
  {
    type: "multi",
    id: "refusals",
    kicker: "Tes limites",
    title: "Qu'est-ce que tu refuses de faire, même pour de l'argent ?",
    help: "Réponds franchement : on écartera ce qui l'exige. Un business bâti sur ce qu'on déteste ne tient pas six mois.",
    free: { placeholder: "Ex : gérer de la comptabilité, encadrer des gens…" },
    options: [
      { id: "appels", label: "Passer des appels de vente", detail: "démarcher, relancer au téléphone", note: "Pas besoin : un SaaS se vend depuis son site. La personne arrive, comprend et paie, sans un seul appel." },
      { id: "video", label: "Me montrer en vidéo", detail: "visage à l'écran, face caméra", note: "Pas besoin non plus : écran filmé, carrousels, texte. Ton plan marketing ne te demandera jamais de te montrer." },
      { id: "rien", label: "Rien, je suis prêt à tout", detail: "si ça marche, je le fais" },
    ],
  },
  {
    type: "single",
    id: "todayGoal",
    kicker: "Ton objectif",
    title: "Qu'est-ce que tu attends en priorité ?",
    help: "Une seule chose à la fois. C'est comme ça qu'on avance vite.",
    options: [
      { id: "ventes", label: "Faire mes premières ventes", note: "C'est réaliste avec la bonne méthode, et c'est exactement celle qu'on te donne." },
      { id: "idee", label: "Trouver mon idée de SaaS" },
      { id: "produit", label: "Mettre mon premier SaaS en ligne" },
    ],
  },
  {
    type: "single",
    id: "lifeGoal",
    kicker: "La vie derrière l'argent",
    title: "Et au fond, tu cherches quoi ?",
    help: "L'argent est un moyen. Dis-nous la fin, on choisira un produit qui va avec.",
    free: { placeholder: "Ex : pouvoir m'occuper de mes parents…" },
    options: [
      { id: "auto", label: "Un business qui tourne tout seul", detail: "des revenus qui ne dépendent pas de mes heures", note: "C'est le principe d'un SaaS : une fois en ligne, il vend et livre sans toi à chaque étape." },
      { id: "quitter", label: "Quitter ma situation actuelle", detail: "vite, mais proprement", note: "On visera le chemin le plus court vers un revenu qui remplace le tien : peu de clients, qui paient bien." },
      { id: "liberte", label: "Une liberté totale", detail: "travailler d'où je veux, quand je veux", note: "Ton produit se vendra par écrit et s'utilisera seul : rien ne t'obligera à être quelque part à heure fixe." },
      { id: "prouver", label: "Me prouver que j'en suis capable", detail: "une première victoire, et on verra", note: "On va droit au but : le premier euro payé par un inconnu. C'est la seule preuve qui compte." },
    ],
  },
  {
    type: "single",
    id: "deadline",
    kicker: "Ton horloge",
    title: "D'ici quand ça doit marcher ?",
    help: "Une date change tout : elle décide de la taille du produit qu'on peut viser.",
    options: [
      { id: "asap", label: "Le plus vite possible" },
      { id: "2sem", label: "D'ici 2 semaines" },
      { id: "1mois", label: "D'ici 1 mois" },
      { id: "3mois", label: "D'ici 3 mois" },
    ],
  },
  {
    type: "single",
    id: "market",
    kicker: "Tes futurs clients",
    title: "Tu préfères vendre à qui ?",
    help: "Il n'y a pas de bonne réponse dans l'absolu. Il y a celle où tu tiendras six mois.",
    notesVisible: true,
    options: [
      { id: "b2b", label: "Des professionnels", detail: "commerces, agences, PME", note: "Peu de clients qui paient bien : un pro paie volontiers pour gagner du temps. Quelques dizaines suffisent." },
      { id: "b2c", label: "Des particuliers", detail: "gros volume, petits prix", note: "Des petits paiements en grand nombre : il en faut beaucoup, et c'est ton contenu qui les amène." },
    ],
  },
  {
    type: "text",
    id: "phrase",
    kicker: "Tes mots",
    title: "Décris en une phrase où tu veux être dans un an.",
    help: "Sois concret : un chiffre, un lieu, un rythme de vie. Cette phrase deviendra ton cap.",
    placeholder: "Ex : 2 000 € par mois qui tombent sans que je sois devant l'écran, pour ne plus dépendre de mon employeur.",
    optional: true,
  },
  { type: "objective", id: "objective" },
  { type: "journey", id: "journey" },
  {
    type: "message",
    id: "method",
    illustration: "target",
    kicker: "Ce qui te sépare de tout ça",
    title: "La seule chose qui te retient, c'est une méthode claire.",
    sub: "Pas plus de motivation, pas plus de temps, pas plus de talent. Une méthode, et quelqu'un pour te guider.",
    cta: "Continuer",
  },
  { type: "commitment", id: "commitment" },
  { type: "plans", id: "plans" },
];

export function getSequence(answers: Answers) {
  return STEPS.filter((step) => !step.condition || step.condition(answers));
}

export function revenueTier(goal: number) {
  return REVENUE_TIERS.find((tier) => goal <= tier.upTo) ?? REVENUE_TIERS[REVENUE_TIERS.length - 1];
}

/** Scenario ranges per revenue source, from the goal and the lever answers. */
export function projection(answers: Answers) {
  const goal = Number(answers.revenueGoal ?? 3000);
  const hours = answers.hours;
  const pace = hours === "high" ? 1.15 : hours === "low" ? 0.7 : 0.9;
  const sources = [{ label: "Ton produit seul", low: 0.25 * goal * pace, high: 0.5 * goal * pace }];
  for (const lever of LEVERS) {
    if (answers[`lever_${lever.id}`] === "oui") {
      sources.push({ label: lever.label, low: lever.share[0] * goal * pace, high: lever.share[1] * goal * pace });
    }
  }
  const round = (n: number) => Math.round(n / 50) * 50;
  const low = round(sources.reduce((n, s) => n + s.low, 0));
  const high = round(sources.reduce((n, s) => n + s.high, 0));
  return {
    sources: sources.map((s) => ({ ...s, low: round(s.low), high: round(s.high) })),
    low,
    high,
    customers: Math.ceil(high / REFERENCE_PRICE),
    goal,
  };
}
