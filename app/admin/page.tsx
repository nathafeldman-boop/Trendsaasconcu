import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/admin/admin-panel";

export const metadata: Metadata = {
  title: "Admin — SaaSFounder",
};

function dayRange(daysAgo: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysAgo);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const today = dayRange(0);
  const yesterday = dayRange(1);
  const dayBefore = dayRange(2);
  const onlineSince = new Date();
  onlineSince.setMinutes(onlineSince.getMinutes() - 5);

  const [todayCount, yesterdayCount, dayBeforeCount, online, codes] = await Promise.all([
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
      .select("id, first_name, last_seen_at")
      .gte("last_seen_at", onlineSince.toISOString())
      .order("last_seen_at", { ascending: false }),
    supabase
      .from("access_codes")
      .select("id, code, label, max_uses, uses_count, revoked, created_at")
      .order("created_at", { ascending: false }),
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
    />
  );
}
