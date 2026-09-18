import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase's OAuth redirect lands here with a `?code=`. Route Handlers can
// actually persist cookies (unlike Server Components), so the exchange has
// to happen here rather than on whatever page `next` points to.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/espace";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/connexion`);
}
