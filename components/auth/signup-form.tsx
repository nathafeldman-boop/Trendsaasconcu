"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoogleButton } from "@/components/auth/google-button";
import { OrDivider } from "@/components/auth/or-divider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const complete = () => (onSuccess ? onSuccess() : router.push("/"));

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
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName } },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    complete();
  }

  async function handleGoogle() {
    if (!supabase) {
      complete();
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/commencer` },
    });
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
        <p className="font-body text-[13px] leading-relaxed text-red-400">{error}</p>
      )}

      <Button type="submit" showArrow={false} disabled={loading} className="mt-1 w-full">
        {loading ? "Création en cours..." : "Créer mon compte"}
      </Button>

      <OrDivider />
      <GoogleButton onClick={handleGoogle} />

      <p className="text-center font-body text-[12px] leading-relaxed text-ink-faint">
        En créant ton compte, tu acceptes nos{" "}
        <a href="#" className="underline underline-offset-2 hover:text-ink-muted">
          conditions d&apos;utilisation
        </a>{" "}
        et notre{" "}
        <a href="#" className="underline underline-offset-2 hover:text-ink-muted">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  );
}
