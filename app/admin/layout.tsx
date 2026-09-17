import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PresenceHeartbeat } from "@/components/espace/presence-heartbeat";

// Always re-check the session server-side — never cache an auth decision.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  if (!supabase) redirect("/connexion");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  return (
    <>
      <PresenceHeartbeat />
      {children}
    </>
  );
}
