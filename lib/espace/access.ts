import type { createClient } from "@/lib/supabase/server";
import { hasFeature, type Feature } from "@/lib/stripe/plans";

type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;

/** Whether the member's plan leaves out a feature (admins have everything). */
export async function lacksFeature(supabase: ServerSupabase, userId: string, feature: Feature) {
  const { data } = await supabase.from("profiles").select("plan, is_admin").eq("id", userId).single();
  return !data?.is_admin && !hasFeature(data?.plan, feature);
}
