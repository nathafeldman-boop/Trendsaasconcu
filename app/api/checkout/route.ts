import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@/lib/supabase/auth";
import { createStripeClient } from "@/lib/stripe/client";
import { euros, PLANS, type PlanId } from "@/lib/stripe/plans";
import { paymentMethodConfiguration } from "@/lib/stripe/payment-methods";

type Plan = (typeof PLANS)[number];

// Server-only: which Stripe Price object each plan maps to. The env vars win
// when they point at a price that exists and matches the plan; otherwise the
// live prices of the « SaaSFounder — Lance ton SaaS avec l'IA » products are
// used, so a mistyped env var can't take checkout down.
const ENV_PRICE_IDS: Record<PlanId, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY?.trim(),
  quarterly: process.env.STRIPE_PRICE_QUARTERLY?.trim(),
  annual: process.env.STRIPE_PRICE_ANNUAL?.trim(),
};
const KNOWN_PRICE_IDS: Record<PlanId, string> = {
  monthly: "price_1US2a9Rd6r34OMU6nW5QxKJc",
  quarterly: "price_1USDsMRd6r34OMU6Qu96X804",
  annual: "price_1USDvxRd6r34OMU6jVVz0K0j",
};

// The Stripe account is shared with other projects: without this, Checkout
// shows the account's business name instead of SaaSFounder.
function branding(origin: string): Stripe.Checkout.SessionCreateParams.BrandingSettings {
  return {
    display_name: "SaaSFounder",
    background_color: "#09090a",
    button_color: "#0fb5b1",
    border_style: "rounded",
    font_family: "inter",
    icon: { type: "url", url: `${origin}/brand/stripe-icon.png` },
  };
}

const MONTHLY = PLANS.find((p) => p.id === "monthly")!;

/** Next to the pay button: what they get, and for longer plans what they save. */
function submitMessage(plan: Plan) {
  if (plan.months === 1) {
    return "Accès immédiat à tout ton espace : ton idée, ton prompt de build, ton coach IA et ton plan marketing. Sans engagement, résiliable à tout moment depuis ton espace.";
  }
  const saved = euros(MONTHLY.amountCents * plan.months - plan.amountCents);
  const period = plan.months === 12 ? "sur l'année" : `tous les ${plan.months} mois`;
  return `Soit ${plan.perMonth} par mois au lieu de ${MONTHLY.price} : ${saved} d'économie ${period}. Accès immédiat à tout ton espace, résiliable à tout moment.`;
}

function billedMonths(price: Stripe.Price) {
  const recurring = price.recurring;
  if (!recurring) return null;
  const count = recurring.interval_count || 1;
  if (recurring.interval === "month") return count;
  if (recurring.interval === "year") return 12 * count;
  return null;
}

async function priceMatches(stripe: Stripe, priceId: string, plan: Plan) {
  let price: Stripe.Price;
  try {
    price = await stripe.prices.retrieve(priceId);
  } catch (err) {
    if (err instanceof Stripe.errors.StripeInvalidRequestError && err.code === "resource_missing") {
      console.error(`Stripe price ${priceId} (plan ${plan.id}) doesn't exist in this Stripe account: fix its env var.`);
      return false;
    }
    throw err;
  }
  // Never charge something other than what /tarifs shows: a price for
  // another amount or billing period is refused.
  const ok =
    price.active && price.unit_amount === plan.amountCents && price.currency === "eur" && billedMonths(price) === plan.months;
  if (!ok) {
    console.error(
      `Stripe price ${priceId} doesn't match plan ${plan.id}: expected ${plan.amountCents} eur every ${plan.months} month(s), got ${price.unit_amount} ${price.currency} every ${billedMonths(price)} month(s)${price.active ? "" : " (archived)"}`
    );
  }
  return ok;
}

// Prices are immutable in Stripe: once resolved, a plan's price stays valid
// for this server instance's lifetime and warm requests skip the lookup.
const resolvedPrices = new Map<PlanId, string>();

async function resolvePrice(stripe: Stripe, plan: Plan) {
  const cached = resolvedPrices.get(plan.id);
  if (cached) return cached;
  const candidates = [...new Set([ENV_PRICE_IDS[plan.id], KNOWN_PRICE_IDS[plan.id]].filter(Boolean))] as string[];
  for (const priceId of candidates) {
    if (await priceMatches(stripe, priceId, plan)) {
      resolvedPrices.set(plan.id, priceId);
      return priceId;
    }
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const plan = PLANS.find((p) => p.id === body?.planId);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { supabase, user } = await getAuth();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const stripe = createStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const origin = new URL(request.url).origin;

  try {
    // Independent lookups: run them side by side instead of one after the other.
    const [{ data: profile }, priceId, methodsConfig] = await Promise.all([
      supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single(),
      resolvePrice(stripe, plan),
      paymentMethodConfiguration(stripe),
    ]);
    if (!priceId) {
      return NextResponse.json({ error: "Plan not configured" }, { status: 503 });
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      locale: "fr",
      line_items: [{ price: priceId, quantity: 1 }],
      // Card, Apple Pay and Google Pay only: no Link (its pre-ticked "save
      // with Link" box and phone field), Klarna or Amazon Pay.
      ...(methodsConfig ? { payment_method_configuration: methodsConfig } : { payment_method_types: ["card"] }),
      wallet_options: { link: { display: "never" } },
      // Promo codes are created in the Stripe dashboard; this just shows the field.
      allow_promotion_codes: true,
      custom_text: {
        submit: { message: submitMessage(plan) },
        after_submit: {
          message:
            "Paiement sécurisé par Stripe : SaaSFounder ne voit jamais les données de ta carte. Dès le paiement validé, tu arrives directement dans ton espace.",
        },
      },
      // Shown in the customer portal and on invoices.
      subscription_data: {
        description: `Abonnement SaaSFounder · ${plan.label}`,
        metadata: { user_id: user.id, plan: plan.id },
      },
      client_reference_id: user.id,
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
      // Back through /api/checkout/confirm, which unlocks the account right
      // away instead of waiting for the webhook to land.
      success_url: `${origin}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tarifs`,
      metadata: { user_id: user.id, plan: plan.id },
    };

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({ ...params, branding_settings: branding(origin) });
    } catch (err) {
      // Branding and the methods configuration are extras: if Stripe ever
      // refuses them, take the payment with a plain card-only session.
      if (!(err instanceof Stripe.errors.StripeInvalidRequestError)) throw err;
      console.error("Checkout session refused, retrying card-only without branding:", err.message);
      session = await stripe.checkout.sessions.create({
        ...params,
        payment_method_configuration: undefined,
        payment_method_types: ["card"],
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Any Stripe-side failure would otherwise surface as a raw 500 with no
    // JSON body, breaking the client's res.json() with an unhelpful error.
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 502 });
  }
}
