import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EspaceFlow } from "@/components/espace/espace-flow";

export const metadata: Metadata = {
  title: "Ton espace — SaaSFounder",
};

const HAS_SAAS_EXISTING = "J'ai déjà un SaaS en ligne";

export default async function EspacePage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { checkout } = await searchParams;

  const [profileRes, onboardingRes, builderRes, marketingRes] = await Promise.all([
    supabase.from("profiles").select("first_name, stripe_customer_id").eq("id", user.id).single(),
    supabase.from("onboarding_responses").select("answers").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("builder_progress")
      .select("has_idea, idea_text, chosen_tool, checklist, mvp_launched")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("marketing_progress")
      .select("chosen_channel, tiktok_url, self_reported_views, submitted_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const answers = (onboardingRes.data?.answers ?? {}) as { hasSaas?: string };
  const hasExistingSaas = answers.hasSaas === HAS_SAAS_EXISTING;

  return (
    <EspaceFlow
      userId={user.id}
      firstName={profileRes.data?.first_name ?? null}
      hasExistingSaas={hasExistingSaas}
      hasStripeSubscription={!!profileRes.data?.stripe_customer_id}
      checkoutSuccess={checkout === "success"}
      initialBuilder={{
        has_idea: builderRes.data?.has_idea ?? null,
        idea_text: builderRes.data?.idea_text ?? "",
        chosen_tool: builderRes.data?.chosen_tool ?? null,
        checklist: (builderRes.data?.checklist as Record<string, boolean>) ?? {},
        mvp_launched: builderRes.data?.mvp_launched ?? false,
      }}
      initialMarketing={{
        chosen_channel: marketingRes.data?.chosen_channel ?? null,
        tiktok_url: marketingRes.data?.tiktok_url ?? "",
        self_reported_views: marketingRes.data?.self_reported_views ?? null,
        submitted_at: marketingRes.data?.submitted_at ?? null,
      }}
    />
  );
}
