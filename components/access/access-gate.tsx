"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FloatingIcon } from "@/components/ui/floating-icon";
import { createClient } from "@/lib/supabase/client";

export function AccessGate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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

  return (
    <AuthShell
      eyebrow="Accès"
      title="Entre ton code d'accès"
      subtitle="Reçu par SaaSFounder ou par un membre de l'équipe — il te donne accès à ton espace."
      footer={
        <div className="flex flex-col gap-2">
          <p className="font-body text-[13px] text-ink-faint">
            Pas encore de compte ?{" "}
            <a href="/commencer" className="text-ink underline underline-offset-2 hover:text-accent">
              Commence ici
            </a>
          </p>
          <p className="font-body text-[13px] text-ink-faint">
            Pas de code ?{" "}
            <a href="/tarifs" className="text-ink underline underline-offset-2 hover:text-accent">
              Voir les tarifs
            </a>
          </p>
        </div>
      }
    >
      <FloatingIcon className="mb-6">
        <KeyRound className="size-5" strokeWidth={1.75} />
      </FloatingIcon>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Code d'accès"
          name="code"
          placeholder="SAASFOUNDER-XXXX"
          autoComplete="off"
          required
        />
        {error && <p className="font-body text-[13px] leading-relaxed text-red-400">{error}</p>}
        <Button type="submit" showArrow={false} disabled={loading} className="w-full">
          {loading ? "Vérification..." : "Valider"}
        </Button>
      </form>
    </AuthShell>
  );
}
