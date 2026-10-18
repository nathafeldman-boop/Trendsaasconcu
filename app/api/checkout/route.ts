import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe/client";
import { PLANS, type PlanId } from "@/lib/stripe/plans";

// Server-only: which Stripe Price object each plan maps to. Env vars let
// this point at test-mode prices (alongside a test STRIPE_SECRET_KEY)
// without touching code. Only the monthly plan has a live price created
// already; the others stay unavailable until their env var is set.
const PRICE_IDS: Record<PlanId, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || "price_1UGlIkRd6r34OMU6NG4M3tTK",
  quarterly: process.env.STRIPE_PRICE_QUARTERLY,
  annual: process.env.STRIPE_PRICE_ANNUAL,
};

function billedMonths(price: Stripe.Price) {
  const recurring = price.recurring;
  if (!recurring) return null;
  const count = recurring.interval_count || 1;
  if (recurring.interval === "month") return count;
  if (recurring.interval === "year") return 12 * count;
  return null;
}

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
    // Never charge something other than what /tarifs shows: an env var
    // still pointing at an old price (e.g. the former 60 €/an) is refused.
    const price = await stripe.prices.retrieve(priceId);
    if (price.unit_amount !== plan.amountCents || price.currency !== "eur" || billedMonths(price) !== plan.months) {
      console.error(
        `Stripe price ${priceId} doesn't match plan ${plan.id}: expected ${plan.amountCents} eur every ${plan.months} month(s), got ${price.unit_amount} ${price.currency} every ${billedMonths(price)} month(s)`
      );
      return NextResponse.json({ error: "Plan not configured" }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      locale: "fr",
      line_items: [{ price: priceId, quantity: 1 }],
      // Promo codes are created in the Stripe dashboard; this just shows the field.
      allow_promotion_codes: true,
      custom_text: {
        submit: {
          message:
            "Accès immédiat à ton espace après le paiement : ton idée, ton prompt de build, ta checklist et ton plan marketing. Résiliable à tout moment depuis ton espace.",
        },
      },
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
