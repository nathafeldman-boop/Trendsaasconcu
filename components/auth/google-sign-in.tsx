"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/auth-error";

// "Continuer avec Google" plus the "ou" divider, shared by the login and
// signup forms. `next` is where /auth/callback sends the user once Google
// hands them back.
export function GoogleSignIn({ next }: { next: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return; // a double-tap would start two OAuth flows at once
    const supabase = createClient();
    if (!supabase) {
      setError("La connexion avec Google n'est pas disponible pour le moment.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    // On success the browser is already leaving for Google.
    if (oauthError) {
      setError(translateAuthError(oauthError));
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex h-[52px] w-full items-center justify-center gap-3 rounded-pill border border-ink/12 bg-ink/[0.04] font-body text-[15px] font-medium text-ink transition-all duration-150 hover:scale-[1.01] hover:border-accent/40 hover:bg-ink/[0.07] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24Z"
          />
          <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4-3.1Z" />
          <path
            fill="#EA4335"
            d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
          />
        </svg>
        {loading ? "Redirection vers Google..." : "Continuer avec Google"}
      </button>
      {error && <p className="mt-3 font-body text-[13px] leading-relaxed text-red-400">{error}</p>}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">Ou</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>
    </div>
  );
}
