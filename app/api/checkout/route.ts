import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe/client";
import { PLANS } from "@/lib/stripe/plans";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const plan = PLANS.find((p) => p.id === body?.planId);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
    success_url: `${origin}/espace?checkout=success`,
    cancel_url: `${origin}/tarifs`,
    metadata: { user_id: user.id, plan: plan.id },
  });

  return NextResponse.json({ url: session.url });
}
