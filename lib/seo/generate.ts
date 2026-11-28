import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { generateParsed } from "@/lib/claude/generate";
import { FAMILIES, type SeoFamily } from "@/lib/seo/topics";

// Writes one SEO page with Claude. The page must be useful on its own:
// specific to its subject, concrete, honest (no invented figures), and
// pointing to the next step with SaaSFounder only at the end.

// Plain shape for structured output (no length constraints, which the
// output format does not enforce); quality is checked after generation.
export const SeoContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  intro: z.string(),
  sections: z.array(z.object({ heading: z.string(), body: z.string() })),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
});

/** Why a page is not good enough to publish, or null when it is. */
export function qualityProblem(c: SeoContent) {
  const words = [c.intro, ...c.sections.map((s) => s.body), ...c.faq.map((f) => f.a)].join(" ").split(/\s+/).length;
  if (c.title.length < 15 || c.title.length > 90) return "title length";
  if (c.description.length < 80) return "description too short";
  if (c.sections.length < 4) return "too few sections";
  if (c.faq.length < 2) return "too few questions";
  if (words < 700) return `too short (${words} words)`;
  if (/saasfounder/i.test(c.sections.slice(0, -1).map((s) => s.body).join(" "))) return "brand mentioned too early";
  return null;
}

export type SeoContent = z.infer<typeof SeoContentSchema>;

const YEAR = new Date().getFullYear();

const COMMON = `Tu écris pour SaaSFounder (saasfounder.fr), qui aide des débutants (souvent jeunes, sans compétence technique) à créer un petit logiciel en ligne (SaaS) avec l'IA et à le vendre par abonnement.

Règles d'écriture :
- Longueur : une page complète d'environ 1 000 à 1 400 mots au total, en 5 ou 6 sections et 3 à 5 questions de FAQ.
- Français naturel, tutoiement, phrases courtes, concret. Pas de remplissage, pas de banalités qui pourraient s'appliquer à n'importe quel sujet : chaque paragraphe doit être spécifique au sujet de la page.
- N'invente AUCUN chiffre (taille de marché, statistiques, revenus garantis), aucune marque d'outil inexistante, aucun témoignage. Pour les prix, donne des fourchettes prudentes présentées comme des ordres de grandeur.
- Pas de promesse de gains. Reste honnête sur l'effort nécessaire.
- Nous sommes en ${YEAR}. Si tu cites une année (dans le titre ou le texte), c'est ${YEAR} ou ${YEAR + 1}, jamais une année passée.
- Format du champ "body" : Markdown léger uniquement. Paragraphes séparés par une ligne vide, listes avec "- " ou "1. ", gras avec **…**. Pas de titres dans "body" (le titre est dans "heading"), pas de tableaux, pas de liens.
- "title" : titre de page pour Google, accrocheur et précis, sans le nom SaaSFounder, 80 caractères maximum.
- "description" : méta-description de 120 à 150 caractères (pas plus) qui dit ce que le lecteur va obtenir.
- La dernière section peut évoquer, en une ou deux phrases maximum, qu'un outil comme SaaSFounder aide à passer de l'idée au lancement. Jamais ailleurs.`;

const BRIEF: Record<SeoFamily, (topic: string) => string> = {
  idees: (t) => `Sujet : des idées de SaaS (logiciels en ligne par abonnement) à créer pour les ${t}.
Contenu attendu :
- Les vrais problèmes du quotidien des ${t} (tâches répétitives, pertes de temps, pertes d'argent, outils mal adaptés), décrits précisément.
- 4 à 6 idées de SaaS distinctes pour eux : pour chacune, le problème réglé, les 3 fonctionnalités d'une première version, et une fourchette de prix mensuel plausible. Présente chaque idée en gras dans une liste ou un paragraphe.
- Comment valider l'idée et trouver les 10 premiers clients parmi les ${t} (où ils se trouvent, quoi leur dire).
- Les erreurs à éviter avec cette cible.
Titre suggéré dans l'esprit de : « ${FAMILIES.idees.pageTitle(t)} : X idées qui règlent de vrais problèmes ».`,
  application: (t) => `Sujet : créer une application (web) de ${t} sans savoir coder, avec l'IA.
Contenu attendu :
- À qui sert une application de ${t} et quel problème elle règle.
- Les fonctionnalités indispensables d'une première version (MVP), puis celles à garder pour plus tard.
- Les étapes concrètes pour la construire avec des outils de codage IA (décrire précisément ce qu'on demande à l'IA, la base de données, la connexion des utilisateurs, le paiement Stripe si pertinent, la mise en ligne).
- Comment la rentabiliser : modèle (abonnement, commission, paiement unique) et fourchette de prix plausible.
- Comment trouver les premiers utilisateurs.
Titre suggéré dans l'esprit de : « ${FAMILIES.application.pageTitle(t)} : le guide étape par étape ».`,
  argent: (t) => `Sujet : gagner de l'argent avec ${t}.
Contenu attendu :
- Les façons réalistes de gagner de l'argent avec ${t} (services, produits numériques, contenu, petit logiciel...), en précisant pour chacune l'effort, le délai avant les premiers euros et les limites.
- Par où commencer concrètement cette semaine.
- Comment passer d'un revenu ponctuel à un revenu récurrent (par exemple un abonnement ou un petit logiciel lié à ${t}).
- Les pièges et arnaques à éviter, et les obligations de base (déclarer ses revenus, statut de micro-entrepreneur en France).
Titre suggéré dans l'esprit de : « ${FAMILIES.argent.pageTitle(t)} : X méthodes réalistes ».`,
  glossaire: (t) => `Sujet : le terme « ${t} » (vocabulaire du SaaS, de l'IA, du développement ou du business en ligne).
Contenu attendu :
- Une définition simple en 2 ou 3 phrases, compréhensible par un lycéen, dans l'introduction.
- Comment ça marche, avec un exemple concret tiré d'un petit SaaS.
- Pourquoi c'est important quand on lance son SaaS, et comment s'en servir ou le mesurer.
- Les erreurs fréquentes ou confusions avec d'autres termes proches.
Titre suggéré dans l'esprit de : « ${FAMILIES.glossaire.pageTitle(t)} ».`,
  alternatives: (t) => `Sujet : les alternatives à ${t}.
Contenu attendu :
- Ce que fait ${t}, pour qui, et pourquoi des gens cherchent autre chose (prix, limites, complexité, langue, données hébergées hors d'Europe...). Reste factuel et mesuré : ne critique pas sans raison.
- 5 à 8 alternatives qui existent vraiment et que tu connais avec certitude (n'en invente aucune) : pour chacune, en gras, ce qu'elle fait de mieux, à qui elle convient et son modèle (gratuit, freemium, payant). Ne donne pas de prix exacts : les tarifs changent, invite à les vérifier sur le site de l'outil.
- Les options gratuites ou open source, s'il y en a.
- Comment choisir selon son profil (débutant, petite entreprise, créateur, budget serré).
- L'opportunité : les utilisateurs déçus de ${t} sont aussi un marché. Explique comment une alternative spécialisée pour une niche précise peut devenir un petit SaaS rentable.
Titre suggéré dans l'esprit de : « ${FAMILIES.alternatives.pageTitle(t)} (gratuites et payantes) ».`,
  comparatifs: (t) => `Sujet : le comparatif ${t}.
Contenu attendu :
- En deux phrases, ce que fait chacun des deux outils et à qui il s'adresse.
- Les vraies différences, point par point (prise en main, fonctionnalités clés, limites, intégrations, langue, modèle de prix). Présente-les en listes, pas en tableau. Ne donne pas de prix exacts : décris le modèle (gratuit, freemium, abonnement) et invite à vérifier les tarifs actuels.
- Lequel choisir selon le profil : débutant, freelance, petite équipe, projet de SaaS.
- Un verdict clair et nuancé, puis 2 ou 3 autres options à regarder.
- Ne cite que des fonctionnalités dont tu es certain ; si un point évolue souvent, dis-le.
Titre suggéré dans l'esprit de : « ${FAMILIES.comparatifs.pageTitle(t)} Le comparatif honnête ».`,
  jeunes: (t) => `Sujet : « ${t} ».
Lecteur : un jeune de 15 à 25 ans (collège, lycée, études, premier job) qui veut gagner de l'argent en ligne vite, sans capital ni diplôme. Il scrolle TikTok, il se méfie des vendeurs de rêve, il veut du concret qu'il peut faire ce soir avec son téléphone ou son ordinateur.
Contenu attendu :
- Réponds tout de suite à la question dans l'introduction, franchement (y compris si la réponse est « c'est difficile » ou « c'est une arnaque »).
- 4 à 7 pistes réalistes adaptées à sa situation, chacune avec : ce qu'il faut faire concrètement, le temps avant les premiers euros, ce que ça peut rapporter présenté comme un ordre de grandeur prudent, et la limite.
- Un plan d'action pour les 7 prochains jours, étape par étape.
- Les arnaques et pièges à éviter (formations miracles, « argent facile », paiements demandés d'avance).
- Si l'âge ou le statut compte (mineur, étudiant) : ce qu'il faut savoir sur l'autorisation parentale, la micro-entreprise, la déclaration des revenus et l'ouverture d'un compte, en restant général et en renvoyant vers service-public.fr ou l'URSSAF pour les règles exactes. N'invente aucun seuil ni aucun chiffre légal.
- Dans la dernière section, montre en deux ou trois phrases qu'un petit logiciel par abonnement (SaaS) est la piste qui construit un revenu chaque mois, et que SaaSFounder lui trouve une idée adaptée, le prompt qui construit son site avec l'IA et son plan pour trouver ses premiers clients, avec un questionnaire gratuit de deux minutes pour commencer.
Ton : direct, motivant mais honnête, tutoiement, comme un grand frère qui a déjà essayé. Pas de promesse de richesse.
Titre : la question reformulée de façon accrocheuse, avec un bénéfice concret, en 50 à 80 caractères maximum (ex. « Gagner de l'argent à 16 ans : 7 idées qui marchent vraiment »).`,
};

export async function writeSeoPage(family: SeoFamily, topic: string) {
  const response = await generateParsed({
    max_tokens: 12000,
    output_config: { effort: "low", format: betaZodOutputFormat(SeoContentSchema) },
    system: COMMON,
    messages: [{ role: "user", content: `${BRIEF[family](topic)}\n\nÉcris la page complète.` }],
  });
  if (!response) throw new Error("Claude not configured");
  const parsed = SeoContentSchema.safeParse(response.parsed_output);
  if (response.stop_reason === "refusal" || !parsed.success) {
    throw new Error(`unusable response (${response.stop_reason})`);
  }
  const content = { ...parsed.data, description: clip(parsed.data.description, 160) };
  const problem = qualityProblem(content);
  if (problem) throw new Error(`quality: ${problem}`);
  return { content, model: response.model };
}

function clip(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
