import { NextResponse } from "next/server";
import { CHAT_MODEL, getClaude, textOf } from "@/lib/claude/client";
import { generate } from "@/lib/claude/generate";
import { budgetUsedPercent, isOverBudget, openAiSession, OVER_BUDGET_MESSAGE, recordUsage } from "@/lib/claude/guard";
import { buildProjectContext } from "@/lib/claude/project-context";
import { CODE_TOOLS } from "@/lib/espace/content";

// The build prompt is long and can take a while.
export const maxDuration = 60;

function fallbackBuildPrompt(idea: string, tool: string) {
  return `Je veux créer un SaaS avec l'idée suivante : "${idea}".

Construis-moi une landing page, un système d'inscription et de connexion, et la page principale de l'application, avec ${tool}.

Contraintes :
- Design moderne et sobre, pas de template générique.
- Mobile-first.
- Un seul appel à l'action clair sur la landing page.
- Un formulaire d'inscription simple (email + mot de passe).

Avant de coder, propose-moi un plan en 5 étapes.`;
}

function fallbackContentIdeas(idea: string) {
  return [
    `Montre en 3 secondes le problème que "${idea}" résout, avant de montrer la solution.`,
    "Filme ton écran en train d'utiliser ton propre produit, en story, pas en publicité polie.",
    "Réponds à une critique ou une question fréquente de ton marché, en vidéo courte.",
  ];
}

const BUILD_SYSTEM = `Tu écris des prompts de build pour SaaSFounder : le texte qu'un débutant va coller tel quel dans son outil de codage IA pour construire la première version de son SaaS.

Le prompt que tu écris doit :
- Être écrit à la première personne, adressé à l'outil (« Construis-moi... »), en français, environ 600 à 900 mots, structuré avec des titres courts.
- Couvrir : le produit et sa cible en 2 phrases ; le périmètre strict de la MVP (3 à 5 fonctionnalités, et ce qui est hors périmètre) ; les pages (landing avec promesse + bénéfices + prix, inscription/connexion, tableau de bord, page tarifs) ; les données à stocker ; l'authentification et la base (Supabase, sécurité RLS) ; les paiements par abonnement (Stripe Checkout + webhook + portail client) au prix indiqué ; la mise en ligne (Vercel, variables d'environnement) ; une direction design précise (pas de template générique, mobile-first) ; un premier parcours où l'utilisateur obtient un résultat en moins de 3 minutes.
- S'adapter au niveau : si la personne débute, demander à l'outil d'expliquer chaque étape simplement, une commande à la fois, et de vérifier avec elle avant de passer à la suite.
- S'adapter à l'outil choisi (Claude Code travaille dans un dossier local, Replit et Lovable dans le navigateur).
- Finir par : « Avant d'écrire du code, propose-moi un plan en étapes et attends ma validation. »
Réponds uniquement avec le prompt, sans commentaire autour, sans bloc de code.`;

const CONTENT_SYSTEM =
  "Tu es le coach marketing de SaaSFounder pour des créateurs de SaaS débutants. Tu proposes 3 idées de vidéos courtes concrètes, adaptées au produit, à la cible et au canal indiqué, et à ce que la personne accepte de faire (si elle refuse de se montrer, propose des formats sans visage : écran filmé, texte, carrousel). Chaque idée tient en une ou deux phrases et commence par l'accroche des 3 premières secondes entre guillemets. Une idée par ligne, sans numérotation ni introduction.";

export async function POST(request: Request) {
  const opened = await openAiSession();
  if ("response" in opened) return opened.response;
  const { session } = opened;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.kind !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: builder } = await session.supabase
    .from("builder_progress")
    .select("idea_text, build_prompt, build_prompt_key")
    .eq("user_id", session.userId)
    .maybeSingle();
  const idea = String(builder?.idea_text || body.idea || "").trim().slice(0, 2000);

  if (body.kind === "content") {
    const channel = typeof body.tool === "string" ? body.tool.slice(0, 40) : "TikTok";
    const claude = getClaude();
    if (!claude || isOverBudget(session)) {
      return NextResponse.json({ ideas: fallbackContentIdeas(idea || "ton SaaS"), source: "fallback" });
    }
    try {
      const context = await buildProjectContext(session);
      const response = await claude.messages.create({
        model: CHAT_MODEL,
        max_tokens: 1500,
        output_config: { effort: "low" },
        system: CONTENT_SYSTEM,
        messages: [{ role: "user", content: `${context.text}\n\nCanal choisi : ${channel}. Donne-moi 3 idées de vidéos.` }],
      });
      const spent = await recordUsage(session, response.model, response.usage);
      const ideas = (textOf(response.content) ?? "")
        .split("\n")
        .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
      if (ideas.length) return NextResponse.json({ ideas, source: "claude", budgetUsed: budgetUsedPercent(spent, session.budgetUsd) });
    } catch (error) {
      console.error("prompt/content: failed:", error instanceof Error ? error.message : error);
    }
    return NextResponse.json({ ideas: fallbackContentIdeas(idea || "ton SaaS"), source: "fallback" });
  }

  const tool = CODE_TOOLS.find((t) => t.id === body.tool);
  const toolName = tool?.name ?? "l'outil de ton choix";
  if (!idea) return NextResponse.json({ error: "No idea yet" }, { status: 400 });

  // Same idea + same tool = same prompt: serve the stored one instead of paying again.
  const key = `${tool?.id ?? "autre"}::${idea}`;
  if (builder?.build_prompt && builder.build_prompt_key === key && !body.regenerate) {
    return NextResponse.json({ prompt: builder.build_prompt, source: "cache", budgetUsed: budgetUsedPercent(session.spentUsd, session.budgetUsd) });
  }
  if (isOverBudget(session)) {
    return NextResponse.json({ prompt: fallbackBuildPrompt(idea, toolName), source: "budget", message: OVER_BUDGET_MESSAGE });
  }

  try {
    const context = await buildProjectContext(session);
    const response = await generate({
      max_tokens: 6000,
      output_config: { effort: "low" },
      system: BUILD_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${context.text}\n\nOutil de codage choisi : ${toolName}.\nÉcris le prompt de build pour cette idée : ${idea}`,
        },
      ],
    });
    if (!response) return NextResponse.json({ prompt: fallbackBuildPrompt(idea, toolName), source: "fallback" });

    const spent = await recordUsage(session, response.model, response.usage);
    const prompt = textOf(response.content)?.trim();
    if (!prompt || response.stop_reason === "refusal") {
      return NextResponse.json({ prompt: fallbackBuildPrompt(idea, toolName), source: "fallback" });
    }
    await session.supabase
      .from("builder_progress")
      .upsert({ user_id: session.userId, build_prompt: prompt, build_prompt_key: key });
    return NextResponse.json({ prompt, source: "claude", budgetUsed: budgetUsedPercent(spent, session.budgetUsd) });
  } catch (error) {
    console.error("prompt/build: failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ prompt: fallbackBuildPrompt(idea, toolName), source: "fallback" });
  }
}
