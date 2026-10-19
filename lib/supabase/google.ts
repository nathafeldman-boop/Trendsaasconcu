import type { SupabaseClient, User } from "@supabase/supabase-js";
import { logEvent } from "@/lib/analytics/server";

// Shared by both Google sign-in paths (the /auth/callback redirect and the
// official Google button, see components/auth/google-sign-in.tsx).
export async function afterGoogleSignIn(supabase: SupabaseClient, user: User) {
  // The profile trigger reads `first_name`, which only the email signup
  // form sets — take it from Google's name instead, without ever
  // overwriting one the user already has.
  const meta = user.user_metadata ?? {};
  const firstName = String(meta.first_name ?? meta.given_name ?? meta.full_name ?? meta.name ?? "")
    .trim()
    .split(/\s+/)[0];
  if (firstName) {
    await supabase.from("profiles").update({ first_name: firstName }).eq("id", user.id).is("first_name", null);
  }
  // A Google account created in the last couple of minutes is a sign-up.
  const isNew = Date.now() - new Date(user.created_at).getTime() < 2 * 60 * 1000;
  await logEvent({ name: isNew ? "signup_completed" : "login", user_id: user.id, props: { method: "google" } });
}
