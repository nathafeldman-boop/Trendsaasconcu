import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@/lib/supabase/auth";
import { createStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_TIERS, type PlanId, type PriceTier } from "@/lib/stripe/plans";
import { offerDeadline, priceTier } from "@/lib/stripe/offer";
import { paymentMethodConfiguration } from "@/lib/stripe/payment-methods";
import { resolvePrice, type Plan } from "@/lib/stripe/prices";

// While the Stripe account is shared with other projects: without this,
// Checkout shows the account's business name instead of SaaSFounder.
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

/** Next to the pay button: what they get, and for longer plans what they save. */
function submitMessage(plan: Plan, tier: PriceTier) {
  const monthly = PLAN_TIERS[tier][0];
  if (plan.months === 1) {
    return "Accès immédiat à tout ton espace : ton idée, ton prompt de build, ton coach IA et ton plan marketing. Sans engagement, résiliable à tout moment depuis ton espace.";
  }
  const period = plan.months === 12 ? "sur l'année" : `tous les ${plan.months} mois`;
  const aiCredit = plan.aiCredit > 1 ? " et ton crédit IA doublé chaque mois" : "";
  return `Soit ${plan.perMonth} par mois au lieu de ${monthly.price} : ${plan.savings} d'économie ${period}${aiCredit}. Accès immédiat à tout ton espace, résiliable à tout moment.`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const planId = body?.planId as PlanId | undefined;
  if (!PLAN_TIERS.launch.some((p) => p.id === planId)) {
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
    // Independent lookups: run them side by side instead of one after the
    // other. Both tiers' prices are looked up (once per server instance)
    // while the launch offer's deadline is read.
    const launchPlan = PLAN_TIERS.launch.find((p) => p.id === planId)!;
    const standardPlan = PLAN_TIERS.standard.find((p) => p.id === planId)!;
    const [{ data: profile }, deadline, launchPrice, standardPrice, methodsConfig] = await Promise.all([
      supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single(),
      // The account takes over the countdown their browser ran, if any. None
      // at all (paying straight from the landing page, where it doesn't
      // start): launch prices, the countdown was never shown.
      offerDeadline(user.id, {
        remainingMs: typeof body?.offerRemainingMs === "number" ? body.offerRemainingMs : null,
      }),
      resolvePrice(stripe, launchPlan, "launch", origin),
      resolvePrice(stripe, standardPlan, "standard", origin),
      paymentMethodConfiguration(stripe),
    ]);
    const tier = priceTier(deadline);
    const plan = tier === "launch" ? launchPlan : standardPlan;
    const priceId = tier === "launch" ? launchPrice : standardPrice;
    // They asked for one reminder if they leave without paying (checkbox on
    // the pricing cards). Their consent is recorded with its date; the
    // session then expires after an hour with a link that picks it back up,
    // and the webhook emails it (lib/email/checkout-reminder.ts).
    const reminder = body?.reminder === true;
    if (reminder) {
      await createAdminClient()
        ?.from("profiles")
        .update({ checkout_reminder_consent_at: new Date().toISOString() })
        .eq("id", user.id)
        .is("checkout_reminder_consent_at", null);
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      locale: "fr",
      line_items: [{ price: priceId, quantity: 1 }],
      // Card, Apple Pay and Google Pay only: no Link (its pre-ticked "save
      // with Link" box and phone field), Klarna or Amazon Pay.
      ...(methodsConfig ? { payment_method_configuration: methodsConfig } : { payment_method_types: ["card"] }),
      // Promo codes are created in the Stripe dashboard; this just shows the field.
      allow_promotion_codes: true,
      custom_text: {
        submit: { message: submitMessage(plan, tier) },
        after_submit: {
          message:
            "Paiement sécurisé par Stripe : SaaSFounder ne voit jamais les données de ta carte. Dès le paiement validé, tu arrives directement dans ton espace.",
        },
      },
      // Shown in the customer portal and on invoices.
      subscription_data: {
        description: `Abonnement SaaSFounder · ${plan.label}`,
        metadata: { user_id: user.id, plan: plan.id, price_tier: tier },
      },
      client_reference_id: user.id,
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
      // Back through /api/checkout/confirm, which unlocks the account right
      // away instead of waiting for the webhook to land.
      success_url: `${origin}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tarifs`,
      metadata: { user_id: user.id, plan: plan.id, price_tier: tier, ...(reminder ? { reminder_consent: "yes" } : {}) },
      ...(reminder
        ? {
            expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
            after_expiration: { recovery: { enabled: true, allow_promotion_codes: true } },
          }
        : {}),
    };

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({ ...params, branding_settings: branding(origin) });
    } catch (err) {
      // Branding and the methods configuration are extras: if Stripe ever
      // refuses them, take the payment with a plain card-only session. A
      // customer saved from another Stripe account (after switching to
      // SaaSFounder's own) is dropped too: Checkout creates a new one.
      if (!(err instanceof Stripe.errors.StripeInvalidRequestError)) throw err;
      console.error("Checkout session refused, retrying card-only without branding:", err.message);
      const unknownCustomer = err.param === "customer";
      session = await stripe.checkout.sessions.create({
        ...params,
        payment_method_configuration: undefined,
        payment_method_types: ["card"],
        ...(unknownCustomer ? { customer: undefined, customer_email: user.email ?? undefined } : {}),
      });
    }

    return NextResponse.json({ url: session.url, tier });
  } catch (err) {
    // Any Stripe-side failure would otherwise surface as a raw 500 with no
    // JSON body, breaking the client's res.json() with an unhelpful error.
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 502 });
  }
}
