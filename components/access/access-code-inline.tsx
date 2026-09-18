"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AccessCodeInline({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("La connexion au serveur n'est pas configurée pour l'instant.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/connexion");
      return;
    }

    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").trim();
    if (!code) return;

    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc("redeem_access_code", { p_code: code });
    setLoading(false);

    if (rpcError || !data) {
      setError("Code invalide, expiré ou déjà utilisé.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    router.push(profile?.is_admin ? "/admin" : "/espace");
  }

  if (!open) {
    return (
      <p className="mt-10 text-center font-body text-[12px] text-ink-faint">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="underline underline-offset-2 hover:text-accent"
        >
          Un code d&apos;accès ?
        </button>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-xs flex-col gap-3">
      <Input
        label="Code d'accès"
        name="code"
        placeholder="SAASFOUNDER-XXXX"
        autoComplete="off"
        required
      />
      {error && <p className="text-center font-body text-[12px] text-red-400">{error}</p>}
      <Button
        type="submit"
        showArrow={false}
        variant="secondary"
        size="sm"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Vérification..." : "Valider"}
      </Button>
    </form>
  );
}
