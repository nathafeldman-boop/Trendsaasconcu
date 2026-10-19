import { NextResponse } from "next/server";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { Answers } from "@/components/onboarding/funnel";
import { BOT_PATTERN } from "@/lib/analytics/server";
import { CHAT_MODEL, costOf, getClaude } from "@/lib/claude/client";
import { describeAnswers } from "@/lib/claude/project-context";
import { IdeaSchema } from "@/lib/espace/ideas";
import { IDEA_INPUT_KEYS, type FoundIdea } from "@/lib/onboarding/found-idea";
import { libraryIdea } from "@/lib/onboarding/idea-library";
import { createAdminClient } from "@/lib/supabase/admin";

// The idea revealed during the onboarding, before the visitor has an
// account: public, so it runs on the fast, cheap model, with a per-IP limit
// and a daily spend cap across all visitors (public_ai_usage). Whenever
// Claude can't or shouldn't be called, a hand-written idea for the same
// universe is served instead, so the reveal never fails.

export const maxDuration = 30;

const DAILY_BUDGET_USD = Number(process.env.PUBLIC_AI_DAILY_BUDGET_USD) || 1;

// Per server instance: enough for a regenerate or two, not for a script.
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string) {
  const now = Date.now();
  if (hits.size > 10_000) hits.clear();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const SYSTEM = `Tu es l'expert idées de SaaSFounder. Un visiteur vient de répondre à notre questionnaire : propose-lui UNE idée de SaaS faite pour lui, qu'un débutant peut construire avec un outil de codage IA (Claude Code, Replit, Lovable) et vendre par abonnement.

Règles :
- L'idée règle un problème qui coûte déjà du temps ou de l'argent à une cible précise, dans l'univers qu'il a choisi (s'il n'en a pas choisi, prends celui qui colle le mieux à son profil).
- Application web uniquement, rien à publier sur un store. Pas de données de santé ni d'activité réglementée.
- Respecte son profil : temps disponible, cible préférée (pros ou particuliers), objectif de revenus.
- Prix mensuel réaliste pour la cible : en général 19 à 99 € pour des pros, 5 à 15 € pour des particuliers. Le nombre de clients nécessaire pour atteindre son objectif doit rester atteignable.
- « title » : un nom de produit court et parlant (1 à 3 mots), jamais une marque existante.
- « pitch » : une phrase de 15 mots maximum.
- « mvp » : 3 à 5 fonctionnalités, chacune en quelques mots, constructibles avec l'IA en quelques semaines.
- « why_you » : une phrase qui explique pourquoi cette idée colle à SA situation, en citant ses réponses.
- « build_time » : une durée courte, par exemple « 2 à 3 semaines ».
- « first_customers » : où et comment trouver ses 10 premiers clients, concrètement, en deux phrases.
- N'invente aucun chiffre de marché ni témoignage. Français, tutoiement, phrases courtes.`;

function cleanAnswers(raw: unknown) {
  const answers: Answers = {};
  if (!raw || typeof raw !== "object") return answers;
  const source = raw as Record<string, unknown>;
  for (const key of IDEA_INPUT_KEYS) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) answers[key] = value.trim().slice(0, 200);
    else if (typeof value === "number" && Number.isFinite(value)) answers[key] = value;
  }
  return answers;
}

function tidy(idea: FoundIdea): FoundIdea {
  const text = (value: string, max: number) => value.trim().slice(0, max);
  return {
    title: text(idea.title, 60),
    pitch: text(idea.pitch, 200),
    target: text(idea.target, 200),
    problem: text(idea.problem, 400),
    price_per_month: Math.min(500, Math.max(3, Math.round(idea.price_per_month))),
    mvp: idea.mvp.map((feature) => text(feature, 140)).filter(Boolean).slice(0, 5),
    why_you: text(idea.why_you, 400),
    build_time: text(idea.build_time, 40),
    first_customers: text(idea.first_customers, 500),
  };
}

function parisDay() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { answers?: unknown; exclude?: unknown } | null;
  const answers = cleanAnswers(body?.answers);
  const exclude = typeof body?.exclude === "string" ? body.exclude.slice(0, 60) : undefined;
  const fallback = () => NextResponse.json({ idea: libraryIdea(answers.domain, answers.market, exclude), source: "library" });

  const ua = request.headers.get("user-agent") ?? "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (BOT_PATTERN.test(ua) || limited(ip)) return fallback();

  const claude = getClaude();
  const admin = createAdminClient();
  // Without the service role the spend can't be counted, so it isn't spent.
  if (!claude || !admin) return fallback();

  const { data: usage } = await admin.from("public_ai_usage").select("cost_usd").eq("day", parisDay()).maybeSingle();
  if (Number(usage?.cost_usd ?? 0) >= DAILY_BUDGET_USD) return fallback();

  const profile = describeAnswers(answers);
  try {
    const response = await claude.beta.messages.parse({
      model: CHAT_MODEL,
      max_tokens: 2000,
      output_config: { effort: "low", format: betaZodOutputFormat(IdeaSchema) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            `Mes réponses :\n${profile.join("\n") || "- (aucune réponse)"}`,
            exclude ? `Propose une idée différente de « ${exclude} ».` : "",
            "Propose-moi mon idée.",
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
    });

    const { error } = await admin.rpc("add_public_ai_usage", { p_cost: costOf(response.model, response.usage) });
    if (error) console.error("onboarding idea: add_public_ai_usage failed:", error.message);

    const parsed = IdeaSchema.safeParse(response.parsed_output);
    if (response.stop_reason === "refusal" || !parsed.success || parsed.data.mvp.length === 0) {
      console.error("onboarding idea: unusable response", response.stop_reason);
      return fallback();
    }
    return NextResponse.json({ idea: tidy(parsed.data), source: "claude" });
  } catch (error) {
    console.error("onboarding idea: generation failed:", error instanceof Error ? error.message : error);
    return fallback();
  }
}
