import type { Metadata } from "next";
import { getAuth } from "@/lib/supabase/auth";
import { CreationTab } from "@/components/espace/creation-tab";
import { IdeasSchema } from "@/lib/espace/ideas";

export const metadata: Metadata = {
  title: "Création de SaaS — SaaSFounder",
};

const HAS_SAAS_EXISTING = "J'ai déjà un SaaS en ligne";

export default async function EspacePage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) return null;

  const { checkout } = await searchParams;

  const [profileRes, onboardingRes, builderRes, launchRes] = await Promise.all([
    supabase.from("profiles").select("first_name").eq("id", user.id).single(),
    supabase.from("onboarding_responses").select("answers").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("builder_progress")
      .select("has_idea, idea_text, chosen_tool, checklist, mvp_launched, ai_ideas, build_prompt, build_prompt_key")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("launch_state").select("repo_full_name, supabase_ref").eq("user_id", user.id).maybeSingle(),
  ]);

  // `site` comes from the current questionnaire; `hasSaas` from the previous
  // one, still stored for older accounts.
  const answers = (onboardingRes.data?.answers ?? {}) as { site?: string; hasSaas?: string };
  const hasExistingSaas = answers.site === "oui" || answers.hasSaas === HAS_SAAS_EXISTING;

  const b = builderRes.data;
  const ideas = IdeasSchema.safeParse(b?.ai_ideas);

  return (
    <CreationTab
      userId={user.id}
      firstName={profileRes.data?.first_name ?? null}
      checkoutSuccess={checkout === "success"}
      hasExistingSaas={hasExistingSaas}
      autopilotStarted={Boolean(launchRes.data?.repo_full_name || launchRes.data?.supabase_ref)}
      initialBuilder={{
        has_idea: b?.has_idea ?? null,
        idea_text: b?.idea_text ?? "",
        chosen_tool: b?.chosen_tool ?? null,
        checklist: (b?.checklist as Record<string, boolean>) ?? {},
        mvp_launched: b?.mvp_launched ?? false,
      }}
      initialIdeas={ideas.success ? ideas.data.ideas : null}
      initialPrompt={b?.build_prompt && b.build_prompt_key ? { text: b.build_prompt, key: b.build_prompt_key } : null}
    />
  );
}
