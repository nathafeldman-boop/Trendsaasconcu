import { NextResponse } from "next/server";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { generateParsed } from "@/lib/claude/generate";
import { isOverBudget, openAiSession, OVER_BUDGET_MESSAGE, recordUsage, budgetUsedPercent } from "@/lib/claude/guard";
import { buildProjectContext } from "@/lib/claude/project-context";
import { IdeasSchema } from "@/lib/espace/ideas";

// Opus can take a while on three detailed ideas.
export const maxDuration = 60;

const SYSTEM = `Tu es l'expert idées de SaaSFounder. Tu proposes à un débutant 3 idées de SaaS faites pour son profil, qu'il pourra construire avec un outil de codage IA (Claude Code, Replit, Lovable) et vendre par abonnement.

Règles :
- Chaque idée fait gagner de l'argent ou du temps à celui qui paie : un problème qui coûte déjà quelque chose à une cible précise.
- Application web uniquement, rien à publier sur un store.
- Respecte strictement le profil : temps disponible, ce qu'il refuse de faire (ex : pas d'appels, pas de vidéo face caméra), cible préférée (pros ou particuliers), échéance, budget.
- Une MVP réaliste : 3 à 5 fonctionnalités, constructible par un débutant avec l'IA dans le délai indiqué.
- Prix mensuel cohérent avec la cible (les pros paient plus que les particuliers).
- « why_you » explique en une phrase pourquoi cette idée colle à SA situation, en citant ses réponses.
- « first_customers » : où et comment trouver les 10 premiers clients, concrètement.
- N'invente aucun chiffre de marché ni témoignage. Français, tutoiement, phrases courtes.
- Exactement 3 idées, différentes entre elles.`;

export async function POST(request: Request) {
  const opened = await openAiSession();
  if ("response" in opened) return opened.response;
  const { session } = opened;

  const body = (await request.json().catch(() => ({}))) as { regenerate?: boolean };

  const { data: builder } = await session.supabase
    .from("builder_progress")
    .select("ai_ideas")
    .eq("user_id", session.userId)
    .maybeSingle();
  const cached = IdeasSchema.safeParse(builder?.ai_ideas);
  if (cached.success && cached.data.ideas.length && !body.regenerate) {
    return NextResponse.json({ ideas: cached.data.ideas, source: "cache", budgetUsed: budgetUsedPercent(session.spentUsd, session.budgetUsd) });
  }

  if (isOverBudget(session)) {
    return NextResponse.json({ ideas: null, source: "budget", message: OVER_BUDGET_MESSAGE, budgetUsed: 100 });
  }

  const context = await buildProjectContext(session);

  try {
    const response = await generateParsed({
      max_tokens: 8000,
      output_config: { effort: "medium", format: betaZodOutputFormat(IdeasSchema) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Voici mon profil et mon projet :\n\n${context.text}\n\nPropose-moi mes 3 idées de SaaS.`,
        },
      ],
    });
    if (!response) return NextResponse.json({ ideas: null, source: "fallback" });

    const spent = await recordUsage(session, response.model, response.usage);
    const parsed = IdeasSchema.safeParse(response.parsed_output);
    if (response.stop_reason === "refusal" || !parsed.success) {
      console.error("ideas: unusable response", response.stop_reason);
      return NextResponse.json({ ideas: null, source: "fallback", budgetUsed: budgetUsedPercent(spent, session.budgetUsd) });
    }

    const ideas = parsed.data.ideas.slice(0, 3);
    await session.supabase.from("builder_progress").upsert({ user_id: session.userId, ai_ideas: { ideas } });
    return NextResponse.json({ ideas, source: "claude", budgetUsed: budgetUsedPercent(spent, session.budgetUsd) });
  } catch (error) {
    console.error("ideas: generation failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ ideas: null, source: "fallback" });
  }
}
