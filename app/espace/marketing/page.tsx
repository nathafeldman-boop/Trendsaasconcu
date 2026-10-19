import type { Metadata } from "next";
import { getAuth } from "@/lib/supabase/auth";
import { MarketingTab } from "@/components/espace/marketing-tab";

export const metadata: Metadata = {
  title: "Marketing — SaaSFounder",
};

const HAS_SAAS_EXISTING = "J'ai déjà un SaaS en ligne";

export default async function MarketingPage() {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) return null;

  const [onboardingRes, builderRes, marketingRes] = await Promise.all([
    supabase.from("onboarding_responses").select("answers").eq("user_id", user.id).maybeSingle(),
    supabase.from("builder_progress").select("idea_text, mvp_launched").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("marketing_progress")
      .select("chosen_channel, tiktok_url, self_reported_views, submitted_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  // `site` / `siteUrl` come from the current questionnaire; `hasSaas` /
  // `existingUrl` from the previous one, still stored for older accounts.
  const answers = (onboardingRes.data?.answers ?? {}) as {
    site?: string;
    siteUrl?: string;
    hasSaas?: string;
    existingUrl?: string;
    refusals?: string[];
    lever_prospection?: string;
  };
  const hasExistingSaas = answers.site === "oui" || answers.hasSaas === HAS_SAAS_EXISTING;

  return (
    <MarketingTab
      userId={user.id}
      idea={builderRes.data?.idea_text ?? ""}
      mvpLaunched={builderRes.data?.mvp_launched ?? false}
      hasExistingSaas={hasExistingSaas}
      existingUrl={hasExistingSaas ? answers.siteUrl || answers.existingUrl || null : null}
      noFace={Array.isArray(answers.refusals) && answers.refusals.includes("video")}
      prospects={answers.lever_prospection === "oui"}
      initialMarketing={{
        chosen_channel: marketingRes.data?.chosen_channel ?? null,
        tiktok_url: marketingRes.data?.tiktok_url ?? "",
        self_reported_views: marketingRes.data?.self_reported_views ?? null,
        submitted_at: marketingRes.data?.submitted_at ?? null,
      }}
    />
  );
}
