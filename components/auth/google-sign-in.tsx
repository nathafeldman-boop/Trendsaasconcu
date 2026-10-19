"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/auth-error";
import { track } from "@/lib/analytics/track";

// Two ways to sign in with Google:
// - the official Google button (Google Identity Services), when
//   NEXT_PUBLIC_GOOGLE_CLIENT_ID is set: the popup is opened from this
//   site, so Google shows "SaaS Founder" / saasfounder.fr instead of the
//   Supabase project domain. Needs the site listed in the OAuth client's
//   "Authorized JavaScript origins" in Google Cloud, hence the opt-in.
// - Supabase's OAuth redirect (/auth/callback), as before: used without
//   the env var, or when Google's script is blocked or doesn't load.
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
const GSI_SRC = "https://accounts.google.com/gsi/client";

type GoogleIdentity = {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    nonce: string;
    ux_mode: "popup";
    itp_support: boolean;
    auto_select: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentity } };
  }
}

let gsiLoading: Promise<GoogleIdentity> | null = null;

function loadGoogleIdentity() {
  const ready = window.google?.accounts?.id;
  if (ready) return Promise.resolve(ready);
  gsiLoading ??= new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => {
      const id = window.google?.accounts?.id;
      if (id) resolve(id);
      else reject(new Error("Google Identity Services missing"));
    };
    script.onerror = () => {
      gsiLoading = null; // let a later mount try again
      script.remove();
      reject(new Error("Google Identity Services blocked"));
    };
    document.head.appendChild(script);
  });
  return gsiLoading;
}

// Supabase checks that the ID token's nonce is the SHA-256 of the one it
// gets, so Google receives the hash and Supabase the raw value.
function randomNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes));
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

type Mode = "loading" | "official" | "redirect";

// "Continuer avec Google" plus the "ou" divider, shared by the login and
// signup forms. `onSignedIn` runs once signed in with the official button
// (the forms pass the same step as after an email sign-in); `next` is
// where the redirect flow lands, and the fallback when there's no
// `onSignedIn`.
export function GoogleSignIn({ next, onSignedIn }: { next: string; onSignedIn?: () => void | Promise<void> }) {
  const [mode, setMode] = useState<Mode>(GOOGLE_CLIENT_ID ? "loading" : "redirect");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slot = useRef<HTMLDivElement>(null);
  // The Google callback is registered once; read the latest props from here.
  const latest = useRef({ next, onSignedIn });
  useEffect(() => {
    latest.current = { next, onSignedIn };
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const clientId = GOOGLE_CLIENT_ID;
    let cancelled = false;
    // A slow or silently blocked script shouldn't leave a dead slot.
    const giveUp = setTimeout(() => setMode((m) => (m === "loading" ? "redirect" : m)), 5000);

    async function onCredential(credential: string, rawNonce: string) {
      const supabase = createClient();
      if (!supabase) {
        setError("La connexion avec Google n'est pas disponible pour le moment.");
        return;
      }
      setError(null);
      setBusy(true);
      const { error: idTokenError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credential,
        nonce: rawNonce,
      });
      if (idTokenError) {
        console.error("Google ID token sign-in failed:", idTokenError.message);
        setError(translateAuthError(idTokenError));
        setBusy(false);
        return;
      }
      // First name from Google + signup/login event, like /auth/callback.
      await fetch("/api/auth/google", { method: "POST" }).catch(() => undefined);
      const { next: target, onSignedIn: done } = latest.current;
      // Stays "busy" from here: either the parent moves on or the page changes.
      if (done) await done();
      else window.location.assign(target);
    }

    (async () => {
      try {
        const rawNonce = randomNonce();
        const [google, hashedNonce] = await Promise.all([loadGoogleIdentity(), sha256Hex(rawNonce)]);
        const el = slot.current;
        if (cancelled || !el) return;
        google.initialize({
          client_id: clientId,
          callback: (response) => void onCredential(response.credential, rawNonce),
          nonce: hashedNonce,
          ux_mode: "popup",
          itp_support: true,
          auto_select: false,
        });
        google.renderButton(el, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          locale: "fr",
          // Google caps the button at 400px and only takes a pixel width.
          width: Math.max(200, Math.min(400, Math.round(el.offsetWidth))),
          click_listener: () => track("google_clicked", { next: latest.current.next, ui: "google" }),
        });
        setMode("official");
      } catch {
        if (!cancelled) setMode("redirect");
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(giveUp);
    };
  }, []);

  async function redirectToGoogle() {
    if (busy) return; // a double-tap would start two OAuth flows at once
    const supabase = createClient();
    if (!supabase) {
      setError("La connexion avec Google n'est pas disponible pour le moment.");
      return;
    }
    setError(null);
    setBusy(true);
    track("google_clicked", { next });
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    // On success the browser is already leaving for Google.
    if (oauthError) {
      setError(translateAuthError(oauthError));
      setBusy(false);
    }
  }

  return (
    <div>
      {mode === "redirect" ? (
        <button
          type="button"
          onClick={redirectToGoogle}
          disabled={busy}
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-pill border border-ink/12 bg-ink/[0.04] font-body text-[15px] font-medium text-ink transition-all duration-150 hover:scale-[1.01] hover:border-accent/40 hover:bg-ink/[0.07] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
        >
          <GoogleLogo />
          {busy ? "Redirection vers Google..." : "Continuer avec Google"}
        </button>
      ) : (
        <div className="relative flex h-[52px] items-center justify-center">
          {/* Google draws its button (an iframe) inside this slot. */}
          <div ref={slot} className={busy ? "invisible flex w-full justify-center" : "flex w-full justify-center"} />
          {mode === "loading" && (
            <div
              aria-hidden
              className="absolute inset-x-0 top-1/2 mx-auto h-10 max-w-[400px] -translate-y-1/2 animate-pulse rounded-pill bg-ink/[0.06]"
            />
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center gap-2.5 rounded-pill border border-ink/12 bg-ink/[0.04] font-body text-[15px] font-medium text-ink">
              <Loader2 className="size-4 animate-spin text-accent" />
              Connexion avec Google...
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-3 font-body text-[13px] leading-relaxed text-red-400">{error}</p>}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">Ou</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
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
  );
}
