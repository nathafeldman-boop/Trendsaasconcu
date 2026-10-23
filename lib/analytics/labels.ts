import { STEPS } from "@/components/onboarding/funnel";
import { CHECKLIST_ITEMS, CODE_TOOLS } from "@/lib/espace/content";

// French, human labels for the admin dashboard: onboarding steps and events.

const STEP_OVERRIDES: Record<string, string> = {
  saas101: "C'est quoi un SaaS ?",
  analysis: "Analyse de son site",
  revenueGoal: "Objectif de revenus",
  domain: "Son univers",
  loading: "Recherche de l'idée",
  idea: "Révélation de son idée",
  projection: "Projection de revenus",
  barrier: "Écran « barrière »",
  account: "Création du compte",
  todayGoal: "Priorité du moment",
  objective: "Son objectif",
  journey: "Le parcours proposé",
  method: "La méthode",
  commitment: "Engagement",
  plans: "Choix de la formule",
};

export function stepLabel(id: string) {
  if (STEP_OVERRIDES[id]) return STEP_OVERRIDES[id];
  const step = STEPS.find((s) => s.id === id);
  if (step && "kicker" in step && step.kicker) return step.kicker;
  return id;
}

/** The order steps appear in the questionnaire, for the drop-off chart. */
export function stepOrder(id: string) {
  const index = STEPS.findIndex((s) => s.id === id);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

const PLAN_LABELS: Record<string, string> = { monthly: "mensuelle", quarterly: "trimestrielle", annual: "annuelle" };

type Props = Record<string, unknown> | null | undefined;

function text(value: unknown) {
  return value == null ? "" : String(value);
}

export function eventLabel(name: string, props: Props, path?: string | null) {
  const p = props ?? {};
  switch (name) {
    case "page_view":
      return `Visite ${path ?? "une page"}`;
    case "hero_submitted":
      return p.has_idea ? "Écrit son idée sur la page d'accueil" : "Clique sur « Commencer » (accueil)";
    case "onboarding_step":
      return `Questionnaire : ${stepLabel(text(p.step))}`;
    case "idea_revealed":
      return `${p.regenerate ? "Voit une 2e idée" : "Voit son idée"} dans le questionnaire${p.source === "library" ? " (bibliothèque)" : ""}`;
    case "idea_kept":
      return `Garde l'idée « ${text(p.title)} » à ${text(p.price)} €/mois`;
    case "signup_completed":
      return `Crée son compte${p.method === "google" ? " avec Google" : ""}`;
    case "login":
      return `Se connecte${p.method === "google" ? " avec Google" : ""}`;
    case "google_clicked":
      return "Clique sur « Continuer avec Google »";
    case "pricing_viewed":
      return "Voit les prix";
    case "checkout_clicked":
      return `Choisit la formule ${PLAN_LABELS[text(p.plan)] ?? text(p.plan)}${p.tier === "standard" ? " (prix +60\u00a0%)" : p.tier === "launch" ? " (prix de lancement)" : ""}`;
    case "checkout_reminder_sent":
      return "Reçoit l'email de rappel (paiement pas terminé)";
    case "offer_started":
      return "Voit les prix : le compte à rebours de 10 min démarre";
    case "offer_expired":
      return "Laisse expirer l'offre de lancement (prix +60\u00a0%)";
    case "payment_completed": {
      const amount = Number(p.amount);
      const shown = Number.isFinite(amount) ? amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) : text(p.amount);
      return `Paie ${shown} € (formule ${PLAN_LABELS[text(p.plan)] ?? text(p.plan)})${p.recovered ? " via l'email de rappel" : ""}`;
    }
    case "subscription_canceled":
      return "Résilie son abonnement";
    case "in_app_hint_shown":
      return `Voit le message « ouvre dans Safari » (${text(p.app)})`;
    case "open_in_safari_clicked":
      return "Clique sur « Ouvrir dans Safari »";
    case "in_app_link_copied":
      return "Copie le lien pour Safari";
    case "access_code_redeemed":
      return "Utilise un code d'accès";
    case "idea_saved":
      return p.source === "ai" ? "Choisit une idée proposée par l'IA" : "Enregistre sa propre idée";
    case "ideas_generated":
      return p.regenerate ? "Redemande 3 idées à l'IA" : "Demande 3 idées à l'IA";
    case "tool_chosen":
      return `Choisit ${CODE_TOOLS.find((t) => t.id === p.tool)?.name ?? text(p.tool)} pour coder`;
    case "build_prompt_generated":
      return p.regenerate ? "Réécrit son prompt de build" : "Génère son prompt de build";
    case "prompt_copied":
      return `Copie un prompt (${text(p.label)})`;
    case "checklist_toggled": {
      const item = CHECKLIST_ITEMS.find((i) => i.id === p.item)?.label ?? text(p.item);
      return `${p.done ? "Coche" : "Décoche"} « ${item} »`;
    }
    case "mvp_launched":
      return "Déclare sa MVP lancée";
    case "coach_message":
      return p.has_image ? "Envoie une capture au coach IA" : "Écrit au coach IA";
    case "stripe_connected":
      return "Connecte son Stripe";
    case "stripe_disconnected":
      return "Déconnecte son Stripe";
    case "channel_chosen":
      return `Choisit le canal ${text(p.channel)}`;
    case "video_ideas_generated":
      return "Génère des idées de vidéos";
    case "video_saved":
      return "Enregistre le lien de sa vidéo";
    case "views_logged":
      return `Note ${text(p.views)} vues sur sa vidéo`;
    case "recommendation_opened":
      return `Ouvre une recommandation (${text(p.id)})`;
    case "billing_portal_opened":
      return "Ouvre la gestion de son abonnement";
    case "vsl_played":
      return `Lance la vidéo de démo (${text(p.film)})`;
    case "vsl_completed":
      return `Regarde la vidéo de démo jusqu'au bout (${text(p.film)})`;
    case "vsl_cta_clicked":
      return `Clique sur « ${text(p.label)} » à la fin de la vidéo`;
    case "welcome_tour_opened":
      return p.auto ? "Voit la visite guidée après son paiement" : "Ouvre la visite guidée";
    case "connect_clicked":
      return `Clique sur « Se connecter avec ${text(p.provider)} »`;
    case "account_connected":
      return `Connecte son compte ${text(p.provider)}`;
    case "account_disconnected":
      return `Déconnecte son compte ${text(p.provider)}`;
    case "repo_created":
      return p.repo ? `Pilote auto : dépôt GitHub créé (${text(p.repo)})` : "Pilote auto : crée son dépôt GitHub";
    case "database_created":
      return "Pilote auto : lance la création de sa base Supabase";
    case "database_ready":
      return "Pilote auto : sa base Supabase est prête";
    case "build_tool_opened":
      return `Pilote auto : ouvre ${text(p.tool)} pour construire`;
    case "netlify_opened":
      return "Pilote auto : ouvre Netlify";
    case "site_saved":
      return `Pilote auto : site en ligne (${text(p.host)})`;
    case "domain_connected":
      return `Pilote auto : branche son domaine ${text(p.domain)}`;
    default:
      return name;
  }
}

/** Short names for the "actions" table (one row per event name). */
export const ACTION_NAMES: Record<string, string> = {
  hero_submitted: "Commence depuis l'accueil",
  idea_revealed: "Voit son idée (questionnaire)",
  idea_kept: "Garde son idée (questionnaire)",
  signup_completed: "Crée son compte",
  login: "Se connecte",
  google_clicked: "Clique sur Google",
  pricing_viewed: "Voit les prix",
  checkout_clicked: "Clique sur une formule",
  offer_started: "Démarre le chrono de l'offre",
  offer_expired: "Laisse expirer l'offre",
  checkout_reminder_sent: "Reçoit le rappel de paiement",
  payment_completed: "Paie",
  subscription_canceled: "Résilie",
  in_app_hint_shown: "Voit le message Safari",
  open_in_safari_clicked: "Ouvre dans Safari",
  in_app_link_copied: "Copie le lien Safari",
  access_code_redeemed: "Utilise un code d'accès",
  idea_saved: "Choisit son idée",
  ideas_generated: "Demande 3 idées IA",
  tool_chosen: "Choisit son outil",
  build_prompt_generated: "Génère son prompt",
  prompt_copied: "Copie un prompt",
  checklist_toggled: "Coche la checklist",
  mvp_launched: "Lance sa MVP",
  coach_message: "Écrit au coach IA",
  stripe_connected: "Connecte Stripe",
  stripe_disconnected: "Déconnecte Stripe",
  channel_chosen: "Choisit un canal",
  video_ideas_generated: "Idées de vidéos",
  video_saved: "Enregistre sa vidéo",
  views_logged: "Note ses vues",
  recommendation_opened: "Ouvre une recommandation",
  billing_portal_opened: "Gère son abonnement",
  vsl_played: "Lance la vidéo de démo",
  vsl_completed: "Finit la vidéo de démo",
  vsl_cta_clicked: "Clique à la fin de la vidéo",
  account_connected: "Connecte un compte (pilote auto)",
  repo_created: "Dépôt GitHub créé",
  database_ready: "Base Supabase prête",
  build_tool_opened: "Ouvre son outil de code",
  site_saved: "Site en ligne (Netlify)",
  domain_connected: "Domaine branché",
};

export const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct / inconnu",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X (Twitter)",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  google: "Google",
  bing: "Bing",
};

export const DEVICE_LABELS: Record<string, string> = {
  mobile: "Mobile",
  tablet: "Tablette",
  desktop: "Ordinateur",
  inconnu: "Inconnu",
};
