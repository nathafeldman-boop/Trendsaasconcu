import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { afterGoogleSignIn } from "@/lib/supabase/google";

// The official Google button signs in from the browser (signInWithIdToken),
// so nothing passes through /auth/callback: it calls this right after to
// get the same first-name fill and signup/login event.
export async function POST() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ ok: false }, { status: 503 });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });
  await afterGoogleSignIn(supabase, data.user);
  return NextResponse.json({ ok: true });
}
