import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const userId = session.client_reference_id ?? session.metadata?.user_id;
    if (userId) {
      const { error } = await admin
        .from("profiles")
        .update({
          has_access: true,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
          stripe_subscription_id:
            typeof session.subscription === "string"
              ? session.subscription
              : (session.subscription?.id ?? null),
          plan: session.metadata?.plan ?? null,
        })
        .eq("id", userId);
      if (error) {
        console.error("Failed to grant access after checkout:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }
    }
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
  }

  return NextResponse.json({ received: true });
}
