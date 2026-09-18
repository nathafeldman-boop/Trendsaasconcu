import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeMrr } from "@/lib/stripe/mrr";

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
    const { mrr, currency } = computeMrr(subscriptions.data);

    return NextResponse.json({
      connected: true,
      mrr,
      currency,
      activeSubscriptions: subscriptions.data.length,
    });
  } catch {
    return NextResponse.json({ connected: true, error: "stripe_error" }, { status: 502 });
  }
}
