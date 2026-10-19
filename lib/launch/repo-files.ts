import type { RepoFile } from "@/lib/connections/github";

// The files the autopilot commits to the member's new repository: the full
// brief their coding tool reads by itself (CLAUDE.md for Claude Code,
// replit.md for Replit's Agent), the Netlify settings and the env template.
// Pure functions of the idea and the Supabase project, so a later sync can
// tell whether a file is still exactly what we wrote.

export type RepoInputs = {
  ideaText: string;
  supabaseUrl: string | null;
  supabaseKey: string | null;
};

export type ParsedIdea = { title: string; pitch: string | null; price: number | null; mvp: string[] };

/** Reads back the "Titre : pitch / Prix : … / MVP : a ; b" format of ideaToText; free text keeps a generic title. */
export function parseIdea(ideaText: string): ParsedIdea {
  const lines = ideaText.split("\n").map((l) => l.trim());
  const first = lines[0] ?? "";
  const structured = lines.some((l) => l.startsWith("MVP :"));
  const [title, ...pitch] = structured ? first.split(" : ") : ["Mon SaaS"];
  const priceLine = lines.find((l) => l.startsWith("Prix :"));
  const price = priceLine ? Number(priceLine.replace(/[^\d.,]/g, "").replace(",", ".")) : NaN;
  const mvpLine = lines.find((l) => l.startsWith("MVP :"));
  return {
    title: title.trim() || "Mon SaaS",
    pitch: pitch.join(" : ").trim() || null,
    price: Number.isFinite(price) && price > 0 ? price : null,
    mvp: mvpLine ? mvpLine.slice("MVP :".length).split(";").map((s) => s.trim()).filter(Boolean) : [],
  };
}

/** A GitHub-safe repository name from the idea's title. */
export function repoSlug(title: string) {
  const slug = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return slug || "mon-saas";
}

const PENDING = "à venir : crée ta base depuis l'onglet Pilote auto de SaaSFounder";

function claudeMd({ ideaText, supabaseUrl, supabaseKey }: RepoInputs) {
  const idea = parseIdea(ideaText);
  const feature = idea.mvp.length ? idea.mvp.map((f) => `   - ${f}`).join("\n") : "   - la fonctionnalité principale décrite plus haut";
  return `# ${idea.title}

> Cahier des charges écrit par SaaSFounder. Claude Code le lit au début de chaque session :
> suis-le étape par étape.

## Le projet

${ideaText}

## La stack

- Next.js (App Router, TypeScript) et Tailwind CSS
- Supabase : comptes (email et mot de passe) et base de données
- Stripe Checkout : abonnement mensuel${idea.price ? ` à ${idea.price} € par mois` : ""}
- Hébergement : Netlify (\`netlify.toml\` est déjà prêt)

## Les clés

- \`NEXT_PUBLIC_SUPABASE_URL\` = ${supabaseUrl ?? PENDING}
- \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\` = ${supabaseKey ?? PENDING}

Ces deux valeurs sont publiques : elles sont aussi dans \`.env.example\` et \`netlify.toml\`.
Une clé secrète (Stripe \`sk_...\`, clé secrète Supabase) ne va jamais dans le code ni dans Git :
seulement dans \`.env.local\` et dans les variables d'environnement de Netlify.

## La base de données

La table \`profiles\` existe déjà (id, email, full_name, plan, stripe_customer_id, created_at).
Elle se remplit toute seule à chaque inscription et elle est protégée par RLS.
Ajoute les autres tables avec des fichiers SQL dans \`supabase/migrations/\`, avec RLS activé sur chacune.

## Le plan

Une étape à la fois. À la fin de chacune : \`npm run build\` sans erreur, puis un commit.

1. La page d'accueil : la promesse, le problème réglé, le prix, un bouton « Commencer ».
2. L'inscription et la connexion avec Supabase (\`/inscription\`, \`/connexion\`), et un espace \`/app\` réservé aux comptes connectés.
3. La première version du produit dans \`/app\` :
${feature}
4. Le paiement : Stripe Checkout en abonnement ; \`/app\` est réservé aux abonnés.
5. La mise en ligne sur Netlify.

## Les règles

- Interface en français, simple, pensée d'abord pour le téléphone.
- Ne supprime jamais de données et ne change aucun réglage Supabase ou Stripe sans me le demander.
- Après chaque étape, dis-moi en une phrase ce que tu as fait et ce que je dois tester.
`;
}

function replitMd(inputs: RepoInputs) {
  return `# ${parseIdea(inputs.ideaText).title}

Le cahier des charges complet est dans \`CLAUDE.md\` : lis-le avant d'écrire du code,
et suis son plan une étape à la fois.
`;
}

function netlifyToml({ supabaseUrl, supabaseKey }: RepoInputs) {
  const env =
    supabaseUrl && supabaseKey
      ? `
# Valeurs publiques uniquement : les secrets vont dans les réglages Netlify.
[build.environment]
  NEXT_PUBLIC_SUPABASE_URL = "${supabaseUrl}"
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "${supabaseKey}"
`
      : "";
  return `# Réglages Netlify pour une app Next.js (écrits par SaaSFounder).
[build]
  command = "npm run build"
  publish = ".next"
${env}`;
}

function envExample({ supabaseUrl, supabaseKey }: RepoInputs) {
  return `# Copie ce fichier en .env.local pour lancer le projet sur ton ordinateur.
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl ?? ""}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${supabaseKey ?? ""}

# Secrets : seulement dans .env.local et dans Netlify, jamais dans Git.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
`;
}

function readme(inputs: RepoInputs) {
  const idea = parseIdea(inputs.ideaText);
  return `# ${idea.title}

${idea.pitch ?? ""}

Projet préparé avec [SaaSFounder](https://www.saasfounder.fr). Le plan de construction est dans \`CLAUDE.md\`.
`;
}

const GITIGNORE = `node_modules
.next
out
.netlify
.env*.local
.env
.DS_Store
`;

/** Every file the autopilot owns, for the first commit and for later syncs. */
export function repoFiles(inputs: RepoInputs): RepoFile[] {
  return [
    { path: "CLAUDE.md", content: claudeMd(inputs) },
    { path: "replit.md", content: replitMd(inputs) },
    { path: "netlify.toml", content: netlifyToml(inputs) },
    { path: ".env.example", content: envExample(inputs) },
    { path: "README.md", content: readme(inputs) },
    { path: ".gitignore", content: GITIGNORE },
  ];
}
