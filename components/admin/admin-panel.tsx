"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { UserPlus, Users, Radio, Ticket, Wallet } from "lucide-react";
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
  grants_admin: boolean;
  created_at: string;
};

type OnlineUser = {
  id: string;
  first_name: string | null;
  email: string | null;
  current_path: string | null;
  last_seen_at: string | null;
};

type UserRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  is_admin: boolean;
  has_access: boolean;
  plan: string | null;
  current_path: string | null;
  created_at: string;
};

type PlatformRevenue =
  | { connected: false }
  | { connected: true; error: "stripe_error" }
  | {
      connected: true;
      mrr: number;
      currency: string;
      activeSubscriptions: number;
      recentCharges: {
        id: string;
        amount: number;
        currency: string;
        email: string | null;
        status: string;
        created: number;
      }[];
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
  platformRevenue,
}: {
  stats: { today: number; yesterday: number; dayBefore: number };
  online: OnlineUser[];
  codes: AccessCode[];
  users: UserRow[];
  platformRevenue: PlatformRevenue;
}) {
  const [codeList, setCodeList] = useState(codes);
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [grantsAdmin, setGrantsAdmin] = useState(false);
  const [creating, setCreating] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteStatus, setPromoteStatus] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  async function createCode() {
    const supabase = createClient();
    if (!supabase) return;
    setCreating(true);
    setCodeError(null);
    const code = randomCode();
    const { data, error } = await supabase
      .from("access_codes")
      .insert({ code, label: label || null, max_uses: maxUses, grants_admin: grantsAdmin })
      .select()
      .single();
    setCreating(false);
    if (error || !data) {
      setCodeError("Erreur : " + (error?.message ?? "création impossible."));
      return;
    }
    setCodeList((list) => [data, ...list]);
    setLabel("");
    setMaxUses(1);
    setGrantsAdmin(false);
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
          <div className="mt-3 flex flex-col gap-2">
            {online.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/20 bg-accent/[0.05] px-3 py-2"
              >
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-body text-[13px] font-medium text-ink">
                  {u.first_name ?? "Anonyme"}
                </span>
                <span className="font-body text-[12px] text-ink-muted">{u.email ?? "—"}</span>
                <span className="ml-auto font-mono text-[11px] text-ink-faint">
                  {u.current_path ?? "page inconnue"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform revenue */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <Wallet className="size-4 text-accent" strokeWidth={1.75} />
          Revenus de la plateforme
        </h2>
        {!platformRevenue.connected && (
          <p className="mt-4 font-body text-[14px] text-ink-faint">
            Clé Stripe (STRIPE_SECRET_KEY) pas encore configurée côté serveur.
          </p>
        )}
        {platformRevenue.connected && "error" in platformRevenue && (
          <p className="mt-4 font-body text-[14px] text-red-400">
            Impossible de lire Stripe pour l&apos;instant.
          </p>
        )}
        {platformRevenue.connected && "mrr" in platformRevenue && (
          <div className="mt-4 rounded-lg border border-ink/12 bg-ink/[0.02] p-6">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">MRR</p>
                <p className="mt-1 font-display text-2xl font-semibold text-accent">
                  {platformRevenue.mrr.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: platformRevenue.currency.toUpperCase(),
                  })}
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                  Abonnements actifs
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink">
                  {platformRevenue.activeSubscriptions}
                </p>
              </div>
            </div>

            {platformRevenue.recentCharges.length > 0 && (
              <div className="mt-6 border-t border-ink/10 pt-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                  Derniers paiements
                </p>
                <div className="mt-3 flex flex-col divide-y divide-ink/8">
                  {platformRevenue.recentCharges.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="font-body text-[14px] font-medium text-ink">
                          {c.amount.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: c.currency.toUpperCase(),
                          })}
                        </p>
                        <p className="font-body text-[12px] text-ink-muted">{c.email ?? "—"}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-medium ${
                          c.status === "succeeded"
                            ? "bg-success/12 text-success"
                            : "bg-ink/8 text-ink-faint"
                        }`}
                      >
                        {c.status === "succeeded" ? "Réussi" : c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
                <th className="px-4 py-3 font-normal">Où</th>
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
                          ? "bg-success/12 text-success"
                          : "bg-ink/8 text-ink-faint"
                      }`}
                    >
                      {u.has_access ? "Actif" : "Sans accès"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{u.plan ?? "—"}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-mono text-[12px] text-ink-faint">
                    {u.current_path ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-faint">
                    {new Date(u.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink-faint">
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
          <label className="flex h-[52px] items-center gap-2 font-body text-[13px] text-ink-muted">
            <input
              type="checkbox"
              checked={grantsAdmin}
              onChange={(e) => setGrantsAdmin(e.target.checked)}
              className="size-4 accent-accent"
            />
            Donne aussi l&apos;accès admin (dashboard)
          </label>
          <Button type="button" showArrow={false} disabled={creating} onClick={createCode}>
            {creating ? "Création..." : "Créer un code"}
          </Button>
        </div>
        {codeError && <p className="mt-2 font-body text-[13px] text-red-400">{codeError}</p>}

        <div className="mt-5 overflow-x-auto rounded-lg border border-ink/12">
          <table className="w-full text-left font-body text-[14px]">
            <thead>
              <tr className="border-b border-ink/10 text-ink-faint">
                <th className="px-4 py-3 font-normal">Code</th>
                <th className="px-4 py-3 font-normal">Label</th>
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 font-normal">Utilisations</th>
                <th className="px-4 py-3 font-normal">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {codeList.map((c) => (
                <tr key={c.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-ink">{c.code}</td>
                  <td className="px-4 py-3 text-ink-muted">{c.label ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${
                        c.grants_admin ? "bg-accent/15 text-accent" : "bg-ink/8 text-ink-faint"
                      }`}
                    >
                      {c.grants_admin ? "Admin" : "Accès"}
                    </span>
                  </td>
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
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-faint">
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
        <p className="mt-1 font-body text-[13px] text-ink-faint">
          Pour quelqu&apos;un qui a déjà un compte (par email, sans code).
        </p>
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
