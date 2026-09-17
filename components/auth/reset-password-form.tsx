"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const supabase = createClient();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");

    if (!supabase) {
      router.push("/connexion");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/espace");
  }

  return (
    <AuthShell
      eyebrow="Nouveau mot de passe"
      title="Choisis un nouveau mot de passe"
      subtitle="Utilise le lien reçu par email pour arriver ici, puis choisis ton nouveau mot de passe."
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
          label="Nouveau mot de passe"
          name="password"
          type="password"
          placeholder="8 caractères minimum"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {error && <p className="font-body text-[13px] leading-relaxed text-red-400">{error}</p>}
        <Button type="submit" showArrow={false} disabled={loading} className="w-full">
          {loading ? "Mise à jour..." : "Valider"}
        </Button>
      </form>
    </AuthShell>
  );
}
