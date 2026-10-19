import type { Brand } from "@/components/ui/brand-logo";

// The member area's static guidance, shared by the tabs (client) and the
// coach's project context (server). Prices and free tiers of third-party
// tools change often, so the copy points people to check the tool's own
// page instead of quoting numbers.

export type ToolOption = {
  id: string;
  name: string;
  desc: string;
  /** Simple Icons logo; tools it doesn't carry show their initial. */
  brand?: Brand;
  recommended?: boolean;
  url: string;
};

/** Étape « Où coder » : the AI coding tool the build prompt is written for. */
export const CODE_TOOLS: ToolOption[] = [
  {
    id: "claude",
    brand: "claude",
    name: "Claude Code",
    desc: "L'assistant de codage d'Anthropic. Le plus solide pour construire une app complète étape par étape avec toi.",
    recommended: true,
    url: "https://claude.com/claude-code",
  },
  {
    id: "replit",
    brand: "replit",
    name: "Replit",
    desc: "Éditeur en ligne avec IA intégrée (Replit Agent). Rien à installer, code et hébergement au même endroit.",
    url: "https://replit.com",
  },
  {
    id: "lovable",
    name: "Lovable",
    desc: "Génère une application web à partir d'une description, avec un aperçu visuel immédiat.",
    url: "https://lovable.dev",
  },
  {
    id: "cursor",
    brand: "cursor",
    name: "Cursor",
    desc: "Un éditeur de code avec IA intégrée, pour ceux qui veulent voir et modifier les fichiers eux-mêmes.",
    url: "https://cursor.com",
  },
  {
    id: "chatgpt",
    name: "ChatGPT / Codex",
    desc: "L'assistant d'OpenAI, avec un mode Codex pour écrire et exécuter du code.",
    url: "https://chatgpt.com",
  },
];

/** Étape « Où héberger ». */
export const HOSTS: (ToolOption & { steps: string[]; prompt: string })[] = [
  {
    id: "vercel",
    brand: "vercel",
    name: "Vercel",
    desc: "Le plus simple pour un SaaS moderne : tu relies ton dépôt GitHub, chaque modification est mise en ligne automatiquement.",
    recommended: true,
    url: "https://vercel.com/new",
    steps: [
      "Crée un compte Vercel avec ton compte GitHub (l'offre gratuite suffit pour démarrer).",
      "Demande à ton outil de code de pousser le projet sur un dépôt GitHub (le prompt ci-dessous le fait).",
      "Sur Vercel : Add New → Project → choisis le dépôt → Deploy.",
      "Dans Settings → Environment Variables, ajoute les mêmes clés qu'en local (Supabase, Stripe...), puis Redeploy.",
      "Branche ton nom de domaine dans Settings → Domains quand tu en as un.",
    ],
    prompt:
      "Prépare mon projet pour un déploiement sur Vercel : vérifie que `npm run build` passe sans erreur, liste toutes les variables d'environnement nécessaires dans un fichier .env.example (sans les valeurs), puis pousse le code sur un nouveau dépôt GitHub privé et donne-moi le lien. Explique chaque étape simplement.",
  },
  {
    id: "hostinger",
    brand: "hostinger",
    name: "Hostinger",
    desc: "Bon choix si tu veux un nom de domaine et un hébergement au même endroit, ou un VPS pour tout héberger toi-même.",
    url: "https://www.hostinger.com",
    steps: [
      "Pour un site Node/Next.js, prends un plan qui supporte Node.js ou un VPS (l'hébergement « web » classique ne suffit pas).",
      "Sur un VPS : choisis l'image Ubuntu, connecte-toi en SSH, installe Node.js, puis clone ton dépôt GitHub.",
      "Lance l'app avec un gestionnaire de processus (PM2) et place Nginx devant pour le HTTPS.",
      "Pointe ton domaine vers l'adresse IP du VPS dans la zone DNS de Hostinger.",
    ],
    prompt:
      "Je veux héberger mon SaaS sur un VPS Hostinger (Ubuntu). Écris-moi pas à pas les commandes pour : installer Node.js LTS, cloner mon dépôt GitHub, installer les dépendances, builder, lancer l'app avec PM2 au démarrage, et configurer Nginx + HTTPS (Let's Encrypt) pour mon domaine. Explique chaque commande comme à un débutant.",
  },
];

/** Étape « Données et comptes ». */
export const DATA_OPTIONS: (ToolOption & { steps: string[]; prompt: string })[] = [
  {
    id: "supabase",
    brand: "supabase",
    name: "Supabase",
    desc: "Base de données, comptes utilisateurs (email, Google) et stockage de fichiers, prêts en quelques minutes. Gratuit pour démarrer.",
    recommended: true,
    url: "https://supabase.com/dashboard",
    steps: [
      "Crée un projet sur supabase.com (région Europe, garde bien le mot de passe de la base).",
      "Dans Project Settings → API keys, copie l'URL du projet et la clé « publishable ».",
      "Colle le prompt ci-dessous dans ton outil de code : il crée les tables et branche l'inscription.",
      "Dans Authentication → URL Configuration, mets l'adresse de ton site en Site URL.",
      "Attention : un projet gratuit se met en pause après une période sans activité. Passe en Pro quand tu as des clients.",
    ],
    prompt:
      "Branche Supabase à mon projet : installe le client officiel, crée les tables nécessaires à mon SaaS avec la sécurité au niveau des lignes (RLS) activée sur chacune, ajoute l'inscription et la connexion par email, et protège les pages réservées aux utilisateurs connectés. Lis l'URL et la clé depuis les variables d'environnement. Montre-moi le schéma des tables avant de les créer.",
  },
  {
    id: "vps",
    brand: "hostinger",
    name: "VPS (Hostinger)",
    desc: "Tu héberges toi-même ta base (PostgreSQL ou Supabase auto-hébergé). Pas de pause, mais tu gères sauvegardes et mises à jour.",
    url: "https://www.hostinger.com/vps",
    steps: [
      "Prends un VPS d'au moins 4 Go de RAM si tu veux y installer Supabase (8 Go plus confortable).",
      "Choisis le modèle « Ubuntu + Supabase » à la création du VPS, ou installe PostgreSQL seul.",
      "Configure un service d'envoi d'emails (Brevo, Resend…) pour les emails de confirmation.",
      "Programme une sauvegarde automatique de la base, chaque jour.",
    ],
    prompt:
      "J'héberge ma base PostgreSQL sur un VPS. Aide-moi à : créer un utilisateur et une base dédiés à mon app, n'ouvrir le port qu'à mon serveur d'application, programmer une sauvegarde quotidienne avec rotation sur 7 jours, et brancher mon projet dessus via une variable d'environnement DATABASE_URL. Explique chaque étape simplement.",
  },
];

export const PAYMENT_GUIDE = {
  steps: [
    "Crée un compte sur stripe.com et reste en mode test au début : aucune vraie carte n'est débitée.",
    "Crée ton produit et son prix (Catalogue de produits → Ajouter un produit → prix récurrent mensuel).",
    "Colle le prompt ci-dessous dans ton outil de code pour brancher Stripe Checkout et le webhook.",
    "Teste un paiement avec la carte 4242 4242 4242 4242 (date future, CVC au hasard).",
    "Passe en mode live seulement quand tout marche, avec tes clés live dans les variables d'environnement.",
  ],
  prompt:
    "Ajoute les paiements Stripe à mon SaaS : un bouton « S'abonner » qui ouvre Stripe Checkout en mode abonnement avec mon prix (identifiant lu depuis STRIPE_PRICE_ID), un webhook /api/stripe/webhook qui vérifie la signature et active l'accès de l'utilisateur sur checkout.session.completed, le désactive sur customer.subscription.deleted, et un lien « Gérer mon abonnement » vers le portail client Stripe. Clés lues depuis les variables d'environnement, jamais dans le code.",
};

export const CHECKLIST_ITEMS = [
  { id: "site", label: "Génère ton site avec l'outil choisi et le prompt fourni" },
  { id: "auth", label: "Vérifie que l'inscription et la connexion fonctionnent" },
  { id: "payment", label: "Ajoute un moyen de paiement (Stripe Checkout)" },
  { id: "deploy", label: "Mets ton site en ligne (Vercel, Hostinger...)" },
  { id: "test", label: "Teste le parcours complet toi-même, de bout en bout" },
  { id: "share", label: "Partage le lien à 5 personnes pour un premier retour" },
];

export const CHECKLIST_HELP: Record<string, string[]> = {
  site: [
    "Colle le prompt fourni dans l'outil choisi sans le modifier la première fois : tu ajusteras une fois le résultat sous les yeux.",
    "Laisse l'outil générer une première version complète avant de juger.",
    "Si le résultat ne correspond pas, précise en une phrase ce qui cloche (« le formulaire est en anglais », « il manque une page tarifs ») plutôt que de tout redemander.",
    "Note où vit le code (ton compte Replit/Lovable, ou un dépôt GitHub) : tu en auras besoin pour la mise en ligne.",
  ],
  auth: [
    "Crée un compte test avec un email que tu contrôles, déconnecte-toi, puis reconnecte-toi.",
    "Essaie volontairement un mauvais mot de passe : tu dois voir un message d'erreur clair, pas une page blanche.",
    "Teste aussi le « mot de passe oublié » s'il existe : c'est souvent oublié et ça bloque de vrais utilisateurs.",
  ],
  payment: [
    "Reste en mode test au début : aucune vraie carte n'est débitée.",
    "Un seul prix pour commencer : pas besoin de plusieurs formules tout de suite.",
    "Ne partage jamais tes clés Stripe dans un message ou un dépôt public.",
    "Teste un paiement avec la carte 4242 4242 4242 4242 et vérifie qu'il apparaît dans ton dashboard Stripe.",
  ],
  deploy: [
    "Suis l'étape « Où héberger » juste au-dessus : Vercel est le plus simple pour démarrer.",
    "Ajoute dans l'hébergeur les mêmes variables d'environnement qu'en local, sinon le site en ligne ne se connecte à rien.",
    "Ouvre le lien sur ton téléphone en plus de l'ordinateur pour vérifier l'affichage.",
  ],
  test: [
    "Fais tout le parcours comme un inconnu : inscription, paiement en mode test, fonctionnalité principale.",
    "Note chaque endroit où tu hésites, même un détail : c'est là que bloquera un vrai visiteur.",
    "Fais tester quelqu'un de ton entourage sans rien lui expliquer, et regarde où il bute.",
  ],
  share: [
    "Choisis 5 personnes qui ressemblent à tes futurs clients, pas juste ta famille par politesse.",
    "Envoie le lien avec une question précise : « est-ce que tu comprends en 10 secondes à quoi ça sert ? ».",
    "Note tout ce qu'ils disent : ça sert à repérer les frictions, pas à valider que tout est parfait.",
  ],
};

/** Shown when the AI isn't available for the "trouve-moi une idée" step. */
export const IDEA_SUGGESTIONS = [
  "Un outil qui automatise une tâche répétitive dans un métier que tu connais bien (facturation, planning, suivi client...).",
  "Une version simplifiée d'un logiciel que tu trouves trop cher ou trop compliqué, pour un public précis.",
  "Un tableau de bord qui centralise des informations que les gens de ton secteur vont chercher à plusieurs endroits.",
];
