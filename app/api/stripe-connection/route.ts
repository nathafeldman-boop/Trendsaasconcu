import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuth } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeMetrics } from "@/lib/stripe/metrics";

// Connects the member's OWN Stripe account to the Revenus tab. The key is
// checked against Stripe before it's stored, and written with the
// service-role client: stripe_connections has no client SELECT policy, so
// the browser can never read a key back.

const KEY_PATTERN = /^(sk|rk)_(live|test)_[A-Za-z0-9]{10,}$/;

async function signedInUser() {
  return (await getAuth()).user;
}

export async function POST(request: Request) {
  const user = await signedInUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key.trim() : "";
  if (!KEY_PATTERN.test(key)) {
    return NextResponse.json(
      { error: "invalid_format", message: "Ce n'est pas une clé Stripe : elle commence par rk_live_ (clé restreinte) ou sk_live_." },
      { status: 400 }
    );
  }

  try {
    const stripe = new Stripe(key, { timeout: 8000, maxNetworkRetries: 0 });
    await stripe.subscriptions.list({ limit: 1 });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripePermissionError
        ? "Clé reconnue, mais il lui manque la permission « Lecture » sur les abonnements (Subscriptions)."
        : error instanceof Stripe.errors.StripeAuthenticationError
          ? "Stripe refuse cette clé : vérifie que tu l'as copiée en entier et qu'elle n'a pas été supprimée."
          : "Impossible de joindre Stripe pour vérifier la clé. Réessaie dans un instant.";
    return NextResponse.json({ error: "stripe_rejected", message }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { error } = await admin
    .from("stripe_connections")
    .upsert({ user_id: user.id, stripe_secret_key: key, connected_at: new Date().toISOString() });
  if (error) {
    console.error("stripe-connection: save failed:", error.message);
    return NextResponse.json({ error: "save_failed", message: "Enregistrement impossible, réessaie." }, { status: 500 });
  }

  return NextResponse.json({ metrics: await getStripeMetrics(user.id) });
}

export async function DELETE() {
  const user = await signedInUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { error } = await admin.from("stripe_connections").delete().eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  return NextResponse.json({ metrics: { connected: false } });
}
