// Screenshots of the real app for the VSL players (components/vsl), saved as
// WebP in public/vsl. Run against a dev server (the member-area scenes come
// from app/vsl-capture, which only exists in development):
//
//   npx next dev -p 3100
//   node scripts/capture-vsl.mjs http://localhost:3100
//
// It also prints where the key elements are ([x, y, width, height] in CSS
// pixels of each image), which the camera keyframes in lib/vsl/scenes.ts
// are written against.
// Set PLAYWRIGHT_CHROMIUM to a Chromium binary if Playwright can't find one.

import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const sharp = require("sharp");

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = path.join(process.cwd(), "public", "vsl");
const MAX_CSS_HEIGHT = 2600;

// The onboarding answers of the demo member (same story as app/vsl-capture/demo.ts).
const ANSWERS = {
  age: "19-30",
  experience: "jamais",
  dream: "liberte",
  brake: "methode",
  persistence: 4,
  hours: "mid",
  revenueGoal: 3000,
  domain: "beaute",
  market: "b2b",
  lever_contenu: "oui",
  lever_prospection: "oui",
};
const IDEA_INPUT_KEYS = ["age", "experience", "currentIncome", "platforms", "site", "dream", "dream_libre", "brake", "brake_libre", "persistence", "hours", "revenueGoal", "domain", "domain_libre", "market"];
const IDEA = {
  title: "RappelBeauté",
  pitch: "Moins de rendez-vous manqués et des clientes qui reviennent, sans y penser.",
  target: "Instituts de beauté, ongleries et barbiers indépendants",
  problem: "Les rendez-vous non honorés et les clientes qui ne reviennent pas font perdre du chiffre chaque semaine.",
  price_per_month: 39,
  mvp: ["Prise de rendez-vous en ligne avec acompte", "Rappel automatique la veille", "Relance des clientes absentes depuis 6 semaines", "Fiche cliente avec l'historique"],
  why_you: "Tu as choisi la beauté et les pros : des commerces nombreux, faciles à contacter, et qui paient pour remplir leur agenda.",
  build_time: "2 à 3 semaines",
  first_customers: "Contacte les instituts de ton secteur sur Instagram et Google Maps, montre la démo sur ton téléphone et offre le premier mois.",
};

function onboardingState(stepId, withIdea) {
  const input = {};
  for (const key of IDEA_INPUT_KEYS) if (ANSWERS[key] !== undefined) input[key] = ANSWERS[key];
  const answers = withIdea
    ? { ...ANSWERS, found_idea: JSON.stringify(IDEA), found_idea_for: JSON.stringify(input) }
    : { ...ANSWERS };
  return JSON.stringify({ stepId, answers });
}

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 };
// The member area's left column stays put while the page scrolls: it's
// captured on its own, and the player scrolls only the content next to it.
const SIDEBAR = 288;
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true };

const SCENES = [
  { name: "espace-creation", url: "/vsl-capture/creation", device: DESKTOP, sidebar: true, targets: { title: "h1", progress: "text=de ton lancement", stages: "nav[aria-label='Étapes']", idea: "#idee", ideaText: "#idee >> text=RappelBeauté", code: "#code", promptTitle: "text=Ton prompt de build pour", prompt: "#code pre" } },
  { name: "espace-pilote", url: "/vsl-capture/pilote", device: DESKTOP, sidebar: true, targets: { title: "h1", counter: "text=5/5", step1: "text=Ton dépôt GitHub, avec tout le plan dedans", repo: "text=Dépôt créé", step2: "text=Ta base de données Supabase", database: "text=Ta base est prête", build: "text=Construis ton SaaS avec l'IA", firstLine: "text=Lis CLAUDE.md et construis", site: "text=Mets ton site en ligne sur Netlify", domain: "text=pointe vers ton site" } },
  { name: "espace-coach", url: "/vsl-capture/coach", device: DESKTOP, sidebar: true, targets: { question: "text=Comment je trouve mes 10 premiers instituts", answer: "text=390 € qui tombent", prompt: "text=Écris un message Instagram", input: "textarea" } },
  { name: "espace-revenus", url: "/vsl-capture/revenus", device: DESKTOP, sidebar: true, targets: { title: "h1", mrr: "text=revenu mensuel récurrent", grid: "text=Abonnés actifs", goal: "text=Ton objectif", recs: "text=Tes prochaines actions", prices: "text=Tes prix en cours" } },
  { name: "espace-marketing", url: "/vsl-capture/marketing", device: DESKTOP, sidebar: true, targets: { title: "h1", recs: "text=Publie ta première vidéo", channel: "text=Ton canal et tes idées de vidéos", tiktok: "text=De la portée sans abonnés", video: "text=Ta vidéo publiée" } },
  { name: "onb-domain", url: "/commencer", storage: onboardingState("domain", false), device: PHONE, targets: { title: "h1", beaute: "text=Beauté", grid: "text=Sport et bien-être", other: "text=Autre chose" } },
  { name: "onb-idea", url: "/commencer", storage: onboardingState("idea", true), device: PHONE, targets: { title: "h1", card: "h2", customers: "text=clients pour", problem: "text=Le problème", mvp: "text=Ce que tu construis", price: "text=Teste ton prix", locked: "text=Ton prompt de build", keep: "text=Je garde cette idée" } },
  { name: "onb-projection", url: "/commencer", storage: onboardingState("projection", true), device: PHONE, targets: { title: "h1", potential: "text=Ton potentiel" } },
];

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
await mkdir(OUT, { recursive: true });
const report = {};

for (const scene of SCENES) {
  const context = await browser.newContext({ ...scene.device, locale: "fr-FR", reducedMotion: "no-preference" });
  if (scene.storage) {
    await context.addInitScript((value) => {
      if (!sessionStorage.getItem("vsl-seeded")) {
        localStorage.setItem("saasfounder-onboarding-v2", value);
        sessionStorage.setItem("vsl-seeded", "1");
      }
    }, scene.storage);
  }
  const page = await context.newPage();
  await page.goto(BASE + scene.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  // No dev overlay and no sign-out strip in the shots; the sidebar then
  // starts at the very top.
  await page.addStyleTag({
    content: "nextjs-portal, [data-nextjs-toast], [data-next-badge-root] { display: none !important; } aside { top: 0 !important; height: 100vh !important; }",
  });
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("div.sticky")) {
      if (el.textContent?.trim() === "Déconnexion") el.style.display = "none";
    }
  });
  await page.waitForTimeout(300);

  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const height = Math.min(fullHeight, MAX_CSS_HEIGHT);
  const left = scene.sidebar ? SIDEBAR : 0;
  const width = scene.device.viewport.width - left;
  const png = await page.screenshot({ fullPage: true, clip: { x: left, y: 0, width, height } });
  await sharp(png).webp({ quality: 82, effort: 6 }).toFile(path.join(OUT, `${scene.name}.webp`));
  if (scene.sidebar) {
    const side = await page.screenshot({ clip: { x: 0, y: 0, width: SIDEBAR, height: scene.device.viewport.height } });
    await sharp(side).webp({ quality: 82, effort: 6 }).toFile(path.join(OUT, `${scene.name}-sidebar.webp`));
  }

  // Positions in CSS pixels of the saved image (what the player's camera,
  // cursor and highlights use).
  const rects = {};
  for (const [key, selector] of Object.entries(scene.targets)) {
    const box = await page.locator(selector).first().boundingBox().catch(() => null);
    if (!box) continue;
    rects[key] = [Math.round(box.x - left), Math.round(box.y), Math.round(box.width), Math.round(box.height)];
  }
  report[scene.name] = { width, height, rects };
  console.error(`✓ ${scene.name} ${width}x${height}`);
  await context.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
