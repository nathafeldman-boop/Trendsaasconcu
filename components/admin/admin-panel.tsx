"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { UserPlus, Users, Radio, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingIcon } from "@/components/ui/floating-icon";
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

type UserRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  is_admin: boolean;
  has_access: boolean;
  plan: string | null;
  created_at: string;
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
  users,
}: {
  stats: { today: number; yesterday: number; dayBefore: number };
  online: OnlineUser[];
  codes: AccessCode[];
  users: UserRow[];
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
      <FloatingIcon>
        <Users className="size-5" strokeWidth={1.75} />
      </FloatingIcon>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Admin</h1>
      <p className="mt-2 font-body text-ink-muted">Vue d&apos;ensemble et gestion des accès.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard icon={UserPlus} label="Inscrits aujourd'hui" value={stats.today} />
        <StatCard icon={UserPlus} label="Inscrits hier" value={stats.yesterday} />
        <StatCard icon={UserPlus} label="Avant-hier" value={stats.dayBefore} />
        <StatCard icon={Radio} label="En ligne maintenant" value={online.length} />
      </div>

      {online.length > 0 && (
        <div className="mt-4 rounded-lg border border-ink/12 bg-ink/[0.02] p-4">
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
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <Users className="size-4 text-accent" strokeWidth={1.75} />
          Utilisateurs
        </h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-ink/12">
          <table className="w-full text-left font-body text-[14px]">
            <thead>
              <tr className="border-b border-ink/10 text-ink-faint">
                <th className="px-4 py-3 font-normal">Nom</th>
                <th className="px-4 py-3 font-normal">Email</th>
                <th className="px-4 py-3 font-normal">Accès</th>
                <th className="px-4 py-3 font-normal">Plan</th>
                <th className="px-4 py-3 font-normal">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 text-ink">
                    {u.first_name ?? "—"}
                    {u.is_admin && (
                      <span className="ml-2 rounded-full border border-accent/40 px-2 py-0.5 font-mono text-[10px] uppercase text-accent">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${
                        u.has_access
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-ink/8 text-ink-faint"
                      }`}
                    >
                      {u.has_access ? "Actif" : "Sans accès"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{u.plan ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-faint">
                    {new Date(u.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-faint">
                    Aucun utilisateur pour l&apos;instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <Ticket className="size-4 text-accent" strokeWidth={1.75} />
          Codes d&apos;accès
        </h2>
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

        <div className="mt-5 overflow-x-auto rounded-lg border border-ink/12">
          <table className="w-full text-left font-body text-[14px]">
            <thead>
              <tr className="border-b border-ink/10 text-ink-faint">
                <th className="px-4 py-3 font-normal">Code</th>
                <th className="px-4 py-3 font-normal">Label</th>
                <th className="px-4 py-3 font-normal">Utilisations</th>
                <th className="px-4 py-3 font-normal">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {codeList.map((c) => (
                <tr key={c.id} className="border-b border-ink/5 last:border-0">
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-ink/12 bg-ink/[0.02] p-5"
    >
      <Icon className="size-4 text-accent" strokeWidth={1.75} />
      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
    </motion.div>
  );
}
