import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeMetrics } from "@/lib/stripe/metrics";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ connected: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ connected: false }, { status: 401 });

  const metrics = await getStripeMetrics(user.id);
  return NextResponse.json(metrics, { status: "error" in metrics && metrics.error ? 502 : 200 });
}
