import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@/lib/supabase/auth";
import { createStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { CARD_PLAN_IDS, isPlanId, planFor, type Plan, type PriceTier } from "@/lib/stripe/plans";
import { offerDeadline, priceTier } from "@/lib/stripe/offer";
import { paymentMethodConfiguration } from "@/lib/stripe/payment-methods";
import { resolvePrice } from "@/lib/stripe/prices";
import { logEvent } from "@/lib/analytics/server";

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

/** Next to the pay button: what they get, and how it renews. */
function submitMessage(plan: Plan, tier: PriceTier) {
  if (plan.billing.mode === "payment") {
    return "Paiement unique, sans abonnement : ton espace est à toi pour toujours. Accès immédiat dès le paiement validé.";
  }
  const billing = plan.billing;
  const every = billing.interval === "week" ? "chaque semaine" : billing.count === 1 ? "chaque mois" : `tous les ${billing.count} mois`;
  const kept = tier === "launch" && plan.nextPrice ? " Ton prix de bienvenue est gardé à chaque renouvellement tant que tu ne résilies pas." : "";
  return `Accès immédiat à ton espace. Renouvellement automatique ${every}, résiliable à tout moment depuis ton espace.${kept}`;
}

/** Where to come back to if they leave Stripe: a path on this site only. */
function returnPath(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value.slice(0, 200) : "/tarifs";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const planId = body?.planId;
  const exitOffer = body?.offer === "exit" && planId === "lifetime";
  if (!isPlanId(planId)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  // The box on the pricing page: terms, and immediate access instead of
  // the 14-day withdrawal period (digital content, art. L221-28 13°).
  if (body?.termsAccepted !== true) {
    return NextResponse.json({ error: "Terms not accepted" }, { status: 400 });
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
  const onCards = (CARD_PLAN_IDS as readonly string[]).includes(planId);

  try {
    // Independent lookups, side by side. For the card plans, both tiers'
    // prices are looked up (once per server instance) while the welcome
    // offer's deadline is read.
    const [{ data: profile }, deadline, methodsConfig] = await Promise.all([
      supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single(),
      // The account takes over the countdown their browser ran, if any. None
      // at all (paying straight from the landing page, where it doesn't
      // start): welcome prices, the countdown was never shown.
      onCards && !exitOffer
        ? offerDeadline(user.id, {
            remainingMs: typeof body?.offerRemainingMs === "number" ? body.offerRemainingMs : null,
          })
        : Promise.resolve(null),
      paymentMethodConfiguration(stripe),
    ]);
    const tier: PriceTier = exitOffer ? "exit" : onCards ? priceTier(deadline) : "launch";
    const plan = planFor(planId, tier);
    const priceId = await resolvePrice(stripe, plan, tier, origin);

    const admin = createAdminClient();
    const now = new Date().toISOString();
    // Proof of the terms box, kept with the payment (metadata) and here.
    await logEvent({ name: "terms_accepted", user_id: user.id, props: { plan: plan.id, tier } });
    // They asked for one reminder if they leave without paying (checkbox on
    // the pricing page). Their consent is recorded with its date; the
    // session then expires after an hour with a link that picks it back up,
    // and the webhook emails it (lib/email/checkout-reminder.ts).
    const reminder = body?.reminder === true;
    if (reminder) {
      await admin
        ?.from("profiles")
        .update({ checkout_reminder_consent_at: now })
        .eq("id", user.id)
        .is("checkout_reminder_consent_at", null);
    }

    const metadata = {
      user_id: user.id,
      plan: plan.id,
      price_tier: tier,
      terms_accepted_at: now,
      ...(reminder ? { reminder_consent: "yes" } : {}),
    };
    const oneTime = plan.billing.mode === "payment";
    const customer = profile?.stripe_customer_id ?? undefined;
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: oneTime ? "payment" : "subscription",
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
      ...(oneTime
        ? {
            // An invoice for the one-time payment, and a customer to attach it to.
            invoice_creation: { enabled: true, invoice_data: { description: `SaaSFounder · ${plan.label}`, metadata } },
            payment_intent_data: { description: `SaaSFounder · ${plan.label}`, statement_descriptor_suffix: "SAASFOUNDER", metadata },
            ...(customer ? {} : { customer_creation: "always" as const }),
          }
        : {
            // Shown in the customer portal and on invoices.
            subscription_data: { description: `Abonnement SaaSFounder · ${plan.label}`, metadata },
          }),
      client_reference_id: user.id,
      customer,
      customer_email: customer ? undefined : (user.email ?? undefined),
      // Back through /api/checkout/confirm, which unlocks the account right
      // away instead of waiting for the webhook to land.
      success_url: `${origin}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath(body?.returnTo)}${returnPath(body?.returnTo).includes("?") ? "&" : "?"}paiement=annule`,
      metadata,
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
        ...(unknownCustomer
          ? { customer: undefined, customer_email: user.email ?? undefined, ...(oneTime ? { customer_creation: "always" as const } : {}) }
          : {}),
      });
    }

    return NextResponse.json({ url: session.url, tier, plan: plan.id });
  } catch (err) {
    // Any Stripe-side failure would otherwise surface as a raw 500 with no
    // JSON body, breaking the client's res.json() with an unhelpful error.
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 502 });
  }
}
