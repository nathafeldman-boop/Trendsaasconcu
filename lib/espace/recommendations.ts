import type { StripeMetrics } from "@/lib/stripe/metrics";
import { CHECKLIST_HELP, CHECKLIST_ITEMS, CODE_TOOLS, DATA_OPTIONS, HOSTS, PAYMENT_GUIDE } from "@/lib/espace/content";

// The « que faire maintenant » cards shown at the top of each tab. Pure rules
// on data we already have (progress, real Stripe numbers, marketing state):
// instant, free, and never made up. The coach takes over when someone wants
// to go further on one of them.

export type Impact = "fort" | "moyen" | "bonus";

export type Recommendation = {
  id: string;
  impact: Impact;
  title: string;
  summary: string;
  why: string;
  steps: string[];
  prompts?: { label: string; text: string }[];
  /** Pre-filled in the coach when the person wants to dig deeper. */
  coachQuestion: string;
  /** "#section" scrolls within the tab, "/espace/..." changes tab, https opens a new tab. */
  link?: { label: string; href: string };
};

const IMPACT_ORDER: Record<Impact, number> = { fort: 0, moyen: 1, bonus: 2 };
const MAX_PER_TAB = 4;

function rank(recs: Recommendation[]) {
  return [...recs].sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]).slice(0, MAX_PER_TAB);
}

export function money(amount: number, currency: string) {
  const digits = Number.isInteger(amount) ? 0 : 2;
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function shortIdea(idea: string) {
  const firstLine = idea.split("\n")[0].trim();
  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}...` : firstLine;
}

// ───────────────────────── Création de SaaS

export type CreationState = {
  idea: string;
  tool: string | null;
  checklist: Record<string, boolean>;
  mvpLaunched: boolean;
  hasExistingSaas: boolean;
  /** The Pilote auto tab has created their repository or database. */
  autopilotStarted: boolean;
};

const supabase = DATA_OPTIONS.find((d) => d.id === "supabase")!;
const vercel = HOSTS.find((h) => h.id === "vercel")!;

const CHECKLIST_RECS: Record<string, Omit<Recommendation, "id" | "impact">> = {
  auth: {
    title: "Branche les comptes utilisateurs avec Supabase",
    summary: "Inscription, connexion et base de données, en une seule étape.",
    why: "Sans comptes, impossible de savoir qui a payé ni de garder les données de tes clients. Supabase gère les deux et reste gratuit pour démarrer.",
    steps: [...supabase.steps.slice(0, 4), CHECKLIST_HELP.auth[0]],
    prompts: [{ label: "Prompt Supabase", text: supabase.prompt }],
    coachQuestion: "Je dois brancher Supabase (comptes + base de données) à mon SaaS. Guide-moi pas à pas.",
    link: { label: "Voir l'étape Données", href: "#donnees" },
  },
  payment: {
    title: "Ajoute le paiement par abonnement avec Stripe",
    summary: "Le bouton qui transforme un visiteur en client.",
    why: "Tant qu'on ne peut pas payer, tu ne sais pas si ton idée vaut quelque chose. En mode test, Stripe se branche en une après-midi, sans risque.",
    steps: PAYMENT_GUIDE.steps,
    prompts: [{ label: "Prompt Stripe", text: PAYMENT_GUIDE.prompt }],
    coachQuestion: "Je dois ajouter Stripe à mon SaaS (abonnement mensuel). Guide-moi pas à pas.",
    link: { label: "Voir l'étape Paiements", href: "#paiements" },
  },
  deploy: {
    title: "Mets ton site en ligne sur Vercel",
    summary: "Une vraie adresse à partager, mise à jour à chaque modification.",
    why: "Tant que ton site tourne seulement sur ton ordinateur ou dans l'éditeur, personne ne peut s'inscrire ni payer. Vercel le met en ligne gratuitement depuis GitHub.",
    steps: vercel.steps,
    prompts: [{ label: "Prompt mise en ligne", text: vercel.prompt }],
    coachQuestion: "Je veux mettre mon SaaS en ligne sur Vercel. Explique-moi chaque étape.",
    link: { label: "Voir l'étape Hébergement", href: "#hebergement" },
  },
  test: {
    title: "Teste tout le parcours comme un inconnu",
    summary: "Inscription, paiement en mode test, fonctionnalité principale : de bout en bout.",
    why: "Tu connais ton site par cœur, tes visiteurs non. Chaque endroit où tu hésites, même une seconde, est un endroit où un vrai visiteur abandonne.",
    steps: CHECKLIST_HELP.test,
    prompts: [
      {
        label: "Prompt de vérification",
        text: "Fais une revue complète de mon SaaS avant lancement : vérifie que chaque lien et chaque bouton mène quelque part, que les formulaires affichent des erreurs claires, que le site s'affiche bien sur mobile, que les pages réservées sont protégées quand on n'est pas connecté, et qu'aucune clé secrète n'apparaît dans le code envoyé au navigateur. Donne-moi la liste des problèmes, du plus grave au moins grave, puis corrige-les un par un avec mon accord.",
      },
    ],
    coachQuestion: "Je vais tester mon SaaS avant de le lancer. Qu'est-ce que je dois vérifier en priorité ?",
    link: { label: "Voir la checklist", href: "#lancement" },
  },
  share: {
    title: "Fais tester ton site à 5 personnes",
    summary: "Des gens qui ressemblent à tes futurs clients, avec une question précise.",
    why: "Tes proches te diront que c'est bien. Cinq personnes de ta cible te diront où elles bloquent, et c'est ça qui te fait vendre.",
    steps: CHECKLIST_HELP.share,
    coachQuestion: "Je veux faire tester mon SaaS à 5 personnes de ma cible. Où les trouver et quoi leur demander ?",
    link: { label: "Voir la checklist", href: "#lancement" },
  },
};

export function creationRecommendations(s: CreationState): Recommendation[] {
  const recs: Recommendation[] = [];
  const tool = CODE_TOOLS.find((t) => t.id === s.tool);

  if (s.hasExistingSaas && !s.mvpLaunched) {
    recs.push({
      id: "existing-saas",
      impact: "moyen",
      title: "Ton SaaS est déjà en ligne : branche tes vrais chiffres",
      summary: "Connecte ton Stripe dans Revenus pour des conseils sur ton prix et tes abonnés.",
      why: "Pour un site qui tourne déjà, le plus utile n'est pas de tout reconstruire : c'est de regarder ce que disent tes chiffres (prix, résiliations, paiements en échec) et d'agir dessus.",
      steps: [
        "Va dans l'onglet Revenus et connecte une clé Stripe en lecture seule.",
        "Lis les recommandations qui s'affichent sur tes vrais chiffres.",
        "Utilise quand même la checklist ci-dessous pour repérer ce qui manque à ton site.",
      ],
      coachQuestion: "J'ai déjà un SaaS en ligne. Par quoi je commence pour faire plus de revenus ?",
      link: { label: "Aller dans Revenus", href: "/espace/revenus" },
    });
  }

  if (!s.idea) {
    recs.push({
      id: "idea",
      impact: "fort",
      title: "Choisis ton idée de SaaS",
      summary: "Tout le reste en dépend : ton prompt de build, ton prix, ta cible.",
      why: "Une idée précise (« un outil de planning pour les coachs sportifs indépendants ») donne un prompt précis et un site qui parle à quelqu'un. Une idée vague (« une app pour gagner du temps ») donne un site que personne ne comprend.",
      steps: [
        "Si tu as déjà une idée, écris-la en 3 phrases : pour qui, quel problème, ce que ce problème leur coûte aujourd'hui.",
        "Sinon, clique sur « Propose-moi 3 idées » : l'IA part de tes réponses au questionnaire (ton temps, ta cible, ce que tu refuses de faire).",
        "Garde celle dont tu connais le mieux les clients : tu sauras où les trouver et comment leur parler.",
        "Pas de perfectionnisme : tu ajusteras après tes 5 premiers retours.",
      ],
      coachQuestion: "Aide-moi à choisir et préciser mon idée de SaaS.",
      link: { label: "Aller à l'étape Idée", href: "#idee" },
    });
    return rank(recs);
  }

  if (!s.autopilotStarted && !s.mvpLaunched && !s.hasExistingSaas) {
    recs.push({
      id: "autopilot",
      impact: "fort",
      title: "Laisse le Pilote auto tout mettre en place",
      summary: "Connecte GitHub et Supabase : on crée ton dépôt avec tout le plan, et ta base de données.",
      why: "La mise en place (dépôt, base de données, clés, réglages d'hébergement) est là où la plupart des débutants abandonnent. Le Pilote auto la fait pour toi : ton outil de code n'a plus qu'à lire le plan et construire, une étape à la fois.",
      steps: [
        "Ouvre l'onglet Pilote auto.",
        "Clique sur « Se connecter avec GitHub » : ton dépôt se crée avec le cahier des charges complet.",
        "Clique sur « Se connecter avec Supabase » : ta base de données se crée et ses clés sont rangées dans ton dépôt.",
        "Ouvre Claude Code, Replit ou Lovable depuis le Pilote auto et dis-lui de construire l'étape 1.",
      ],
      coachQuestion: "Comment marche le Pilote auto, et par quoi je commence ?",
      link: { label: "Ouvrir le Pilote auto", href: "/espace/lancement" },
    });
  }

  if (!tool) {
    recs.push({
      id: "tool",
      impact: "fort",
      title: "Choisis où coder ton SaaS",
      summary: "Claude Code pour le plus solide, Replit ou Lovable pour ne rien installer.",
      why: "Ton prompt de build est écrit pour l'outil choisi : Claude Code travaille dans un dossier sur ton ordinateur, Replit et Lovable directement dans le navigateur. Choisir maintenant évite de tout refaire.",
      steps: [
        "Tu débutes complètement et tu ne veux rien installer : Replit ou Lovable.",
        "Tu veux une app solide qui grandira avec tes clients : Claude Code (recommandé).",
        "Clique sur l'outil dans l'étape « Où coder » : ton prompt de build s'écrit pour lui.",
        "Crée ton compte sur l'outil en parallèle (vérifie l'offre du moment sur son site).",
      ],
      coachQuestion: "Quel outil de codage IA me conseilles-tu pour mon idée et mon niveau ?",
      link: { label: "Aller à l'étape Où coder", href: "#code" },
    });
    return rank(recs);
  }

  const next = CHECKLIST_ITEMS.find((item) => !s.checklist[item.id]);
  if (next?.id === "site") {
    recs.push({
      id: "site",
      impact: "fort",
      title: `Génère la première version avec ${tool.name}`,
      summary: "Colle ton prompt de build et laisse l'outil construire, sans rien retoucher au début.",
      why: "Une première version imparfaite t'apprend plus qu'une semaine de réflexion : tu vois tout de suite ce qui manque et tu le demandes en une phrase.",
      steps: CHECKLIST_HELP.site,
      coachQuestion: `Je viens de coller mon prompt de build dans ${tool.name}. Comment je vérifie que le résultat est bon et quoi demander ensuite ?`,
      link: { label: "Voir mon prompt de build", href: "#code" },
    });
  } else if (next && CHECKLIST_RECS[next.id]) {
    const rec = CHECKLIST_RECS[next.id];
    recs.push({
      id: next.id,
      impact: "fort",
      ...rec,
      prompts:
        next.id === "share"
          ? [
              {
                label: "Message à envoyer",
                text: `Salut [prénom] ! Je lance mon projet : ${shortIdea(s.idea)}. J'aurais besoin de 5 minutes de ton avis : est-ce que tu comprends en 10 secondes à quoi ça sert ? Voici le lien : [ton lien]. Sois cash, c'est ce qui m'aide le plus.`,
              },
            ]
          : rec.prompts,
    });
  }

  if (!next && !s.mvpLaunched) {
    recs.push({
      id: "declare-mvp",
      impact: "fort",
      title: "Ta checklist est finie : déclare ta MVP lancée",
      summary: "L'onglet Marketing prend le relais pour tes premiers clients.",
      why: "Une MVP n'a pas besoin d'être parfaite : elle doit permettre à un inconnu de s'inscrire et de payer. Si c'est le cas, chaque jour passé à peaufiner est un jour sans client.",
      steps: [
        "Vérifie une dernière fois qu'un inconnu peut s'inscrire et payer depuis son téléphone.",
        "Clique sur « J'ai lancé ma MVP » en bas de la page.",
        "Passe à l'onglet Marketing : choisis ton canal et publie ta première vidéo cette semaine.",
      ],
      coachQuestion: "Ma checklist de lancement est finie. Qu'est-ce que je fais cette semaine pour avoir mes premiers clients ?",
      link: { label: "Aller au bouton de lancement", href: "#lancement" },
    });
  }

  if (s.mvpLaunched) {
    recs.push({
      id: "go-marketing",
      impact: "fort",
      title: "Ta MVP est en ligne : place aux premiers clients",
      summary: "Un canal, une vidéo par jour, et 10 messages à ta cible.",
      why: "À ce stade, ce qui manque presque toujours, ce n'est pas une fonctionnalité de plus, c'est du monde sur ton site. Le marketing devient ta priorité.",
      steps: [
        "Ouvre l'onglet Marketing et choisis un seul canal (TikTok ou Instagram).",
        "Publie ta première vidéo avec l'une des 3 idées proposées.",
        "Connecte ton Stripe dans Revenus pour suivre tes premiers paiements.",
      ],
      coachQuestion: "Ma MVP est en ligne. Fais-moi un plan pour trouver mes 10 premiers clients.",
      link: { label: "Aller au Marketing", href: "/espace/marketing" },
    });
    recs.push({
      id: "connect-stripe",
      impact: "moyen",
      title: "Connecte ton Stripe pour suivre tes revenus",
      summary: "Ton MRR et des conseils sur ton prix, calculés sur tes vrais chiffres.",
      why: "Tes chiffres réels disent quoi faire ensuite : prix trop bas, paiements en échec, résiliations. Sans eux, on devine.",
      steps: [
        "Ouvre l'onglet Revenus.",
        "Crée une clé Stripe restreinte en lecture seule (les étapes sont expliquées).",
        "Colle-la : ton tableau de bord et tes recommandations s'affichent.",
      ],
      coachQuestion: "Comment je crée une clé Stripe en lecture seule pour suivre mes revenus ?",
      link: { label: "Aller dans Revenus", href: "/espace/revenus" },
    });
  }

  if (s.checklist.deploy) {
    recs.push({
      id: "domain",
      impact: "bonus",
      title: "Branche ton propre nom de domaine",
      summary: "monsaas.fr inspire plus confiance que monsaas.vercel.app au moment de payer.",
      why: "Au moment de sortir sa carte, un visiteur regarde l'adresse. Un vrai domaine coûte quelques euros par an et rassure.",
      steps: [
        "Achète ton domaine (Hostinger, OVH, Namecheap...) : vérifie le prix de renouvellement, pas seulement la première année.",
        "Sur Vercel : ton projet → Settings → Domains → ajoute ton domaine.",
        "Copie les enregistrements DNS affichés par Vercel dans la zone DNS de ton registrar.",
        "Attends la propagation (de quelques minutes à quelques heures), puis mets à jour l'URL du site dans Supabase et dans tes liens Stripe.",
      ],
      coachQuestion: "Comment je branche mon nom de domaine sur mon site Vercel ?",
    });
  } else {
    recs.push({
      id: "secrets",
      impact: "bonus",
      title: "Vérifie qu'aucune clé secrète n'est dans ton code",
      summary: "Une clé Stripe ou Supabase publiée par erreur peut coûter cher.",
      why: "Les outils de codage IA écrivent parfois une clé directement dans un fichier pour « que ça marche ». Si ce fichier part sur GitHub ou dans le navigateur, n'importe qui peut s'en servir.",
      steps: [
        "Colle le prompt ci-dessous dans ton outil de code.",
        "Si une clé a déjà été publiée, régénère-la tout de suite dans Stripe ou Supabase.",
        "Garde tes clés uniquement dans les variables d'environnement (fichier .env en local, réglages de l'hébergeur en ligne).",
      ],
      prompts: [
        {
          label: "Prompt de sécurité",
          text: "Vérifie mon projet : cherche toute clé secrète écrite en dur (Stripe sk_, clé service_role Supabase, mots de passe, tokens) et déplace-la dans les variables d'environnement. Vérifie que le fichier .env est dans .gitignore, et qu'aucune variable secrète n'est préfixée pour être envoyée au navigateur (NEXT_PUBLIC_ ou VITE_). Liste ce que tu as trouvé et ce que tu as changé.",
        },
      ],
      coachQuestion: "Comment je vérifie que mes clés secrètes ne sont pas exposées dans mon projet ?",
    });
  }

  return rank(recs);
}

// ───────────────────────── Revenus

export type RevenueState = {
  metrics: StripeMetrics;
  /** Monthly revenue goal from the onboarding slider, in euros. */
  revenueGoal: number | null;
};

/** Currencies where a 15/month threshold makes sense. */
const PRICE_ADVICE_CURRENCIES = new Set(["eur", "usd", "gbp", "chf", "cad"]);

export function revenueRecommendations({ metrics: m, revenueGoal }: RevenueState): Recommendation[] {
  if (!m.connected) {
    return [
      {
        id: "connect",
        impact: "fort",
        title: "Connecte ton Stripe en lecture seule",
        summary: "Ton MRR, tes prix et des conseils calculés sur tes vrais chiffres.",
        why: "Avec tes chiffres réels, l'espace et le coach te disent quoi faire : prix trop bas, paiements en échec, résiliations. Une clé restreinte en lecture seule ne permet ni de débiter, ni de rembourser, ni de modifier quoi que ce soit : elle sert uniquement à lire.",
        steps: [
          "Ouvre Stripe → Développeurs → Clés API (lien ci-dessous).",
          "Clique sur « Créer une clé restreinte » et nomme-la « SaaSFounder ».",
          "Mets « Lecture » sur Abonnements (Subscriptions) et sur Prix (Prices), laisse tout le reste sur « Aucun ».",
          "Copie la clé (elle commence par rk_live_) et colle-la dans le formulaire de cette page.",
        ],
        coachQuestion: "Comment je crée une clé Stripe restreinte en lecture seule ?",
        link: { label: "Ouvrir les clés API Stripe", href: "https://dashboard.stripe.com/apikeys" },
      },
    ];
  }

  if (m.error) {
    return [
      {
        id: "key-error",
        impact: "fort",
        title: "Ta clé Stripe ne répond plus",
        summary: "On n'arrive plus à lire ton compte : remplace la clé.",
        why: "La clé a peut-être été supprimée ou régénérée, ou il lui manque la permission de lecture sur les abonnements.",
        steps: [
          "Ouvre Stripe → Développeurs → Clés API.",
          "Crée une nouvelle clé restreinte : « Lecture » sur Abonnements et Prix, rien d'autre.",
          "Clique sur « Changer de clé » sur cette page et colle la nouvelle.",
        ],
        coachQuestion: "Ma clé Stripe ne fonctionne plus dans SaaSFounder. Comment j'en crée une nouvelle ?",
        link: { label: "Ouvrir les clés API Stripe", href: "https://dashboard.stripe.com/apikeys" },
      },
    ];
  }

  const recs: Recommendation[] = [];
  const cur = m.currency;

  if (m.activeSubscriptions === 0) {
    recs.push({
      id: "first-payment",
      impact: "fort",
      title: "Décroche ton premier abonné",
      summary: "Le premier paiement d'un inconnu valide l'idée, le prix et le parcours d'achat d'un coup.",
      why: "Tant que personne n'a payé, tout reste une hypothèse. Le premier client vient rarement tout seul : il vient d'un message, d'une vidéo, d'une recommandation.",
      steps: [
        "Vérifie que ton site est en mode live : clés sk_live dans les variables d'environnement de ton hébergeur, pas les clés de test.",
        "Fais toi-même un vrai paiement avec ta carte, puis rembourse-le depuis Stripe : tu sais que tout marche.",
        "Crée un code promo de lancement (Stripe → Catalogue de produits → Coupons) et active les codes promo sur ton Checkout.",
        "Envoie ton lien et ton code à 10 personnes de ta cible, avec un message personnel.",
        "À chaque « non » ou silence, demande en une question ce qui a bloqué.",
      ],
      prompts: [
        {
          label: "Vérifier le paiement en production",
          text: "Vérifie que mon parcours d'abonnement fonctionne en production : le bouton ouvre Stripe Checkout avec le bon prix, les codes promo sont acceptés (allow_promotion_codes), le webhook reçoit bien checkout.session.completed et active l'accès, et le portail client est accessible. Liste les variables d'environnement Stripe nécessaires et explique-moi comment vérifier dans le dashboard Stripe (Développeurs → Webhooks) que les événements arrivent bien.",
        },
      ],
      coachQuestion: "Je n'ai encore aucun abonné. Fais-moi un plan concret pour décrocher le premier cette semaine.",
      link: { label: "Aller au Marketing", href: "/espace/marketing" },
    });
  }

  // The main monthly price: the one most active subscribers are on.
  const monthly = m.prices.filter((p) => p.interval === "month" && p.intervalCount === 1);
  const main = monthly[0];
  if (main && PRICE_ADVICE_CURRENCIES.has(cur) && main.amount < 15) {
    const suggested = Math.max(main.amount + 2, Math.round(main.amount * 1.2));
    const diff = Math.round((suggested - main.amount) * 100) / 100;
    const goalLine =
      revenueGoal && cur === "eur"
        ? `Pour ton objectif de ${money(revenueGoal, cur)} par mois, il te faut ${Math.ceil(revenueGoal / main.amount)} abonnés à ${money(main.amount, cur)}, contre ${Math.ceil(revenueGoal / suggested)} à ${money(suggested, cur)}. `
        : "";
    recs.push({
      id: "raise-price",
      impact: "fort",
      title: `Ton abonnement est à ${money(main.amount, cur)} : teste ${money(suggested, cur)}`,
      summary: `+${money(diff, cur)} par nouveau client et par mois, sans un client de plus.`,
      why: `${goalLine}Pour un outil qui fait gagner du temps ou de l'argent, quelques euros d'écart changent rarement la décision d'achat. Et tes ${main.subscriptions} abonné${main.subscriptions > 1 ? "s" : ""} actuel${main.subscriptions > 1 ? "s gardent" : " garde"} leur prix : tu ne risques pas de les perdre.`,
      steps: [
        `Dans Stripe : Catalogue de produits → ton produit → Ajouter un prix → ${money(suggested, cur)} par mois, récurrent. Ne supprime pas l'ancien prix.`,
        `Tes abonnés actuels restent automatiquement à ${money(main.amount, cur)} : c'est plus juste et ça évite les résiliations.`,
        "Copie l'identifiant du nouveau prix (price_...) et remplace l'ancien dans les variables d'environnement de ton hébergeur (souvent STRIPE_PRICE_ID), puis redéploie.",
        "Mets à jour le prix affiché sur ton site avec le prompt ci-dessous.",
        "Mesure pendant 2 semaines : visites de la page tarifs → abonnements. Si la conversion ne baisse pas nettement, garde le nouveau prix.",
      ],
      prompts: [
        {
          label: "Mettre à jour la page tarifs",
          text: `Mon abonnement passe de ${money(main.amount, cur)} à ${money(suggested, cur)} par mois. Mets à jour ma page tarifs : nouveau prix, et juste en dessous 3 bénéfices concrets que le client obtient (formulés en résultat, pas en fonctionnalité). Vérifie que le bouton d'abonnement utilise l'identifiant de prix lu depuis la variable d'environnement, et cherche dans tout le projet (page d'accueil, FAQ, emails) les endroits où l'ancien montant est écrit en dur pour les mettre à jour.`,
        },
      ],
      coachQuestion: `Mon abonnement est à ${main.amount} ${cur.toUpperCase()} par mois avec ${main.subscriptions} abonné(s). Est-ce que je passe à ${suggested} et comment je l'annonce ?`,
      link: { label: "Ouvrir mes produits Stripe", href: "https://dashboard.stripe.com/products" },
    });
  }

  if (m.pastDue > 0) {
    recs.push({
      id: "past-due",
      impact: "fort",
      title: `${m.pastDue} paiement${m.pastDue > 1 ? "s" : ""} en échec à récupérer`,
      summary: "Des clients qui voulaient payer, mais dont la carte a été refusée.",
      why: "Une carte expirée ou un plafond atteint te fait perdre un client qui ne voulait pas partir. Stripe peut relancer le paiement automatiquement et prévenir le client par email.",
      steps: [
        "Ouvre Stripe → Paramètres → Billing → Abonnements et e-mails (lien ci-dessous).",
        "Active les nouvelles tentatives intelligentes (Smart Retries).",
        "Active l'email envoyé au client quand un paiement échoue, avec le lien pour mettre à jour sa carte.",
        "Écris aussi un message personnel à chaque client concerné : à ce stade, un mot de toi fait la différence.",
      ],
      prompts: [
        {
          label: "Message au client",
          text: "Salut [prénom], ton dernier paiement pour [nom de ton SaaS] n'est pas passé (carte expirée ou refusée, ça arrive). Tu peux mettre ta carte à jour ici en 30 secondes : [lien du portail client]. Si tu as la moindre question, réponds-moi directement.",
        },
      ],
      coachQuestion: `J'ai ${m.pastDue} paiement(s) en échec sur Stripe. Comment je les récupère ?`,
      link: { label: "Ouvrir les réglages de relance", href: "https://dashboard.stripe.com/settings/billing/automatic" },
    });
  }

  if (m.canceledLast30 > 0) {
    recs.push({
      id: "churn",
      impact: "moyen",
      title: `${m.canceledLast30} résiliation${m.canceledLast30 > 1 ? "s" : ""} en 30 jours : demande pourquoi`,
      summary: "Chaque départ te dit ce qui manque à ton produit.",
      why: "Sans la raison, tu corriges à l'aveugle. Avec elle, tu sais si c'est le prix, une fonctionnalité, un bug ou juste un mauvais moment.",
      steps: [
        "Ouvre Stripe → Paramètres → Billing → Portail client (lien ci-dessous).",
        "Active la collecte du motif de résiliation : le client choisit une raison en partant.",
        "Écris à chaque client parti avec une seule question (modèle ci-dessous).",
        "Si la même raison revient deux fois, c'est ta prochaine correction.",
      ],
      prompts: [
        {
          label: "Message au client parti",
          text: "Salut [prénom], j'ai vu que tu as arrêté [nom de ton SaaS], merci de l'avoir essayé. J'ai une seule question, et ta réponse m'aide énormément : qu'est-ce qui t'a manqué pour rester ? Même une réponse en trois mots me suffit.",
        },
      ],
      coachQuestion: `J'ai eu ${m.canceledLast30} résiliation(s) ce mois-ci. Comment je réduis les départs ?`,
      link: { label: "Ouvrir le portail client Stripe", href: "https://dashboard.stripe.com/settings/billing/portal" },
    });
  }

  const hasLongPlan = m.prices.some((p) => p.interval === "year" || (p.interval === "month" && p.intervalCount >= 3));
  if (main && !hasLongPlan && m.activeSubscriptions >= 3) {
    const annual = main.amount * 10;
    recs.push({
      id: "annual",
      impact: "moyen",
      title: "Ajoute une offre annuelle, 2 mois offerts",
      summary: `${money(annual, cur)} par an au lieu de ${money(main.amount * 12, cur)} : de la trésorerie d'avance et moins de résiliations.`,
      why: "Un client à l'année ne se pose pas la question de partir chaque mois, et tu encaisses 10 mois d'un coup pour financer ton marketing.",
      steps: [
        `Dans Stripe : ton produit → Ajouter un prix → ${money(annual, cur)}, récurrent annuel.`,
        "Ajoute un sélecteur Mensuel / Annuel sur ta page tarifs avec le prompt ci-dessous.",
        "Propose-le par email à tes abonnés mensuels : certains préfèrent payer une fois.",
        "Dans un mois, regarde la part des nouveaux clients qui choisissent l'annuel.",
      ],
      prompts: [
        {
          label: "Prompt offre annuelle",
          text: `Ajoute une offre annuelle à mon SaaS : sur la page tarifs, un sélecteur Mensuel / Annuel ; l'annuel affiche ${money(annual, cur)} par an avec la mention « 2 mois offerts ». Le bouton annuel ouvre Stripe Checkout avec un second identifiant de prix lu depuis STRIPE_PRICE_ANNUAL. Le webhook doit traiter les deux prix de la même façon. Ne change rien au prix mensuel existant.`,
        },
      ],
      coachQuestion: "Est-ce que je dois proposer une offre annuelle, et à quel prix ?",
      link: { label: "Ouvrir mes produits Stripe", href: "https://dashboard.stripe.com/products" },
    });
  }

  if (m.activeSubscriptions > 0 && m.newLast30 === 0) {
    recs.push({
      id: "no-new",
      impact: "moyen",
      title: "Aucun nouvel abonné depuis 30 jours",
      summary: "Ton produit garde ses clients, il lui manque du monde en haut du tunnel.",
      why: "Tes clients actuels restent : le produit fait le travail. Il faut maintenant plus de visiteurs, et c'est le rôle du marketing.",
      steps: [
        "Ouvre l'onglet Marketing et reprends un rythme de publication régulier.",
        "Demande à tes clients actuels qui d'autre aurait besoin de ton outil.",
        "Écris à 10 personnes de ta cible par jour pendant une semaine.",
      ],
      coachQuestion: "Je n'ai pas eu de nouvel abonné depuis 30 jours. Comment je relance les inscriptions ?",
      link: { label: "Aller au Marketing", href: "/espace/marketing" },
    });
  }

  if (m.trialing > 0) {
    recs.push({
      id: "trials",
      impact: "bonus",
      title: `${m.trialing} essai${m.trialing > 1 ? "s" : ""} en cours à convertir`,
      summary: "Le bon message au bon moment fait passer un essai en abonnement.",
      why: "Un essai se perd surtout quand la personne n'a pas eu le temps de voir le résultat promis. Un rappel juste avant la fin la ramène au bon moment.",
      steps: [
        "Stripe → Paramètres → Billing → Abonnements et e-mails : active l'email de rappel avant la fin de l'essai.",
        "Écris toi-même à chaque personne en essai : « Tu as pu essayer [fonction principale] ? ».",
        "Si quelqu'un n'a rien fait, propose-lui 10 minutes en visio ou une vidéo de démo.",
      ],
      coachQuestion: `J'ai ${m.trialing} personne(s) en essai. Comment je les convertis en abonnés ?`,
    });
  }

  if (m.activeSubscriptions > 0) {
    recs.push({
      id: "testimonials",
      impact: "bonus",
      title: "Demande un avis à tes premiers clients",
      summary: "Un vrai témoignage sur ta page tarifs rassure les visiteurs qui hésitent.",
      why: "Les visiteurs croient plus un client qu'un fondateur. Une phrase, un prénom et un métier suffisent, à condition que ce soit vrai.",
      steps: [
        "Écris à tes clients les plus actifs avec le message ci-dessous.",
        "Demande l'autorisation d'afficher leur prénom et leur métier.",
        "Place le meilleur avis juste au-dessus du bouton d'abonnement.",
      ],
      prompts: [
        {
          label: "Message à tes clients",
          text: "Salut [prénom], merci d'utiliser [nom de ton SaaS] ! J'ai une petite demande : en une ou deux phrases, qu'est-ce que l'outil a changé pour toi ? Si tu es d'accord, j'aimerais l'afficher sur mon site avec ton prénom et ton métier.",
        },
      ],
      coachQuestion: "Comment je récupère des témoignages de mes premiers clients ?",
    });
  }

  return rank(recs);
}

// ───────────────────────── Marketing

export type MarketingState = {
  channel: string | null;
  videoUrl: string;
  views: number | null;
  idea: string;
  mvpLaunched: boolean;
  hasExistingSaas: boolean;
  /** From the onboarding: refuses to appear on camera. */
  noFace: boolean;
  /** From the onboarding: said yes to contacting 10 prospects a day. */
  prospects: boolean;
};

export function marketingRecommendations(s: MarketingState): Recommendation[] {
  const recs: Recommendation[] = [];
  const idea = s.idea ? shortIdea(s.idea) : "mon SaaS";
  const channel = s.channel ?? "TikTok";

  if (!s.mvpLaunched && !s.hasExistingSaas) {
    recs.push({
      id: "build-in-public",
      impact: "moyen",
      title: "Publie pendant que tu construis",
      summary: "« Jour 3 de mon SaaS » : tu arrives au lancement avec des gens qui attendent.",
      why: "Montrer la construction ne demande rien d'autre que ton écran, et chaque vidéo amène des gens qui voudront tester le jour du lancement.",
      steps: [
        "Choisis ton canal ci-dessous.",
        "Filme 20 secondes de ton écran pendant que l'IA construit ton site.",
        "Dis ce que tu construis, pour qui, et quand ça sort.",
        "Invite les gens à commenter pour être prévenus du lancement.",
      ],
      coachQuestion: "Comment je montre la construction de mon SaaS sur les réseaux sans me disperser ?",
      link: { label: "Choisir mon canal", href: "#canal" },
    });
  }

  if (!s.channel) {
    recs.push({
      id: "channel",
      impact: "fort",
      title: "Choisis un seul canal : TikTok ou Instagram",
      summary: "Un canal pendant 30 jours t'apprend plus que trois en même temps.",
      why: "Chaque plateforme a ses codes. En te concentrant sur une seule, tu comprends vite ce qui marche pour ton produit au lieu de recommencer de zéro partout.",
      steps: [
        "TikTok si tu veux de la portée sans avoir d'abonnés au départ.",
        "Instagram si ta cible y est déjà (indépendants, commerces, coachs...).",
        "Clique sur le canal ci-dessous : 3 idées de vidéos adaptées à ton SaaS s'affichent.",
        "Engage-toi sur 30 jours avant de juger le canal.",
      ],
      coachQuestion: "TikTok ou Instagram pour mon SaaS et ma cible ? Aide-moi à choisir.",
      link: { label: "Choisir mon canal", href: "#canal" },
    });
  } else if (!s.videoUrl) {
    recs.push({
      id: "first-video",
      impact: "fort",
      title: "Publie ta première vidéo cette semaine",
      summary: "20 à 40 secondes d'écran filmé suffisent. Imparfaite mais publiée.",
      why: "Ta première vidéo ne va probablement pas exploser, et c'est normal : elle sert à lancer la machine et à apprendre ce qui accroche ta cible.",
      steps: [
        "Prends une des 3 idées ci-dessous, ou demande-en d'autres.",
        s.noFace
          ? "Filme ton écran 20 à 40 secondes, sans te montrer : le problème d'abord, ton outil qui le résout ensuite, avec du texte à l'écran."
          : "Filme 20 à 40 secondes : le problème d'abord, ton outil qui le résout à l'écran ensuite.",
        "Ajoute des sous-titres : beaucoup de gens regardent sans le son (CapCut les génère automatiquement).",
        "Termine par une seule action : « lien en bio » ou « commente DEMO ».",
        "Colle le lien de la vidéo dans le formulaire ci-dessous.",
      ],
      prompts: [
        {
          label: "Script de vidéo (à coller dans Claude ou ChatGPT)",
          text: `Écris-moi le script d'une vidéo ${channel} de 30 secondes pour présenter mon SaaS : ${idea}. Structure : une accroche de 3 secondes qui nomme le problème de ma cible, une démonstration à l'écran, une preuve concrète, puis l'action « lien en bio ».${s.noFace ? " Je ne me montre pas : écran filmé et texte à l'écran uniquement." : ""} Donne le texte à dire et le texte à afficher, plan par plan.`,
        },
      ],
      coachQuestion: `Aide-moi à écrire ma première vidéo ${channel} pour mon SaaS.`,
      link: { label: "Voir mes idées de vidéos", href: "#canal" },
    });
  } else if (s.views == null) {
    recs.push({
      id: "log-views",
      impact: "moyen",
      title: "Note tes vues 24 h après la publication",
      summary: "Un seul chiffre, et les conseils s'adaptent à ta situation.",
      why: "Sous quelques centaines de vues, le problème vient presque toujours de l'accroche. Au-delà, il faut transformer les vues en inscrits. Le conseil n'est pas le même.",
      steps: [
        "Attends 24 h après la publication.",
        `Ouvre la vidéo dans ${channel} et relève le nombre de vues.`,
        "Note-le dans le formulaire ci-dessous.",
      ],
      coachQuestion: "Quels chiffres regarder sur mes vidéos pour savoir ce qui marche ?",
      link: { label: "Noter mes vues", href: "#video" },
    });
  } else if (s.views < 500) {
    recs.push({
      id: "hooks",
      impact: "fort",
      title: "Moins de 500 vues : change l'accroche, pas le produit",
      summary: "Même sujet, 3 nouvelles accroches, 3 vidéos en 3 jours.",
      why: "À ce niveau de vues, la plupart des gens ont fait défiler avant la fin des 3 premières secondes. Le sujet n'est pas forcément mauvais : c'est l'accroche qui n'a pas arrêté le pouce.",
      steps: [
        "Garde le même sujet et génère 10 accroches avec le prompt ci-dessous.",
        "Choisis les 3 plus différentes et publie une vidéo par jour, à la même heure.",
        "Montre le problème ou le résultat dès la première image, sans introduction.",
        "Compare les vues après 24 h et garde le style d'accroche gagnant.",
      ],
      prompts: [
        {
          label: "10 accroches",
          text: `Écris-moi 10 accroches de vidéo courte pour ${channel} (3 secondes, moins de 12 mots chacune) qui présentent mon SaaS : ${idea}. Chacune doit nommer un problème précis que vit ma cible, ou montrer un résultat concret. Varie les styles : question, erreur fréquente, avant/après, chiffre tiré de mon expérience.`,
        },
      ],
      coachQuestion: `Ma vidéo ${channel} a fait ${s.views} vues. Comment j'améliore mes accroches ?`,
    });
  } else {
    recs.push({
      id: "convert",
      impact: "fort",
      title: "Tes vues sont là : transforme-les en inscrits",
      summary: "Un lien clair, une seule action, une page d'arrivée dédiée.",
      why: `${s.views.toLocaleString("fr-FR")} vues, c'est autant de gens qui ont vu ton produit. S'ils ne s'inscrivent pas, le blocage est entre la vidéo et ton site : le lien, la promesse ou la page d'arrivée.`,
      steps: [
        "Mets le lien de ton site en bio, avec une phrase qui dit ce qu'on y obtient.",
        "Termine chaque vidéo par une seule action : « lien en bio ».",
        "Épingle un commentaire qui répond à la question la plus posée.",
        "Réponds en vidéo aux meilleurs commentaires : du contenu gratuit et ciblé.",
        "Crée une page d'arrivée dédiée à ce canal (prompt ci-dessous) pour mesurer les inscriptions qui en viennent.",
      ],
      prompts: [
        {
          label: "Page d'arrivée dédiée",
          text: `Crée une page /${channel.toLowerCase()} sur mon site pour les visiteurs qui viennent de ${channel} : en titre, l'accroche de mes vidéos ; une capture du produit ; 3 bénéfices concrets ; un seul bouton vers l'inscription. Enregistre la source « ${channel.toLowerCase()} » au moment de l'inscription pour que je sache combien de comptes viennent de ce canal.`,
        },
      ],
      coachQuestion: `Ma vidéo ${channel} a fait ${s.views} vues mais peu d'inscrits. Comment je convertis mieux ?`,
    });
  }

  recs.push({
    id: "prospects",
    impact: s.prospects ? "moyen" : "bonus",
    title: "Écris à 10 personnes de ta cible par jour",
    summary: "Des messages courts et personnels, sans jamais forcer la vente.",
    why: "Au début, personne ne te connaît. Un message personnel à quelqu'un qui a exactement le problème que tu résous reste le moyen le plus direct d'avoir tes premiers utilisateurs.",
    steps: [
      "Trouve 10 personnes de ta cible : groupes Facebook, LinkedIn, commentaires de comptes de ton secteur.",
      "Lis leur profil 30 secondes pour personnaliser la première phrase.",
      "Envoie le message ci-dessous, sans lien dans le premier message.",
      "S'ils répondent, propose-leur d'essayer et demande leur avis.",
    ],
    prompts: [
      {
        label: "Premier message",
        text: `Salut [prénom] ! J'ai vu [détail précis de son profil ou de son post]. Je construis ${idea}, et j'essaie de comprendre comment les gens comme toi gèrent [le problème] aujourd'hui. Je peux te poser deux questions rapides ?`,
      },
    ],
    coachQuestion: "Où trouver mes premiers clients et quoi leur écrire, sans spammer ?",
  });

  return rank(recs);
}
