"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const HEARTBEAT_INTERVAL_MS = 45_000;

// Mounted once in the root layout — reports where a signed-in visitor
// currently is (for the admin dashboard's live funnel view), on every route
// change, plus a periodic keep-alive so `last_seen_at` doesn't go stale
// while they sit on one page. Pages with their own richer step context
// (the onboarding wizard) overwrite `current_path` themselves after this
// runs; since that happens client-side without a route change, the interval
// here only touches `last_seen_at` so it doesn't clobber that richer label.
export function ActivityHeartbeat() {
  const pathname = usePathname();
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return;
      userIdRef.current = data.user.id;
      supabase
        .from("profiles")
        .update({ current_path: pathname, last_seen_at: new Date().toISOString() })
        .eq("id", data.user.id)
        .then(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const touch = async () => {
      const userId = userIdRef.current;
      if (!userId) return;
      await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", userId);
    };

    const interval = setInterval(touch, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
