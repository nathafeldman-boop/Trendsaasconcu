import { NextResponse } from "next/server";
import { listDomains, pointDomainToNetlify } from "@/lib/connections/hostinger";
import { getAccessToken, openLaunchSession } from "@/lib/connections/store";
import { netlifyHost } from "@/lib/launch/netlify";
import { getLaunchState, updateLaunchState } from "@/lib/launch/state";
import { logEvent } from "@/lib/analytics/server";

// Step 5: the member's Hostinger domain, pointed at their Netlify site.
// Runs only when they pick one of their own domains and click the button.

/** Their active Hostinger domains, to pick from. */
export async function GET() {
  const opened = await openLaunchSession();
  if ("response" in opened) return opened.response;
  const { userId, admin } = opened.session;
  const token = await getAccessToken(admin, userId, "hostinger");
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 400 });
  const domains = await listDomains(token);
  if (domains === null) return NextResponse.json({ error: "reconnect" }, { status: 400 });
  return NextResponse.json({ domains });
}

export async function POST(request: Request) {
  const opened = await openLaunchSession();
  if ("response" in opened) return opened.response;
  const { userId, admin } = opened.session;

  const body = (await request.json().catch(() => null)) as { domain?: unknown } | null;
  const domain = typeof body?.domain === "string" ? body.domain.trim().toLowerCase() : "";

  const [state, token] = await Promise.all([getLaunchState(admin, userId), getAccessToken(admin, userId, "hostinger")]);
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 400 });
  const host = state.site_url ? netlifyHost(state.site_url) : null;
  if (!host) return NextResponse.json({ error: "no_site" }, { status: 400 });

  // Only a domain that's actually theirs on Hostinger.
  const domains = await listDomains(token);
  if (domains === null) return NextResponse.json({ error: "reconnect" }, { status: 400 });
  if (!domains.includes(domain)) return NextResponse.json({ error: "unknown_domain" }, { status: 400 });

  const result = await pointDomainToNetlify(token, domain, host);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 502 });

  const next = { ...state, domain, domain_connected_at: new Date().toISOString() };
  await updateLaunchState(admin, userId, { domain: next.domain, domain_connected_at: next.domain_connected_at });
  await logEvent({ name: "domain_connected", user_id: userId, props: { domain } });
  return NextResponse.json({ state: next });
}
