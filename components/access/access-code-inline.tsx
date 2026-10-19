"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";

export function AccessCodeInline({ alwaysOpen = false }: { alwaysOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(alwaysOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData(event.currentTarget);
      const code = String(form.get("code") ?? "").trim().toUpperCase();
      if (!code) {
        setError("Merci d'entrer ton code d'accès.");
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
        router.push("/connexion?next=/acces");
        return;
      }

      const { data, error: rpcError } = await supabase.rpc("redeem_access_code", { p_code: code });
      if (rpcError || !data) {
        setError("Code invalide, expiré ou déjà utilisé.");
        return;
      }

      // Hard navigation: this account's permissions just changed, and a
      // cached render of /espace from before could still reflect the old,
      // access-less state. Admin codes also land in the premium app: the
      // admin dashboard is one click away from its sidebar.
      track("access_code_redeemed");
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/espace");
    } catch (err) {
      setError(
        "Erreur inattendue : " + (err instanceof Error ? err.message : "réessaie dans un instant.")
      );
    } finally {
      setLoading(false);
    }
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
    <form
      onSubmit={handleSubmit}
      className={
        alwaysOpen
          ? "flex flex-col gap-3"
          : "mx-auto mt-10 flex max-w-xs flex-col gap-3"
      }
    >
      <Input
        label="Code d'accès"
        name="code"
        placeholder="Ton code (ex : NATHANAEL)"
        autoComplete="off"
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
