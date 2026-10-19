import { NextResponse } from "next/server";
import { deleteConnection, openLaunchSession, saveConnection, type Provider } from "@/lib/connections/store";
import { hostingerAccountName } from "@/lib/connections/hostinger";
import { logEvent } from "@/lib/analytics/server";

const PROVIDERS: Provider[] = ["github", "supabase", "hostinger"];

// Hostinger has no "Se connecter avec" flow: the member pastes an API token
// from hPanel, checked against their domain list before it's stored.
export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (provider !== "hostinger") return NextResponse.json({ error: "unsupported" }, { status: 400 });
  const opened = await openLaunchSession();
  if ("response" in opened) return opened.response;
  const { userId, admin } = opened.session;

  const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token || token.length > 500) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

  const accountName = await hostingerAccountName(token);
  if (accountName === null) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

  const { error } = await saveConnection(admin, userId, "hostinger", { accessToken: token, refreshToken: null, expiresIn: null }, accountName);
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  await logEvent({ name: "account_connected", user_id: userId, props: { provider } });
  return NextResponse.json({ ok: true, accountName });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!(PROVIDERS as string[]).includes(provider)) return NextResponse.json({ error: "unsupported" }, { status: 400 });
  const opened = await openLaunchSession();
  if ("response" in opened) return opened.response;
  const { userId, admin } = opened.session;
  const { error } = await deleteConnection(admin, userId, provider as Provider);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  await logEvent({ name: "account_disconnected", user_id: userId, props: { provider } });
  return NextResponse.json({ ok: true });
}
