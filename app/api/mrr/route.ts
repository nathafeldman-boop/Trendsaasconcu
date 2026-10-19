import { NextResponse } from "next/server";
import { getAuth } from "@/lib/supabase/auth";
import { getStripeMetrics } from "@/lib/stripe/metrics";

export async function GET() {
  const { supabase, user } = await getAuth();
  if (!supabase) return NextResponse.json({ connected: false });
  if (!user) return NextResponse.json({ connected: false }, { status: 401 });

  const metrics = await getStripeMetrics(user.id);
  return NextResponse.json(metrics, { status: "error" in metrics && metrics.error ? 502 : 200 });
}
