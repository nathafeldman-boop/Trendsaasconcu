import type { Film, ScreenScene, TitleScene } from "@/lib/vsl/types";

// The films. Positions come from `node scripts/capture-vsl.mjs` (rects in
// image pixels); regenerate the screenshots and re-check these numbers
// whenever a captured screen changes layout.
//
// Browser scenes: screen x = 288 + image x, screen y = image y − scroll.

const DEMO = "Données de démonstration";

// ───────── Onboarding (phone)

const answers: ScreenScene = {
  kind: "screen",
  id: "answers",
  chapter: "Tes réponses",
  caption: "Tu réponds à quelques questions : ton temps, ton univers, ton *objectif de revenus*.",
  seconds: 5.5,
  device: "phone",
  image: "/vsl/onb-domain.webp",
  imageHeight: 1385,
  camera: [
    { t: 0, zoom: 1, scroll: 0 },
    { t: 0.3, zoom: 1.04, scroll: 110 },
    { t: 1, x: 270, y: 318, zoom: 1.45, scroll: 110 },
  ],
  cursor: [
    { t: 0.15, x: 120, y: 760 },
    { t: 0.55, x: 300, y: 440 },
    { t: 0.62, x: 300, y: 440, click: true },
    { t: 1, x: 304, y: 446 },
  ],
  highlights: [{ from: 0.64, to: 1, rect: [202, 351, 167, 148] }],
};

const ideaReveal: ScreenScene = {
  kind: "screen",
  id: "idea",
  chapter: "Ton idée",
  caption: "L'IA trouve *ton idée de SaaS*, calée sur ton objectif de revenus.",
  seconds: 6.5,
  device: "phone",
  image: "/vsl/onb-idea.webp",
  imageHeight: 2435,
  camera: [
    { t: 0, zoom: 1.02, scroll: 0 },
    { t: 0.3, x: 195, y: 330, zoom: 1.18, scroll: 40 },
    { t: 0.7, x: 195, y: 330, zoom: 1.5, scroll: 220 },
    { t: 1, x: 195, y: 334, zoom: 1.55, scroll: 222 },
  ],
  highlights: [{ from: 0.6, to: 1, rect: [138, 518, 116, 64] }],
  callouts: [{ from: 0.66, to: 1, x: 196, y: 600, text: "77 clients = 3 000 € par mois" }],
};

const ideaPrice: ScreenScene = {
  kind: "screen",
  id: "price",
  chapter: "Ton idée",
  caption: "Tu *testes ton prix*, et tu vois combien de clients il te faut.",
  seconds: 6,
  device: "phone",
  image: "/vsl/onb-idea.webp",
  imageHeight: 2435,
  camera: [
    { t: 0, x: 195, y: 334, zoom: 1.55, scroll: 222 },
    { t: 0.25, zoom: 1.05, scroll: 560 },
    { t: 0.6, zoom: 1.05, scroll: 1200 },
    { t: 1, x: 195, y: 262, zoom: 1.42, scroll: 1210 },
  ],
  highlights: [{ from: 0.62, to: 1, rect: [26, 1374, 338, 196] }],
  callouts: [{ from: 0.7, to: 1, x: 196, y: 1600, text: "Le prix change, le nombre de clients aussi" }],
};

// ───────── Member area (browser)

const creation: ScreenScene = {
  kind: "screen",
  id: "creation",
  chapter: "Ton plan",
  caption: "Ton *prompt de build* est prêt : un clic, et tu le colles dans Claude Code, Replit ou Lovable.",
  seconds: 7,
  device: "browser",
  url: "saasfounder.fr/espace",
  image: "/vsl/espace-creation.webp",
  sidebar: "/vsl/espace-creation-sidebar.webp",
  imageHeight: 2600,
  camera: [
    { t: 0, zoom: 0.98, scroll: 0, tiltX: 7 },
    { t: 0.22, zoom: 1, scroll: 0, tiltX: 0 },
    { t: 0.6, zoom: 1.12, scroll: 1500 },
    { t: 1, x: 864, y: 330, zoom: 1.55, scroll: 1560 },
  ],
  cursor: [
    { t: 0.62, x: 640, y: 2010 },
    { t: 0.86, x: 914, y: 1712 },
    { t: 0.9, x: 914, y: 1712, click: true },
    { t: 1, x: 920, y: 1718 },
  ],
  highlights: [{ from: 0.64, to: 1, rect: [180, 1690, 792, 386] }],
  callouts: [{ from: 0.91, to: 1, x: 914, y: 1668, text: "Copié", align: "right" }],
};

const pilote: ScreenScene = {
  kind: "screen",
  id: "pilote",
  chapter: "Le pilote auto",
  caption: "Le *pilote auto* crée ton dépôt, ta base de données, et branche ton domaine.",
  seconds: 7.5,
  device: "browser",
  url: "saasfounder.fr/espace/lancement",
  image: "/vsl/espace-pilote.webp",
  sidebar: "/vsl/espace-pilote-sidebar.webp",
  imageHeight: 2175,
  camera: [
    { t: 0, x: 1080, y: 300, zoom: 1.3, scroll: 0 },
    { t: 0.18, x: 720, y: 450, zoom: 1.08, scroll: 0 },
    { t: 0.5, zoom: 1.08, scroll: 420 },
    { t: 0.78, zoom: 1.08, scroll: 1240 },
    { t: 1, zoom: 1.12, scroll: 1280 },
  ],
  highlights: [
    { from: 0.12, to: 0.42, rect: [154, 262, 844, 248] },
    { from: 0.36, to: 0.62, rect: [154, 632, 844, 250] },
    { from: 0.82, to: 1, rect: [154, 1790, 844, 92] },
  ],
  callouts: [
    { from: 0.16, to: 0.44, x: 990, y: 300, text: "Dépôt GitHub créé", align: "right" },
    { from: 0.4, to: 0.64, x: 990, y: 668, text: "Base Supabase prête", align: "right" },
    { from: 0.84, to: 1, x: 990, y: 1800, text: "Domaine branché", align: "right" },
  ],
};

const coach: ScreenScene = {
  kind: "screen",
  id: "coach",
  chapter: "Ton coach IA",
  caption: "Bloqué ? Ton *coach IA* connaît tout ton projet et te donne le prompt exact.",
  seconds: 6.5,
  device: "browser",
  url: "saasfounder.fr/espace/coach",
  image: "/vsl/espace-coach.webp",
  sidebar: "/vsl/espace-coach-sidebar.webp",
  imageHeight: 982,
  camera: [
    { t: 0, zoom: 1, tiltY: -5 },
    { t: 0.35, x: 900, y: 400, zoom: 1.45, tiltY: 0 },
    { t: 1, x: 900, y: 560, zoom: 1.55 },
  ],
  highlights: [{ from: 0.38, to: 1, rect: [642, 372, 246, 34] }],
};

const revenus: ScreenScene = {
  kind: "screen",
  id: "revenus",
  chapter: "Tes revenus",
  caption: "Branche Stripe : ton *MRR*, tes abonnés, et ce qu'il te manque pour ton objectif.",
  seconds: 6.5,
  device: "browser",
  url: "saasfounder.fr/espace/revenus",
  image: "/vsl/espace-revenus.webp",
  sidebar: "/vsl/espace-revenus-sidebar.webp",
  imageHeight: 1450,
  badge: DEMO,
  camera: [
    { t: 0, zoom: 1 },
    { t: 0.38, x: 600, y: 290, zoom: 1.75 },
    { t: 0.72, x: 864, y: 540, zoom: 1.45 },
    { t: 1, x: 864, y: 546, zoom: 1.5 },
  ],
  highlights: [
    { from: 0.25, to: 0.62, rect: [154, 214, 312, 164] },
    { from: 0.68, to: 1, rect: [154, 478, 844, 124] },
  ],
};

const marketing: ScreenScene = {
  kind: "screen",
  id: "marketing",
  chapter: "Tes clients",
  caption: "Pour tes *premiers clients* : ton canal, des idées de vidéos et les messages à envoyer.",
  seconds: 6,
  device: "browser",
  url: "saasfounder.fr/espace/marketing",
  image: "/vsl/espace-marketing.webp",
  sidebar: "/vsl/espace-marketing-sidebar.webp",
  imageHeight: 1490,
  camera: [
    { t: 0, zoom: 1.04, scroll: 0 },
    { t: 0.5, x: 864, y: 430, zoom: 1.35, scroll: 120 },
    { t: 1, x: 864, y: 440, zoom: 1.42, scroll: 150 },
  ],
  cursor: [
    { t: 0.4, x: 620, y: 880 },
    { t: 0.66, x: 380, y: 650 },
    { t: 0.7, x: 380, y: 650, click: true },
    { t: 1, x: 384, y: 656 },
  ],
  highlights: [{ from: 0.72, to: 1, rect: [250, 604, 422, 88] }],
};

// ───────── Title cards

const landingIntro: TitleScene = {
  kind: "intro",
  id: "intro",
  chapter: "SaaSFounder",
  title: "Ton SaaS, de l'idée aux *premiers paiements*.",
  sub: "Regarde comment ça marche, de la première question à ton premier client.",
  seconds: 4.5,
  images: ["/vsl/espace-creation.webp", "/vsl/onb-idea.webp", "/vsl/espace-revenus.webp"],
};

const landingOutro: TitleScene = {
  kind: "outro",
  id: "outro",
  chapter: "À toi",
  title: "Ton idée *t'attend*.",
  sub: "Réponds aux questions : l'IA la trouve pour toi, gratuitement.",
  seconds: 6,
  images: ["/vsl/onb-idea.webp", "/vsl/espace-pilote.webp", "/vsl/espace-coach.webp"],
};

const welcomeIntro: TitleScene = {
  kind: "intro",
  id: "welcome",
  chapter: "Bienvenue",
  title: "Bienvenue dans *ton espace*.",
  sub: "En trente secondes, voilà comment t'en servir.",
  seconds: 4,
  images: ["/vsl/espace-creation.webp", "/vsl/espace-pilote.webp", "/vsl/espace-coach.webp"],
};

const welcomeOutro: TitleScene = {
  kind: "outro",
  id: "start",
  chapter: "C'est parti",
  title: "C'est *parti*.",
  sub: "Ta première étape : ton idée, dans l'onglet Création.",
  seconds: 5,
  images: ["/vsl/espace-creation.webp", "/vsl/espace-revenus.webp", "/vsl/espace-marketing.webp"],
};

/** The landing page's demo: the whole journey, onboarding included. */
export const LANDING_FILM: Film = {
  id: "landing",
  label: "SaaSFounder en une minute",
  scenes: [landingIntro, answers, ideaReveal, ideaPrice, creation, pilote, coach, revenus, marketing, landingOutro],
};

/** In the onboarding, before the account: what the member area holds. */
export const JOURNEY_FILM: Film = {
  id: "journey",
  label: "Ce qui t'attend dans ton espace",
  scenes: [creation, pilote, coach, revenus, marketing],
};

/** Right after paying: a guided tour of the member area. */
export const WELCOME_FILM: Film = {
  id: "welcome",
  label: "Visite guidée de ton espace",
  scenes: [
    welcomeIntro,
    { ...creation, caption: "Commence ici : *ton idée* et ton prompt de build, une étape à la fois." },
    { ...pilote, caption: "Puis le *pilote auto* : connecte GitHub et Supabase, il met tout en place." },
    { ...coach, caption: "Une question, une capture d'écran : ton *coach IA* te répond." },
    { ...revenus, caption: "Branche Stripe pour suivre ton *MRR* en direct." },
    welcomeOutro,
  ],
};
