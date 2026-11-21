import type Stripe from "stripe";
import type { createAdminClient } from "@/lib/supabase/admin";
import { createStripeClient } from "@/lib/stripe/client";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

/** Whether a Checkout Session ended paid for (a subscription or a one-time payment). */
export function isPaidCheckout(session: Stripe.Checkout.Session) {
  return session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
}

/**
 * Unlocks the member area for the buyer of a completed Checkout Session.
 * Called by the webhook and by the success redirect, whichever comes first;
 * running it twice writes the same values.
 *
 * A member who changes plan (weekly to lifetime, monthly to quarterly...)
 * would otherwise keep paying for the old subscription: it is set to end
 * with its current period. The lifetime plan has no subscription at all, so
 * a later "subscription deleted" event can't lock its owner out.
 */
export async function grantAccessFromCheckout(admin: AdminClient, session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) return { error: null };
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);

  const { data: before } = await admin.from("profiles").select("stripe_subscription_id").eq("id", userId).maybeSingle();
  const previous = before?.stripe_subscription_id;
  if (previous && previous !== subscriptionId) {
    await createStripeClient()
      ?.subscriptions.update(previous, { cancel_at_period_end: true })
      .catch((err) => console.error(`Couldn't end previous subscription ${previous}:`, err instanceof Error ? err.message : err));
  }

  const { error } = await admin
    .from("profiles")
    .update({
      has_access: true,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
      stripe_subscription_id: subscriptionId,
      plan: session.metadata?.plan ?? null,
    })
    .eq("id", userId);
  return { error };
}
