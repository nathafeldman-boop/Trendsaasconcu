"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Always rendered, on every page, regardless of auth state — clicking it
// while already signed out is a harmless no-op. Deliberately not gated on
// a client-side session check: that check is async and can lag or race,
// which was making the sign-out control unreliable on pages that only
// showed it once a session was confirmed.
export function GlobalSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    setLoading(true);
    if (supabase) await supabase.auth.signOut();
    router.push("/connexion");
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="fixed left-4 top-20 z-[100] flex items-center gap-1.5 rounded-full border border-ink/12 bg-canvas/90 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint shadow-[0_4px_20px_-6px_rgba(0,0,0,0.25)] backdrop-blur-md transition-colors hover:border-accent/40 hover:text-ink disabled:opacity-50 sm:left-6 sm:top-24"
    >
      <LogOut className="size-3.5" strokeWidth={1.75} />
      {loading ? "..." : "Déconnexion"}
    </button>
  );
}
