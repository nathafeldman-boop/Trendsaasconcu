import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { openLaunchSession, saveConnection } from "@/lib/connections/store";
import { exchangeCode, isOAuthProvider, oauthConfig } from "@/lib/connections/oauth";
import { githubLogin } from "@/lib/connections/github";
import { supabaseAccountName } from "@/lib/connections/supabase-api";
import { logEvent } from "@/lib/analytics/server";

// Where GitHub / Supabase send the member back after the consent screen:
// checks the state against the cookie set by /start, exchanges the code and
// stores the encrypted token.
const BACK = "/espace/lancement";

function sameState(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const { origin, searchParams } = new URL(request.url);
  if (!isOAuthProvider(provider)) return NextResponse.redirect(`${origin}${BACK}`);
  const fail = () => {
    const response = NextResponse.redirect(`${origin}${BACK}?erreur=${provider}`);
    response.cookies.delete({ name: `sf_oauth_${provider}`, path: `/api/connections/${provider}` });
    return response;
  };

  const cookieStore = await cookies();
  let saved: { state?: string; verifier?: string } = {};
  try {
    saved = JSON.parse(cookieStore.get(`sf_oauth_${provider}`)?.value ?? "{}");
  } catch {
    // unreadable cookie: treated as missing
  }
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  // The member declined, or the request didn't start from this browser.
  if (!code || !state || !saved.state || !saved.verifier || !sameState(state, saved.state)) return fail();

  const opened = await openLaunchSession();
  if ("response" in opened) return fail();
  const { userId, admin } = opened.session;

  const config = oauthConfig(provider);
  if (!config) return fail();
  const tokens = await exchangeCode(provider, config, origin, code, saved.verifier);
  if (!tokens) return fail();

  const accountName =
    provider === "github" ? await githubLogin(tokens.accessToken) : await supabaseAccountName(tokens.accessToken);
  const { error } = await saveConnection(admin, userId, provider, tokens, accountName);
  if (error) {
    console.error(`connections: saving ${provider} failed:`, error.message);
    return fail();
  }
  await logEvent({ name: "account_connected", user_id: userId, props: { provider } });

  const response = NextResponse.redirect(`${origin}${BACK}?connecte=${provider}`);
  response.cookies.delete({ name: `sf_oauth_${provider}`, path: `/api/connections/${provider}` });
  return response;
}
