import type Stripe from "stripe";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

/** Whether a Checkout Session ended with the subscription paid for. */
export function isPaidCheckout(session: Stripe.Checkout.Session) {
  return session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
}

/**
 * Unlocks the member area for the buyer of a completed Checkout Session.
 * Called by the webhook and by the success redirect, whichever comes first;
 * running it twice writes the same values.
 */
export async function grantAccessFromCheckout(admin: AdminClient, session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) return { error: null };
  const { error } = await admin
    .from("profiles")
    .update({
      has_access: true,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
      stripe_subscription_id:
        typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
      plan: session.metadata?.plan ?? null,
    })
    .eq("id", userId);
  return { error };
}
