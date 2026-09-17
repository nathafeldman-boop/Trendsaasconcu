import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ connected: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ connected: false }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ connected: false });

  const { data: connection } = await admin
    .from("stripe_connections")
    .select("stripe_secret_key")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!connection?.stripe_secret_key) {
    return NextResponse.json({ connected: false });
  }

  try {
    const stripe = new Stripe(connection.stripe_secret_key);
    const subscriptions = await stripe.subscriptions.list({ status: "active", limit: 100 });

    let mrrCents = 0;
    let currency = "eur";

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (!price?.unit_amount || !price.recurring) continue;
        const quantity = item.quantity ?? 1;
        const amount = price.unit_amount * quantity;
        const count = price.recurring.interval_count || 1;
        currency = price.currency ?? currency;

        if (price.recurring.interval === "year") {
          mrrCents += amount / (12 * count);
        } else if (price.recurring.interval === "month") {
          mrrCents += amount / count;
        } else if (price.recurring.interval === "week") {
          mrrCents += (amount * 52) / (12 * count);
        } else if (price.recurring.interval === "day") {
          mrrCents += (amount * 365) / (12 * count);
        }
      }
    }

    return NextResponse.json({
      connected: true,
      mrr: Math.round(mrrCents) / 100,
      currency,
      activeSubscriptions: subscriptions.data.length,
    });
  } catch {
    return NextResponse.json({ connected: true, error: "stripe_error" }, { status: 502 });
  }
}
