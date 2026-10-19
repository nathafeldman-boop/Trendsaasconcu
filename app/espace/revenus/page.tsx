import type { Metadata } from "next";
import { getAuth } from "@/lib/supabase/auth";
import { getStripeMetrics } from "@/lib/stripe/metrics";
import { RevenueTab } from "@/components/espace/revenue-tab";

export const metadata: Metadata = {
  title: "Revenus — SaaSFounder",
};

export default async function RevenusPage() {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) return null;

  const [metrics, onboardingRes] = await Promise.all([
    getStripeMetrics(user.id),
    supabase.from("onboarding_responses").select("answers").eq("user_id", user.id).maybeSingle(),
  ]);
  const goal = Number((onboardingRes.data?.answers as { revenueGoal?: unknown } | undefined)?.revenueGoal);

  return <RevenueTab initialMetrics={metrics} revenueGoal={Number.isFinite(goal) && goal > 0 ? goal : null} />;
}
