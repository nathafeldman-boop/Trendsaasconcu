"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const HEARTBEAT_INTERVAL_MS = 45_000;

export function PresenceHeartbeat() {
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let cancelled = false;

    const touch = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (userId && !cancelled) {
        await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", userId);
      }
    };

    touch();
    const interval = setInterval(touch, HEARTBEAT_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return null;
}
