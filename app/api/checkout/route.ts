import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe/client";
import { PLANS, type PlanId } from "@/lib/stripe/plans";

// Server-only: which Stripe Price object each plan maps to. Env vars let
// this point at test-mode prices (alongside a test STRIPE_SECRET_KEY)
// without touching code; falls back to the live prices created earlier.
const PRICE_IDS: Record<PlanId, string | undefined> = {
  weekly: process.env.STRIPE_PRICE_WEEKLY || "price_1UGlKLRd6r34OMU60kyhAwLb",
  monthly: process.env.STRIPE_PRICE_MONTHLY || "price_1UGlIkRd6r34OMU6NG4M3tTK",
  annual: process.env.STRIPE_PRICE_ANNUAL || "price_1UGlLHRd6r34OMU6mnaBytQZ",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const plan = PLANS.find((p) => p.id === body?.planId);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = PRICE_IDS[plan.id];
  if (!priceId) {
    return NextResponse.json({ error: "Plan not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const stripe = createStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
      success_url: `${origin}/espace?checkout=success`,
      cancel_url: `${origin}/tarifs`,
      metadata: { user_id: user.id, plan: plan.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // A bad price ID (test/live mode mismatch) or any other Stripe-side
    // failure would otherwise surface as a raw 500 with no JSON body,
    // breaking the client's res.json() with an unhelpful generic error.
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 502 });
  }
}
