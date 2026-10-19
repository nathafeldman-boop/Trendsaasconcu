import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getAccessToken, openLaunchSession } from "@/lib/connections/store";
import { createProject, listOrganizations, projectStatus, publishableKey, runQuery } from "@/lib/connections/supabase-api";
import { parseIdea } from "@/lib/launch/repo-files";
import { STARTER_SCHEMA } from "@/lib/launch/starter-schema";
import { getIdeaText, getLaunchState, updateLaunchState } from "@/lib/launch/state";
import { syncRepoWithSupabase } from "@/lib/launch/sync";
import { logEvent } from "@/lib/analytics/server";

export const maxDuration = 30;

// Step 2 of the autopilot, called repeatedly by the page: the first call
// creates the member's Supabase project; the next ones follow it while it
// starts (a minute or two), then add the starter tables, fetch its
// publishable key and write both into their repository.
export async function POST() {
  const opened = await openLaunchSession();
  if ("response" in opened) return opened.response;
  const { userId, admin } = opened.session;

  const [state, token] = await Promise.all([getLaunchState(admin, userId), getAccessToken(admin, userId, "supabase")]);
  if (!token) return NextResponse.json({ error: state.supabase_ref ? "reconnect" : "not_connected", state }, { status: 400 });

  if (!state.supabase_ref) {
    const organizations = await listOrganizations(token);
    if (!organizations.length) return NextResponse.json({ error: "no_organization", state }, { status: 400 });
    const ideaText = await getIdeaText(admin, userId);
    const created = await createProject(token, {
      name: (ideaText ? parseIdea(ideaText).title : "Mon SaaS").slice(0, 60),
      organizationSlug: organizations[0].slug,
      // Never stored: the member can reset it from their Supabase dashboard if they ever need it.
      dbPass: randomBytes(24).toString("base64url"),
    });
    if ("error" in created) {
      const limit = created.message && /limit|maximum/i.test(created.message);
      return NextResponse.json({ error: limit ? "project_limit" : created.error, state }, { status: 502 });
    }
    const next = {
      ...state,
      supabase_ref: created.ref,
      supabase_status: created.status,
      supabase_url: `https://${created.ref}.supabase.co`,
    };
    await updateLaunchState(admin, userId, {
      supabase_ref: next.supabase_ref,
      supabase_status: next.supabase_status,
      supabase_url: next.supabase_url,
    });
    await logEvent({ name: "database_created", user_id: userId, props: { ref: created.ref } });
    return NextResponse.json({ state: next });
  }

  const ref = state.supabase_ref;
  const status = await projectStatus(token, ref);
  if (status === "RECONNECT") return NextResponse.json({ error: "reconnect", state }, { status: 400 });

  const next = { ...state, supabase_status: status };
  if (status === "ACTIVE_HEALTHY") {
    // Right after start-up the database can refuse a first query: the
    // next poll simply tries again.
    if (!next.supabase_schema_applied) next.supabase_schema_applied = await runQuery(token, ref, STARTER_SCHEMA);
    if (!next.supabase_publishable_key) next.supabase_publishable_key = await publishableKey(token, ref);
  }
  await updateLaunchState(admin, userId, {
    supabase_status: next.supabase_status,
    supabase_schema_applied: next.supabase_schema_applied,
    supabase_publishable_key: next.supabase_publishable_key,
  });

  const wasReady = Boolean(state.supabase_publishable_key && state.supabase_schema_applied);
  const isReady = Boolean(next.supabase_publishable_key && next.supabase_schema_applied);
  if (!wasReady && isReady) {
    await syncRepoWithSupabase(admin, userId, next);
    await logEvent({ name: "database_ready", user_id: userId, props: { ref } });
  }
  return NextResponse.json({ state: next });
}
