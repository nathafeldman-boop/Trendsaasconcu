import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe/client";
import { computeMrr } from "@/lib/stripe/mrr";
import { AdminPanel, type DailyFunnel } from "@/components/admin/admin-panel";
import { AnalyticsDashboard, type Analytics, type FeedEvent } from "@/components/admin/analytics-dashboard";

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
    // The Stripe account is shared with other apps (Stageio...): only what
    // is billed for a SaaSFounder product counts here.
    const [products, subscriptions, invoices, charges] = await Promise.all([
      stripe.products.list({ limit: 100 }),
      stripe.subscriptions.list({ status: "active", limit: 100 }),
      stripe.invoices.list({ status: "paid", limit: 100 }),
      stripe.charges.list({ limit: 100 }),
    ]);
    const ours = new Set(products.data.filter((p) => /saas\s*founder/i.test(p.name)).map((p) => p.id));
    const productId = (p: string | { id: string } | null | undefined) => (typeof p === "string" ? p : p?.id);

    const active = subscriptions.data.filter((s) => s.items.data.some((i) => ours.has(productId(i.price?.product) ?? "")));
    const { mrr, currency } = computeMrr(active);

    // Subscription payments come as invoices; one-time payments (lifetime)
    // carry a "SaaSFounder · …" description on their charge.
    const fromInvoices = invoices.data
      .filter((inv) => inv.lines.data.some((l) => ours.has(productId(l.pricing?.price_details?.product) ?? "")))
      .map((inv) => ({
        id: inv.id ?? inv.number ?? "",
        amount: inv.amount_paid / 100,
        currency: inv.currency,
        email: inv.customer_email ?? null,
        status: "succeeded",
        created: inv.status_transitions?.paid_at ?? inv.created,
      }));
    const oneTime = charges.data
      .filter((c) => /^saas\s*founder/i.test(c.description ?? ""))
      .map((c) => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency,
        email: c.billing_details?.email ?? c.receipt_email ?? null,
        status: c.status as string,
        created: c.created,
      }));

    return {
      connected: true as const,
      mrr,
      currency,
      activeSubscriptions: active.length,
      recentCharges: [...fromInvoices, ...oneTime].sort((a, b) => b.created - a.created).slice(0, 10),
    };
  } catch {
    return { connected: true as const, error: "stripe_error" as const };
  }
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const supabase = await createClient();
  if (!supabase) return null;

  const requested = Number((await searchParams).p);
  const period = [7, 30, 90].includes(requested) ? requested : 30;

  const today = dayRange(0);
  const yesterday = dayRange(1);
  const dayBefore = dayRange(2);
  const onlineSince = new Date();
  onlineSince.setMinutes(onlineSince.getMinutes() - 5);

  const [todayCount, yesterdayCount, dayBeforeCount, online, codes, users, platformRevenue, analytics, recent, daily] =
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
        .select("id, email, first_name, is_admin, has_access, plan, current_path, created_at, last_seen_at")
        .order("created_at", { ascending: false })
        .limit(200),
      getPlatformRevenue(),
      supabase.rpc("admin_analytics", { p_days: period }),
      supabase
        .from("events")
        .select("id, created_at, name, path, props, user_id, anon_id, source, device, country")
        .order("created_at", { ascending: false })
        .limit(40),
      supabase.rpc("admin_daily_funnel", { p_days: 14 }),
    ]);

  if (analytics.error) console.error("admin_analytics failed:", analytics.error.message);
  if (daily.error) console.error("admin_daily_funnel failed:", daily.error.message);

  // Names for the live feed: the 200 latest accounts cover nearly every
  // event; anyone older shows as "Compte".
  const names = new Map((users.data ?? []).map((u) => [u.id, u.first_name || u.email || "Compte"]));
  const feed: FeedEvent[] = (recent.data ?? []).map((e) => ({
    ...e,
    props: (e.props ?? null) as Record<string, unknown> | null,
    who: e.user_id ? (names.get(e.user_id) ?? null) : null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-6 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-ink">Admin</h1>
        <div className="flex gap-2">
          <Link href="/simulation" className="rounded-full border border-ink/15 px-4 py-2 font-body text-[13px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink">
            Simulation
          </Link>
          <Link href="/admin/createurs" className="rounded-full border border-ink/15 px-4 py-2 font-body text-[13px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink">
            Créateurs
          </Link>
        </div>
      </div>
      <p className="mt-1 font-body text-ink-muted">Le parcours de tes visiteurs, tes revenus et la gestion des accès.</p>
      <div className="mt-8">
        <AnalyticsDashboard period={period} data={(analytics.data as Analytics | null) ?? null} feed={feed} />
      </div>
      <AdminPanel
        stats={{
          today: todayCount.count ?? 0,
          yesterday: yesterdayCount.count ?? 0,
          dayBefore: dayBeforeCount.count ?? 0,
        }}
        daily={(daily.data as DailyFunnel[] | null) ?? []}
        online={online.data ?? []}
        codes={codes.data ?? []}
        users={users.data ?? []}
        platformRevenue={platformRevenue}
      />
    </div>
  );
}
