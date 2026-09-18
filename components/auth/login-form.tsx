"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleButton } from "@/components/auth/google-button";
import { OrDivider } from "@/components/auth/or-divider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const complete = () => (onSuccess ? onSuccess() : router.push("/"));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      complete();
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
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
      <Input label="Ton email" name="email" type="email" placeholder="camille@exemple.fr" autoComplete="email" required />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted"
          >
            Mot de passe
          </label>
          <Link
            href="/mot-de-passe-oublie"
            className="font-body text-[12px] text-ink-faint underline underline-offset-2 hover:text-ink-muted"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-[52px] rounded-lg border border-ink/12 bg-ink/[0.03] px-4 font-body text-[15px] text-ink outline-none transition-colors duration-150 focus:border-accent/60 focus:bg-ink/[0.05]"
        />
      </div>

      {error && (
        <p className="font-body text-[13px] leading-relaxed text-red-400">{error}</p>
      )}

      <Button type="submit" showArrow={false} disabled={loading} className="mt-1 w-full">
        {loading ? "Connexion en cours..." : "Me connecter"}
      </Button>

      <OrDivider />
      <GoogleButton onClick={handleGoogle} />
    </form>
  );
}
