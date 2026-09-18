"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/auth-error";

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Arriving from a pricing card (?plan=) skips the wizard entirely and goes
  // straight to Stripe checkout — that's the whole point of picking a plan
  // first. Otherwise, a brand-new account starts the onboarding wizard.
  async function complete() {
    if (onSuccess) {
      onSuccess();
      return;
    }
    if (plan) {
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
        // fall through to /commencer below
      }
    }
    router.push("/commencer");
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
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName } },
      });

      if (signUpError) {
        setError(translateAuthError(signUpError));
        return;
      }
      if (!data.session) {
        // Supabase returns this same shape (a user object, no session, no
        // error) for two very different cases, to avoid leaking which
        // emails are registered: a brand-new signup awaiting confirmation,
        // and a retry on an email that already has an account. `identities`
        // is empty only in the second case — that's the documented way to
        // tell them apart.
        if (data.user?.identities?.length === 0) {
          setError("Ce compte existe déjà. Connecte-toi plutôt.");
          return;
        }
        setError(
          "Ton compte est créé mais pas encore confirmé. Vérifie ta boîte mail (et les spams) pour activer ton accès."
        );
        return;
      }
      complete();
    } catch {
      setError("Impossible de contacter le serveur. Vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
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
                href={plan ? `/connexion?plan=${plan}` : "/connexion"}
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
  );
}
