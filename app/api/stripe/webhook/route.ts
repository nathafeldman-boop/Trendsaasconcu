import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantAccessFromCheckout } from "@/lib/stripe/grant-access";
import { logEvent } from "@/lib/analytics/server";
import { sendCheckoutReminder } from "@/lib/email/checkout-reminder";

export async function POST(request: Request) {
  const stripe = createStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing signature");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // A failed profile update must not return 200 — that tells Stripe the
  // event was handled and stops its retries, silently leaving has_access
  // stale (e.g. someone paid but never got unlocked).
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { error } = await grantAccessFromCheckout(admin, session);
    if (error) {
      console.error("Failed to grant access after checkout:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    await logEvent({
      name: "payment_completed",
      user_id: session.client_reference_id ?? session.metadata?.user_id ?? null,
      props: {
        plan: session.metadata?.plan ?? null,
        amount: (session.amount_total ?? 0) / 100,
        currency: session.currency,
        discount: (session.total_details?.amount_discount ?? 0) / 100,
        // Paid through the link of a reminder email.
        recovered: !!session.recovered_from,
      },
    });
  }

  // Left Checkout without paying. A failed email isn't worth Stripe's
  // retries: it's logged, and the event acknowledged.
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    await sendCheckoutReminder(admin, session, new URL(request.url).origin).catch((err) =>
      console.error("Checkout reminder failed:", err)
    );
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const active = subscription.status === "active" || subscription.status === "trialing";
    const { error } = await admin
      .from("profiles")
      .update({ has_access: active })
      .eq("stripe_subscription_id", subscription.id);
    if (error) {
      console.error("Failed to sync subscription status:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    if (event.type === "customer.subscription.deleted") {
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle();
      await logEvent({ name: "subscription_canceled", user_id: profile?.id ?? null, props: { subscription: subscription.id } });
    }
  }

  return NextResponse.json({ received: true });
}
