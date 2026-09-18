"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Always rendered, on every page, regardless of auth state — clicking it
// while already signed out is a harmless no-op. Deliberately not gated on
// a client-side session check: that check is async and can lag or race,
// which was making the sign-out control unreliable on pages that only
// showed it once a session was confirmed.
//
// This is a slim full-width bar that occupies real space at the very top
// of the document (sticky, not fixed), so it reserves its own strip and
// every page's own header renders below it — a floating/fixed button here
// previously ended up overlapping page content once the user scrolled a
// taller page like the signup form.
export function GlobalSignOut() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    setLoading(true);
    if (supabase) await supabase.auth.signOut();
    // A hard navigation, not router.push, because Next's client-side Router
    // Cache holds other already-visited routes' rendered output in memory —
    // router.refresh() only clears the cache for the route you're currently
    // on. Without this, signing out and creating a second account in the
    // same tab could still serve a stale, signed-in-as-the-old-account
    // render for some other route until that cache entry expired.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/connexion");
  }

  return (
    <div className="sticky top-0 z-[100] flex justify-end border-b border-ink/8 bg-canvas/95 px-4 py-2 backdrop-blur-md">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
      >
        <LogOut className="size-3.5" strokeWidth={1.75} />
        {loading ? "..." : "Déconnexion"}
      </button>
    </div>
  );
}
