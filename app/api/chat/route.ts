import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { CHAT_MODEL, getClaude, imageBlockFromDataUrl, textOf } from "@/lib/claude/client";
import { budgetUsedPercent, isOverBudget, openAiSession, OVER_BUDGET_MESSAGE, recordUsage } from "@/lib/claude/guard";
import { buildProjectContext } from "@/lib/claude/project-context";

export const maxDuration = 30;

const COACH_SYSTEM = `Tu es le coach IA de SaaSFounder, un mini-accompagnement qui aide des débutants à lancer leur premier SaaS avec l'IA : trouver l'idée, la construire avec un outil de codage IA (Claude Code, Replit, Lovable, Cursor), la mettre en ligne (Vercel, Hostinger), gérer les données (Supabase), encaisser avec Stripe et trouver les premiers clients.

Tu connais le projet de la personne (contexte ci-dessous, tiré de son compte) : appuie-toi dessus, reprends son idée, ses réponses et ses chiffres, et ne lui redemande pas ce que tu sais déjà.

Comment tu réponds :
- En français, en tutoyant, ton direct et encourageant, sans jargon non expliqué.
- Concret : la prochaine action à faire, en étapes numérotées courtes.
- Quand il faut coder ou modifier son site, donne le prompt exact à coller dans son outil de codage, dans un bloc de code.
- Si la demande est floue, pose d'abord 2 ou 3 questions courtes.
- Si une capture d'écran est jointe, dis ce que tu vois et comment résoudre le problème visible.
- Moins de 250 mots, sauf si on te demande un prompt ou un texte complet.
- N'invente jamais de chiffres, de résultats garantis ni de fonctionnalités de SaaSFounder. Pour les prix des outils tiers, dis de vérifier sur leur site.

L'espace SaaSFounder a 5 onglets que tu peux recommander : Création de SaaS (idée, prompt de build, hébergement, base de données, paiements, checklist de lancement), Pilote auto (il connecte GitHub, Supabase et Hostinger, crée son dépôt avec le plan complet, sa base de données, et branche son domaine sur Netlify : c'est le chemin le plus court, recommande-le quand il bloque sur la mise en place), Coach IA (toi), Revenus (Stripe connecté : MRR, prix, recommandations) et Marketing (canal, idées de vidéos, suivi des vues).

Quand son dépôt a été créé par le Pilote auto, son outil de code a déjà tout le plan : le prompt à lui donner est simplement « Lis CLAUDE.md et construis l'étape suivante du plan », éventuellement avec la précision qui manque.`;

const MAX_IMAGE_DATA_URL_LENGTH = 6_000_000;

type IncomingMessage = { role: string; content: string };

export async function POST(request: Request) {
  const opened = await openAiSession();
  if ("response" in opened) return opened.response;
  const { session } = opened;

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (isOverBudget(session)) {
    return NextResponse.json({ reply: OVER_BUDGET_MESSAGE, source: "budget", budgetUsed: 100 });
  }

  const claude = getClaude();
  if (!claude) {
    return NextResponse.json({
      reply:
        "Le coach IA n'est pas encore branché (il manque la clé Claude côté serveur). En attendant, suis les recommandations de ton espace.",
      source: "fallback",
    });
  }

  // The last 12 turns are plenty for a coaching thread and keep each call cheap.
  const history = (body.messages as unknown[])
    .filter((m): m is IncomingMessage => !!m && typeof m === "object" && "role" in m && "content" in m)
    .slice(-12)
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content).slice(0, 2000),
    }));
  // The greeting shown in the UI is an assistant turn with nothing before it;
  // the API needs the conversation to start on the user.
  const firstUser = history.findIndex((m) => m.role === "user");
  const turns = firstUser === -1 ? [] : history.slice(firstUser);
  if (!turns.length) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const image =
    typeof body.image === "string" && body.image.startsWith("data:image/") && body.image.length <= MAX_IMAGE_DATA_URL_LENGTH
      ? imageBlockFromDataUrl(body.image)
      : null;

  const messages: Anthropic.MessageParam[] = turns.map((m, i) =>
    i === turns.length - 1 && image && m.role === "user"
      ? { role: "user", content: [image, { type: "text", text: m.content || "Que vois-tu sur cette capture ?" }] }
      : m
  );

  try {
    const context = await buildProjectContext(session, { stripe: true });
    const response = await claude.messages.create({
      model: CHAT_MODEL,
      max_tokens: 2000,
      output_config: { effort: "low" },
      // The system prompt and project brief stay identical across a
      // conversation, so later turns read them from the cache.
      cache_control: { type: "ephemeral" },
      system: [
        { type: "text", text: COACH_SYSTEM },
        { type: "text", text: `Contexte du projet de la personne :\n\n${context.text}` },
      ],
      messages,
    });
    const spent = await recordUsage(session, response.model, response.usage);
    const reply =
      response.stop_reason === "refusal"
        ? "Je ne peux pas t'aider sur ce point précis. Reformule ta question autour de ton SaaS et je m'y mets."
        : textOf(response.content);
    return NextResponse.json({
      reply: reply ?? "Je n'ai pas réussi à répondre, réessaie dans un instant.",
      source: "claude",
      budgetUsed: budgetUsedPercent(spent, session.budgetUsd),
    });
  } catch (error) {
    console.error("chat: Claude call failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ reply: "Le coach est momentanément indisponible, réessaie dans un instant.", source: "error" });
  }
}
