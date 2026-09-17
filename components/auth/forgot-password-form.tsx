"use client";

import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const supabase = createClient();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    if (!supabase) {
      setSent(true);
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell
        eyebrow="Vérifie tes mails"
        title="Lien envoyé."
        subtitle="Si un compte existe avec cet email, tu vas recevoir un lien pour choisir un nouveau mot de passe."
        footer={
          <p className="font-body text-[13px] text-ink-faint">
            <a href="/connexion" className="text-ink underline underline-offset-2 hover:text-accent">
              Retour à la connexion
            </a>
          </p>
        }
      >
        <div />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Mot de passe oublié"
      title="Réinitialise ton mot de passe"
      subtitle="Indique ton email, on t'envoie un lien pour en choisir un nouveau."
      footer={
        <p className="font-body text-[13px] text-ink-faint">
          <a href="/connexion" className="text-ink underline underline-offset-2 hover:text-accent">
            Retour à la connexion
          </a>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Ton email"
          name="email"
          type="email"
          placeholder="camille@exemple.fr"
          autoComplete="email"
          required
        />
        {error && <p className="font-body text-[13px] leading-relaxed text-red-400">{error}</p>}
        <Button type="submit" showArrow={false} disabled={loading} className="w-full">
          {loading ? "Envoi en cours..." : "Envoyer le lien"}
        </Button>
      </form>
    </AuthShell>
  );
}
