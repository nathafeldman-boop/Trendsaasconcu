import type { Metadata } from "next";
import { getAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { canEncrypt } from "@/lib/connections/crypto";
import { oauthConfig } from "@/lib/connections/oauth";
import { listConnections } from "@/lib/connections/store";
import { EMPTY_LAUNCH_STATE, getLaunchState } from "@/lib/launch/state";
import { parseIdea } from "@/lib/launch/repo-files";
import { LaunchTab } from "@/components/espace/launch-tab";

export const metadata: Metadata = {
  title: "Pilote auto — SaaSFounder",
};

export default async function LancementPage({
  searchParams,
}: {
  searchParams: Promise<{ connecte?: string; erreur?: string }>;
}) {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) return null;

  const admin = createAdminClient();
  const ready = Boolean(admin) && canEncrypt();
  const [params, builderRes, connections, state] = await Promise.all([
    searchParams,
    supabase.from("builder_progress").select("idea_text").eq("user_id", user.id).maybeSingle(),
    admin && ready ? listConnections(admin, user.id) : Promise.resolve([]),
    admin ? getLaunchState(admin, user.id) : Promise.resolve(EMPTY_LAUNCH_STATE),
  ]);

  const ideaText = typeof builderRes.data?.idea_text === "string" ? builderRes.data.idea_text.trim() : "";
  const idea = ideaText ? parseIdea(ideaText) : null;

  return (
    <LaunchTab
      ideaTitle={idea?.title ?? null}
      ideaText={ideaText || null}
      connections={connections}
      initialState={state}
      // A provider whose OAuth app isn't configured yet shows as "bientôt".
      available={{
        github: ready && oauthConfig("github") !== null,
        supabase: ready && oauthConfig("supabase") !== null,
        hostinger: ready,
      }}
      notice={{ connected: params.connecte ?? null, error: params.erreur ?? null }}
    />
  );
}
