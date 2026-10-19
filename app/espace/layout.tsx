import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/supabase/auth";
import { EspaceShell } from "@/components/espace/espace-shell";

export const metadata: Metadata = {
  title: "Ton espace — SaaSFounder",
  robots: { index: false, follow: false },
};

// Always re-check the session server-side — never cache an auth decision.
export const dynamic = "force-dynamic";

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, has_access, is_admin, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.has_access && !profile?.is_admin) redirect("/tarifs");

  return (
    <EspaceShell firstName={profile?.first_name ?? null} hasStripeSubscription={!!profile?.stripe_customer_id}>
      {children}
    </EspaceShell>
  );
}
