import { createHash, randomBytes } from "node:crypto";

// "Se connecter avec GitHub / Supabase" for the launch autopilot. Each
// provider needs an OAuth app registered by SaaSFounder (client ID and
// secret in Vercel env vars); a provider without them shows as not yet
// available instead of failing.

export type OAuthProvider = "github" | "supabase";

type ProviderConfig = {
  authorizeUrl: string;
  clientId: string;
  clientSecret: string;
  /** Extra authorize params (scope...). */
  params: Record<string, string>;
  pkce: boolean;
};

export const OAUTH_PROVIDERS: OAuthProvider[] = ["github", "supabase"];

export function isOAuthProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as string[]).includes(value);
}

export function oauthConfig(provider: OAuthProvider): ProviderConfig | null {
  if (provider === "github") {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID?.trim();
    const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) return null;
    return {
      authorizeUrl: "https://github.com/login/oauth/authorize",
      clientId,
      clientSecret,
      // `repo`: create the member's private repository and commit the plan to it.
      params: { scope: "repo", allow_signup: "true" },
      pkce: false,
    };
  }
  const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.SUPABASE_OAUTH_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return {
    authorizeUrl: "https://api.supabase.com/v1/oauth/authorize",
    clientId,
    clientSecret,
    params: {},
    pkce: true,
  };
}

export function redirectUri(origin: string, provider: OAuthProvider) {
  return `${origin}/api/connections/${provider}/callback`;
}

export function newOAuthState() {
  return { state: randomBytes(24).toString("base64url"), verifier: randomBytes(48).toString("base64url") };
}

export function authorizeUrl(provider: OAuthProvider, config: ProviderConfig, origin: string, state: string, verifier: string) {
  const url = new URL(config.authorizeUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri(origin, provider));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  for (const [key, value] of Object.entries(config.params)) url.searchParams.set(key, value);
  if (config.pkce) {
    url.searchParams.set("code_challenge", createHash("sha256").update(verifier).digest("base64url"));
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url.toString();
}

export type TokenSet = { accessToken: string; refreshToken: string | null; expiresIn: number | null };

function basicAuth(config: ProviderConfig) {
  return `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`;
}

async function supabaseToken(config: ProviderConfig, body: Record<string, string>): Promise<TokenSet | null> {
  const res = await fetch("https://api.supabase.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization: basicAuth(config),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(body),
  });
  const data = (await res.json().catch(() => null)) as { access_token?: string; refresh_token?: string; expires_in?: number } | null;
  if (!res.ok || !data?.access_token) {
    console.error("Supabase OAuth token request failed:", res.status);
    return null;
  }
  return { accessToken: data.access_token, refreshToken: data.refresh_token ?? null, expiresIn: data.expires_in ?? null };
}

export async function exchangeCode(provider: OAuthProvider, config: ProviderConfig, origin: string, code: string, verifier: string) {
  if (provider === "supabase") {
    return supabaseToken(config, {
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(origin, provider),
      code_verifier: verifier,
    });
  }
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUri(origin, provider),
    }),
  });
  const data = (await res.json().catch(() => null)) as { access_token?: string; error?: string } | null;
  if (!res.ok || !data?.access_token) {
    console.error("GitHub OAuth token request failed:", res.status, data?.error);
    return null;
  }
  // GitHub OAuth App tokens don't expire.
  return { accessToken: data.access_token, refreshToken: null, expiresIn: null } satisfies TokenSet;
}

/** Supabase access tokens are short-lived; GitHub's never need this. */
export async function refreshSupabaseToken(refreshToken: string) {
  const config = oauthConfig("supabase");
  if (!config) return null;
  return supabaseToken(config, { grant_type: "refresh_token", refresh_token: refreshToken });
}
