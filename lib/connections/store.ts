import { NextResponse } from "next/server";
import { getAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { canEncrypt, decrypt, encrypt } from "@/lib/connections/crypto";
import { refreshSupabaseToken, type TokenSet } from "@/lib/connections/oauth";

export type Provider = "github" | "supabase" | "hostinger";
export type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export type ConnectionSummary = { provider: Provider; account_name: string | null; connected_at: string };

/**
 * Every launch route starts here: signed in, paying (or admin), and the
 * server able to store tokens safely. Returns the member and the
 * service-role client, or the response to send back as-is.
 */
export async function openLaunchSession(): Promise<
  { session: { userId: string; admin: AdminClient } } | { response: NextResponse }
> {
  const { supabase, user } = await getAuth();
  if (!supabase) return { response: NextResponse.json({ error: "not_configured" }, { status: 503 }) };
  if (!user) return { response: NextResponse.json({ error: "not_authenticated" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("has_access, is_admin").eq("id", user.id).single();
  if (!profile?.has_access && !profile?.is_admin) {
    return { response: NextResponse.json({ error: "no_access" }, { status: 403 }) };
  }
  const admin = createAdminClient();
  if (!admin || !canEncrypt()) return { response: NextResponse.json({ error: "not_configured" }, { status: 503 }) };
  return { session: { userId: user.id, admin } };
}

export async function saveConnection(
  admin: AdminClient,
  userId: string,
  provider: Provider,
  tokens: TokenSet,
  accountName: string | null
) {
  const now = Date.now();
  const { error } = await admin.from("user_connections").upsert({
    user_id: userId,
    provider,
    access_token: encrypt(tokens.accessToken),
    refresh_token: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
    expires_at: tokens.expiresIn ? new Date(now + tokens.expiresIn * 1000).toISOString() : null,
    account_name: accountName,
    connected_at: new Date(now).toISOString(),
    updated_at: new Date(now).toISOString(),
  });
  return { error };
}

export async function listConnections(admin: AdminClient, userId: string): Promise<ConnectionSummary[]> {
  const { data } = await admin
    .from("user_connections")
    .select("provider, account_name, connected_at")
    .eq("user_id", userId);
  return (data ?? []) as ConnectionSummary[];
}

export async function deleteConnection(admin: AdminClient, userId: string, provider: Provider) {
  return admin.from("user_connections").delete().eq("user_id", userId).eq("provider", provider);
}

/**
 * The member's decrypted access token for a provider, refreshed first when
 * it's a Supabase token about to expire. Null when not connected (or the
 * connection no longer works and has to be redone).
 */
export async function getAccessToken(admin: AdminClient, userId: string, provider: Provider) {
  const { data } = await admin
    .from("user_connections")
    .select("access_token, refresh_token, expires_at, account_name")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();
  if (!data) return null;

  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : null;
  if (provider === "supabase" && expiresAt !== null && expiresAt - Date.now() < 60_000) {
    const refreshToken = decrypt(data.refresh_token);
    const fresh = refreshToken ? await refreshSupabaseToken(refreshToken) : null;
    if (!fresh) return null;
    await saveConnection(admin, userId, provider, { ...fresh, refreshToken: fresh.refreshToken ?? refreshToken }, data.account_name);
    return fresh.accessToken;
  }
  return decrypt(data.access_token);
}
