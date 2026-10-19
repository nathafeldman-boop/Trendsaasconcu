import type { AdminClient } from "@/lib/connections/store";

// What the launch autopilot set up for a member (launch_state), read and
// written with the service-role client by the /api/launch routes.

export type LaunchState = {
  repo_full_name: string | null;
  repo_url: string | null;
  supabase_ref: string | null;
  supabase_status: string | null;
  supabase_url: string | null;
  supabase_publishable_key: string | null;
  supabase_schema_applied: boolean;
  site_url: string | null;
  domain: string | null;
  domain_connected_at: string | null;
};

export const EMPTY_LAUNCH_STATE: LaunchState = {
  repo_full_name: null,
  repo_url: null,
  supabase_ref: null,
  supabase_status: null,
  supabase_url: null,
  supabase_publishable_key: null,
  supabase_schema_applied: false,
  site_url: null,
  domain: null,
  domain_connected_at: null,
};

const COLUMNS = Object.keys(EMPTY_LAUNCH_STATE).join(", ");

export async function getLaunchState(admin: AdminClient, userId: string): Promise<LaunchState> {
  const { data } = await admin.from("launch_state").select(COLUMNS).eq("user_id", userId).maybeSingle();
  return { ...EMPTY_LAUNCH_STATE, ...((data ?? {}) as Partial<LaunchState>) };
}

export async function updateLaunchState(admin: AdminClient, userId: string, patch: Partial<LaunchState>) {
  const { error } = await admin
    .from("launch_state")
    .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() });
  if (error) console.error("launch_state update failed:", error.message);
  return !error;
}

/** The member's idea as saved in the Création tab, if they have one. */
export async function getIdeaText(admin: AdminClient, userId: string) {
  const { data } = await admin.from("builder_progress").select("idea_text").eq("user_id", userId).maybeSingle();
  const text = typeof data?.idea_text === "string" ? data.idea_text.trim() : "";
  return text || null;
}
