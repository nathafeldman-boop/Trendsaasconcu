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
//
// This is a slim full-width bar that occupies real space at the very top
// of the document (sticky, not fixed), so it reserves its own strip and
// every page's own header renders below it — a floating/fixed button here
// previously ended up overlapping page content once the user scrolled a
// taller page like the signup form.
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
