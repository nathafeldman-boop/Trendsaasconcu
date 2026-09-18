import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe/client";
import { computeMrr } from "@/lib/stripe/mrr";
import { AdminPanel } from "@/components/admin/admin-panel";

export const metadata: Metadata = {
  title: "Admin — SaaSFounder",
  robots: { index: false, follow: false },
};

function dayRange(daysAgo: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysAgo);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function getPlatformRevenue() {
  const stripe = createStripeClient();
  if (!stripe) return { connected: false as const };

  try {
    const [subscriptions, charges] = await Promise.all([
      stripe.subscriptions.list({ status: "active", limit: 100 }),
      stripe.charges.list({ limit: 5 }),
    ]);
    const { mrr, currency } = computeMrr(subscriptions.data);

    return {
      connected: true as const,
      mrr,
      currency,
      activeSubscriptions: subscriptions.data.length,
      recentCharges: charges.data.map((c) => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency,
        email: c.billing_details?.email ?? c.receipt_email ?? null,
        status: c.status,
        created: c.created,
      })),
    };
  } catch {
    return { connected: true as const, error: "stripe_error" as const };
  }
}

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const today = dayRange(0);
  const yesterday = dayRange(1);
  const dayBefore = dayRange(2);
  const onlineSince = new Date();
  onlineSince.setMinutes(onlineSince.getMinutes() - 5);

  const [todayCount, yesterdayCount, dayBeforeCount, online, codes, users, platformRevenue] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today.start)
        .lt("created_at", today.end),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", yesterday.start)
        .lt("created_at", yesterday.end),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", dayBefore.start)
        .lt("created_at", dayBefore.end),
      supabase
        .from("profiles")
        .select("id, first_name, email, current_path, last_seen_at")
        .gte("last_seen_at", onlineSince.toISOString())
        .order("last_seen_at", { ascending: false }),
      supabase
        .from("access_codes")
        .select("id, code, label, max_uses, uses_count, revoked, grants_admin, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, email, first_name, is_admin, has_access, plan, current_path, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      getPlatformRevenue(),
    ]);

  return (
    <AdminPanel
      stats={{
        today: todayCount.count ?? 0,
        yesterday: yesterdayCount.count ?? 0,
        dayBefore: dayBeforeCount.count ?? 0,
      }}
      online={online.data ?? []}
      codes={codes.data ?? []}
      users={users.data ?? []}
      platformRevenue={platformRevenue}
    />
  );
}
