import { NextResponse } from "next/server";
import { openLaunchSession } from "@/lib/connections/store";
import { getLaunchState, updateLaunchState } from "@/lib/launch/state";
import { netlifyHost } from "@/lib/launch/netlify";
import { logEvent } from "@/lib/analytics/server";

// Step 4: the member pastes the address Netlify gave their site
// (xxx.netlify.app), which the domain step points their domain at.
export async function POST(request: Request) {
  const opened = await openLaunchSession();
  if ("response" in opened) return opened.response;
  const { userId, admin } = opened.session;

  const body = (await request.json().catch(() => null)) as { siteUrl?: unknown } | null;
  const host = typeof body?.siteUrl === "string" ? netlifyHost(body.siteUrl) : null;
  if (!host) return NextResponse.json({ error: "invalid_site" }, { status: 400 });

  const state = await getLaunchState(admin, userId);
  const next = { ...state, site_url: `https://${host}` };
  await updateLaunchState(admin, userId, { site_url: next.site_url });
  await logEvent({ name: "site_saved", user_id: userId, props: { host } });
  return NextResponse.json({ state: next });
}
