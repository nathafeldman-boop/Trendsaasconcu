import { NextResponse } from "next/server";
import { getAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStripeClient } from "@/lib/stripe/client";
import { grantAccessFromCheckout, isPaidCheckout } from "@/lib/stripe/grant-access";

// Stripe's success redirect lands here. Stripe's webhook can arrive a few
// seconds after the buyer does, and /espace would bounce a not-yet-unlocked
// account back to /tarifs: so the session is checked with Stripe and the
// access granted now. The webhook stays the source of truth and writes the
// same values when it arrives.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const to = (path: string) => NextResponse.redirect(new URL(path, url.origin), 303);

  const { user } = await getAuth();
  if (!user) return to("/connexion?next=/espace");

  const stripe = createStripeClient();
  const admin = createAdminClient();
  if (!sessionId?.startsWith("cs_") || !stripe || !admin) return to("/espace?checkout=success");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const buyer = session.client_reference_id ?? session.metadata?.user_id;
    // Only the signed-in buyer's own, paid session unlocks anything.
    if (buyer === user.id && isPaidCheckout(session)) {
      const { error } = await grantAccessFromCheckout(admin, session);
      if (error) console.error("checkout/confirm: grant failed:", error.message);
    }
  } catch (err) {
    console.error("checkout/confirm: session lookup failed:", err instanceof Error ? err.message : err);
  }
  return to("/espace?checkout=success");
}
