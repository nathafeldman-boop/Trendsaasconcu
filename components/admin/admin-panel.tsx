"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type AccessCode = {
  id: string;
  code: string;
  label: string | null;
  max_uses: number;
  uses_count: number;
  revoked: boolean;
  created_at: string;
};

type OnlineUser = {
  id: string;
  first_name: string | null;
  last_seen_at: string | null;
};

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SAASFOUNDER-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function AdminPanel({
  stats,
  online,
  codes,
}: {
  stats: { today: number; yesterday: number; dayBefore: number };
  online: OnlineUser[];
  codes: AccessCode[];
}) {
  const [codeList, setCodeList] = useState(codes);
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [creating, setCreating] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteStatus, setPromoteStatus] = useState<string | null>(null);

  async function createCode() {
    const supabase = createClient();
    if (!supabase) return;
    setCreating(true);
    const code = randomCode();
    const { data, error } = await supabase
      .from("access_codes")
      .insert({ code, label: label || null, max_uses: maxUses })
      .select()
      .single();
    setCreating(false);
    if (!error && data) {
      setCodeList((list) => [data, ...list]);
      setLabel("");
      setMaxUses(1);
    }
  }

  async function promote(event: FormEvent) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase || !promoteEmail.trim()) return;
    setPromoteStatus(null);
    const { data, error } = await supabase.rpc("promote_to_admin", { p_email: promoteEmail.trim() });
    if (error) {
      setPromoteStatus("Erreur : " + error.message);
    } else if (data) {
      setPromoteStatus(`${promoteEmail} est maintenant admin.`);
      setPromoteEmail("");
    } else {
      setPromoteStatus("Aucun compte trouvé avec cet email.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Admin</h1>
      <p className="mt-2 font-body text-ink-muted">Vue d&apos;ensemble et gestion des accès.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Inscrits aujourd'hui" value={stats.today} />
        <StatCard label="Inscrits hier" value={stats.yesterday} />
        <StatCard label="Avant-hier" value={stats.dayBefore} />
        <StatCard label="En ligne maintenant" value={online.length} />
      </div>

      {online.length > 0 && (
        <div className="mt-4 rounded-lg border border-white/12 bg-white/[0.02] p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">En ligne</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {online.map((u) => (
              <span
                key={u.id}
                className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-body text-[13px] text-ink"
              >
                {u.first_name ?? "Anonyme"}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Codes d&apos;accès</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Input
            label="Label (optionnel)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Marceau - lot 1"
          />
          <Input
            label="Nombre d'utilisations"
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value) || 1)}
            className="w-40"
          />
          <Button type="button" showArrow={false} disabled={creating} onClick={createCode}>
            {creating ? "Création..." : "Créer un code"}
          </Button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-lg border border-white/12">
          <table className="w-full text-left font-body text-[14px]">
            <thead>
              <tr className="border-b border-white/10 text-ink-faint">
                <th className="px-4 py-3 font-normal">Code</th>
                <th className="px-4 py-3 font-normal">Label</th>
                <th className="px-4 py-3 font-normal">Utilisations</th>
                <th className="px-4 py-3 font-normal">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {codeList.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-ink">{c.code}</td>
                  <td className="px-4 py-3 text-ink-muted">{c.label ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {c.uses_count} / {c.max_uses}
                  </td>
                  <td className="px-4 py-3 text-ink-faint">
                    {new Date(c.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
              {codeList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-faint">
                    Aucun code créé pour l&apos;instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 max-w-sm">
        <h2 className="font-display text-xl font-semibold text-ink">Ajouter un admin</h2>
        <form onSubmit={promote} className="mt-4 flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            placeholder="marceau@exemple.fr"
          />
          <Button type="submit" showArrow={false} variant="secondary">
            Promouvoir
          </Button>
          {promoteStatus && <p className="font-body text-[13px] text-ink-muted">{promoteStatus}</p>}
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/[0.02] p-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
