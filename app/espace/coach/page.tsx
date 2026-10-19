import type { Metadata } from "next";
import { getAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { budgetUsedPercent, monthlySpendUsd } from "@/lib/claude/guard";
import { CHECKLIST_ITEMS, CODE_TOOLS } from "@/lib/espace/content";
import { CoachChatLoader } from "@/components/espace/coach-chat-loader";

export const metadata: Metadata = {
  title: "Coach IA — SaaSFounder",
};

export default async function CoachPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) return null;

  const { q } = await searchParams;
  // stripe_connections has no client SELECT policy: only check it exists, server-side.
  const admin = createAdminClient();

  const [profileRes, builderRes, marketingRes, spent, stripeRes] = await Promise.all([
    supabase.from("profiles").select("first_name").eq("id", user.id).single(),
    supabase.from("builder_progress").select("idea_text, chosen_tool, checklist, mvp_launched").eq("user_id", user.id).maybeSingle(),
    supabase.from("marketing_progress").select("chosen_channel").eq("user_id", user.id).maybeSingle(),
    monthlySpendUsd(supabase, user.id),
    admin ? admin.from("stripe_connections").select("user_id").eq("user_id", user.id).maybeSingle() : null,
  ]);

  const b = builderRes.data;
  const checklist = (b?.checklist ?? {}) as Record<string, boolean>;
  const idea = b?.idea_text?.split("\n")[0]?.trim();
  const facts = [
    { label: "Idée", value: idea ? (idea.length > 48 ? `${idea.slice(0, 46)}…` : idea) : "pas encore choisie" },
    { label: "Outil", value: CODE_TOOLS.find((t) => t.id === b?.chosen_tool)?.name ?? "pas encore choisi" },
    {
      label: "Lancement",
      value: b?.mvp_launched
        ? "MVP en ligne"
        : `${CHECKLIST_ITEMS.filter((item) => checklist[item.id]).length}/${CHECKLIST_ITEMS.length} étapes`,
    },
    { label: "Stripe", value: stripeRes?.data ? "connecté" : "pas connecté" },
    { label: "Canal", value: marketingRes.data?.chosen_channel ?? "pas encore choisi" },
  ];

  return (
    <CoachChatLoader
      userId={user.id}
      firstName={profileRes.data?.first_name ?? null}
      initialQuestion={typeof q === "string" ? q.slice(0, 600) : ""}
      initialBudgetUsed={budgetUsedPercent(spent)}
      facts={facts}
    />
  );
}
