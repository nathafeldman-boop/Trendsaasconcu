"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/auth-error";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { track } from "@/lib/analytics/track";

const SIGNUP_ERRORS: Record<string, string> = {
  exists: "Ce compte existe déjà. Connecte-toi plutôt.",
  weak_password: "Mot de passe trop faible : utilise au moins 8 caractères.",
  invalid_email: "Cet email n'a pas l'air valide. Vérifie-le.",
  rate_limited: "Trop de tentatives en peu de temps. Réessaie dans quelques minutes.",
};

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const next = searchParams.get("next");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Arriving from a pricing card (?plan=) skips the wizard entirely and goes
  // straight to Stripe checkout — that's the whole point of picking a plan
  // first. Arriving with ?next= (e.g. the access-code page) returns there
  // instead. Otherwise, a brand-new account starts the onboarding wizard.
  async function complete() {
    if (onSuccess) {
      setLoading(false);
      onSuccess();
      return;
    }
    if (plan) {
      track("checkout_clicked", { plan, from: "signup" });
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: plan }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.assign(data.url);
          return;
        }
      } catch {
        // fall through below
      }
    }
    // Hard navigation, not router.push: Next's client Router Cache can
    // still be holding another route's render from whoever was signed in
    // before this signup, and router.refresh() alone only clears the
    // cache for the current route, not others already visited in this tab.
    window.location.assign(next || "/commencer");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      // No Supabase project wired in yet — keep the flow moving.
      complete();
      return;
    }

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") ?? "");
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    setLoading(true);
    let navigating = false;
    try {
      // Created server-side, already confirmed: no verification email.
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email, password }),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        setError(SIGNUP_ERRORS[result.error as string] ?? "Impossible de créer ton compte pour l'instant. Réessaie dans un instant.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(translateAuthError(signInError));
        return;
      }
      track("signup_completed", { method: "email", plan });
      navigating = true;
      await complete();
    } catch {
      setError("Impossible de contacter le serveur. Vérifie ta connexion et réessaie.");
    } finally {
      // Once heading to Stripe or the next page, the button stays in its
      // loading state instead of flicking back while that page loads.
      if (!navigating) setLoading(false);
    }
  }

  return (
    <div>
      {/* In the wizard (onSuccess), Google brings them back to /commencer,
          which skips its signup step once they're signed in. */}
      <GoogleSignIn next={onSuccess ? "/commencer" : plan ? "/tarifs" : next || "/commencer"} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input label="Ton prénom" name="firstName" placeholder="Camille" autoComplete="given-name" required />
        <Input label="Ton email" name="email" type="email" placeholder="camille@exemple.fr" autoComplete="email" required />
        <Input label="Un mot de passe" name="password" type="password" placeholder="8 caractères minimum" autoComplete="new-password" minLength={8} required />

        <p className="font-body text-[13px] leading-relaxed text-ink-faint">
          Ton prénom personnalise ton espace, ton email sert uniquement à te
          renvoyer ton idée et ton plan.
        </p>

        {error && (
          <p className="font-body text-[13px] leading-relaxed text-red-400">
            {error}
            {error.startsWith("Ce compte existe déjà") && (
              <>
                {" "}
                <a
                  href={plan ? `/connexion?plan=${plan}` : next ? `/connexion?next=${next}` : "/connexion"}
                  className="underline underline-offset-2 hover:text-red-300"
                >
                  Se connecter
                </a>
              </>
            )}
          </p>
        )}

        <Button type="submit" showArrow={false} disabled={loading} className="mt-1 w-full">
          {loading ? "Création en cours..." : "Créer mon compte"}
        </Button>

        <p className="text-center font-body text-[12px] leading-relaxed text-ink-faint">
          En créant ton compte, tu acceptes nos{" "}
          <a href="/conditions" className="underline underline-offset-2 hover:text-ink-muted">
            conditions d&apos;utilisation
          </a>{" "}
          et notre{" "}
          <a href="/confidentialite" className="underline underline-offset-2 hover:text-ink-muted">
            politique de confidentialité
          </a>
          .
        </p>
      </form>
    </div>
  );
}
