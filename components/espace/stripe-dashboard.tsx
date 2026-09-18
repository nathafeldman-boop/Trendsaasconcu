"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingIcon } from "@/components/ui/floating-icon";
import { createClient } from "@/lib/supabase/client";

type MrrResponse =
  | { connected: false }
  | { connected: true; mrr: number; currency: string; activeSubscriptions: number }
  | { connected: true; error: string };

export function StripeDashboard() {
  const [status, setStatus] = useState<MrrResponse | null>(null);
  const [keyDraft, setKeyDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mrr")
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  async function connect() {
    if (!keyDraft.trim()) return;
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    if (!supabase) {
      setSaving(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("stripe_connections")
      .upsert({ user_id: user.id, stripe_secret_key: keyDraft.trim() });
    setSaving(false);
    if (error) {
      setMessage("Erreur lors de l'enregistrement.");
      return;
    }
    setKeyDraft("");
    setMessage("Clé enregistrée, calcul du MRR...");
    const res = await fetch("/api/mrr");
    setStatus(await res.json());
  }

  return (
    <div className="rounded-xl border border-ink/12 bg-ink/[0.02] p-6">
      <FloatingIcon className="size-10">
        <Wallet className="size-4" strokeWidth={1.75} />
      </FloatingIcon>
      <h2 className="mt-3 font-display text-xl font-semibold text-ink">Dashboard revenus</h2>
      <p className="mt-1 font-body text-[14px] text-ink-muted">
        Connecte ta clé Stripe (idéalement restreinte en lecture seule) pour suivre ton MRR ici.
      </p>

      {status?.connected && "mrr" in status ? (
        <div className="mt-5 flex items-center gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">MRR</p>
            <p className="mt-1 font-display text-3xl font-semibold text-accent">
              {status.mrr.toLocaleString("fr-FR", {
                style: "currency",
                currency: status.currency.toUpperCase(),
              })}
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              Abonnements actifs
            </p>
            <p className="mt-1 font-display text-3xl font-semibold text-ink">
              {status.activeSubscriptions}
            </p>
          </div>
        </div>
      ) : status?.connected && "error" in status ? (
        <p className="mt-5 font-body text-[13px] text-red-400">
          Impossible de lire ton compte Stripe — vérifie que la clé est valide.
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <Input
            label="Clé secrète Stripe"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="sk_live_... ou sk_test_..."
            type="password"
            className="min-w-[260px] flex-1"
          />
          <Button type="button" showArrow={false} disabled={saving} onClick={connect}>
            {saving ? "Connexion..." : "Connecter"}
          </Button>
        </div>
      )}
      {message && <p className="mt-3 font-body text-[12px] text-ink-faint">{message}</p>}
    </div>
  );
}
