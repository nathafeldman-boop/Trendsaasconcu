import { NextResponse } from "next/server";
import { openLaunchSession } from "@/lib/connections/store";
import { authorizeUrl, isOAuthProvider, newOAuthState, oauthConfig } from "@/lib/connections/oauth";

// "Se connecter avec GitHub / Supabase": sends the member to the provider's
// consent screen. The state (and PKCE verifier) wait in a short-lived
// cookie scoped to this provider's routes, checked by the callback.
const BACK = "/espace/lancement";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const { origin } = new URL(request.url);
  if (!isOAuthProvider(provider)) return NextResponse.redirect(`${origin}${BACK}`);

  const opened = await openLaunchSession();
  if ("response" in opened) {
    const target = opened.response.status === 401 ? `/connexion?next=${BACK}` : `${BACK}?erreur=${provider}`;
    return NextResponse.redirect(`${origin}${target}`);
  }

  const config = oauthConfig(provider);
  if (!config) return NextResponse.redirect(`${origin}${BACK}?erreur=${provider}`);

  const { state, verifier } = newOAuthState();
  const response = NextResponse.redirect(authorizeUrl(provider, config, origin, state, verifier));
  response.cookies.set(`sf_oauth_${provider}`, JSON.stringify({ state, verifier }), {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    maxAge: 600,
    path: `/api/connections/${provider}`,
  });
  return response;
}
