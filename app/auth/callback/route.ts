import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { afterGoogleSignIn } from "@/lib/supabase/google";

// Supabase's OAuth redirect (Google) lands here with a `?code=`. Route
// Handlers can actually persist cookies (unlike Server Components), so the
// exchange has to happen here rather than on whatever page `next` points to.
//
// For Supabase to send people here at all, this exact URL must be listed in
// the project's Authentication > URL Configuration > Redirect URLs —
// otherwise it silently falls back to the Site URL and this never runs.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/espace";
  // Only ever bounce back inside this site — "//evil.com" is protocol-relative.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/espace";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (data.user) await afterGoogleSignIn(supabase, data.user);
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error("Google sign-in code exchange failed:", error.message);
    }
  } else if (searchParams.get("error")) {
    console.error("Google sign-in returned an error:", searchParams.get("error_description"));
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=google`);
}
