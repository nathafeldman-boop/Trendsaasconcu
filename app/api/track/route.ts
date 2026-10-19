import { NextResponse } from "next/server";
import { getAuth } from "@/lib/supabase/auth";
import { BOT_PATTERN, deviceFromUserAgent, inAppBrowser, logEvent } from "@/lib/analytics/server";

// Receives the browser's analytics events (lib/analytics/track.ts) and
// stores them with what only the server knows reliably: the signed-in
// account, the country and the device.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME = /^[a-z0-9_]{1,60}$/;

// Generous per-IP cap (per server instance) against a script flooding the table.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;
const hits = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string) {
  const now = Date.now();
  if (hits.size > 10_000) hits.clear();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function cleanProps(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const json = JSON.stringify(value);
  return json.length <= 2000 ? (value as Record<string, unknown>) : {};
}

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_PATTERN.test(ua)) return new NextResponse(null, { status: 204 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return new NextResponse(null, { status: 429 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";
  if (!NAME.test(name)) return new NextResponse(null, { status: 400 });

  const anonId = typeof body.anonId === "string" && UUID.test(body.anonId) ? body.anonId : null;
  const sessionId = typeof body.sessionId === "string" && UUID.test(body.sessionId) ? body.sessionId : null;
  const { user } = await getAuth();
  const app = inAppBrowser(ua);

  await logEvent({
    name,
    anon_id: anonId,
    user_id: user?.id ?? null,
    session_id: sessionId,
    path: typeof body.path === "string" ? body.path.slice(0, 300) : null,
    props: { ...cleanProps(body.props), ...(app ? { in_app: app } : {}) },
    source: typeof body.source === "string" ? body.source.slice(0, 100) : null,
    device: deviceFromUserAgent(ua),
    country: request.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
  });

  return new NextResponse(null, { status: 204 });
}
