import { NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { costOf } from "@/lib/claude/client";

// Hard ceiling on what one customer can cost in Claude calls per calendar
// month (UTC). At 16,99 €/mois the margin stays large even for the heaviest
// user; typical usage is a fraction of this.
export const MONTHLY_BUDGET_USD = Number(process.env.AI_MONTHLY_BUDGET_USD) || 1.5;

type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;

export type AiSession = {
  supabase: ServerSupabase;
  userId: string;
  firstName: string | null;
  spentUsd: number;
};

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Every Claude-backed route starts here: signed in, paying (or admin), and
 * under this month's budget. Returns either the session or the response to
 * send back as-is.
 */
export async function openAiSession(): Promise<{ session: AiSession } | { response: NextResponse }> {
  const { supabase, user } = await getAuth();
  if (!supabase) return { response: NextResponse.json({ error: "Not configured" }, { status: 503 }) };
  if (!user) return { response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, has_access, is_admin")
    .eq("id", user.id)
    .single();
  // The AI is part of the paid plan: free accounts never spend API credit.
  if (!profile?.has_access && !profile?.is_admin) {
    return { response: NextResponse.json({ error: "no_access" }, { status: 403 }) };
  }

  return {
    session: {
      supabase,
      userId: user.id,
      firstName: profile?.first_name ?? null,
      spentUsd: await monthlySpendUsd(supabase, user.id),
    },
  };
}

/** What this user's Claude calls have cost so far this month, in USD. */
export async function monthlySpendUsd(supabase: ServerSupabase, userId: string) {
  const { data: usage } = await supabase
    .from("ai_usage")
    .select("cost_usd")
    .eq("user_id", userId)
    .eq("month", currentMonth())
    .maybeSingle();
  return Number(usage?.cost_usd ?? 0);
}

export function isOverBudget(session: AiSession) {
  return session.spentUsd >= MONTHLY_BUDGET_USD;
}

/** Share of this month's budget used, 0–100, for the UI. */
export function budgetUsedPercent(spentUsd: number) {
  return Math.min(100, Math.round((spentUsd / MONTHLY_BUDGET_USD) * 100));
}

export const OVER_BUDGET_MESSAGE =
  "Tu as utilisé tout ton crédit IA de ce mois-ci : il se recharge le 1er du mois prochain. En attendant, les guides, prompts et recommandations de ton espace restent disponibles.";

/**
 * Adds the real cost of a response to the user's monthly total. Written with
 * the service-role client: clients can read ai_usage but never write it.
 * Returns the user's new monthly total.
 */
export async function recordUsage(
  session: AiSession,
  model: string,
  usage: Parameters<typeof costOf>[1]
) {
  const cost = costOf(model, usage);
  const admin = createAdminClient();
  if (!admin) {
    console.error("recordUsage: SUPABASE_SERVICE_ROLE_KEY missing, AI usage not recorded");
    return session.spentUsd + cost;
  }
  const { error } = await admin.rpc("add_ai_usage", { p_user_id: session.userId, p_cost: cost });
  if (error) console.error("recordUsage: add_ai_usage failed:", error.message);
  return session.spentUsd + cost;
}
