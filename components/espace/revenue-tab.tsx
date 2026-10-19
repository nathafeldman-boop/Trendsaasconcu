"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, KeyRound, Loader2, RefreshCw, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import type { StripeMetrics } from "@/lib/stripe/metrics";
import { money, revenueRecommendations } from "@/lib/espace/recommendations";
import { Recommendations } from "@/components/espace/recommendations";
import { Steps, TabHeader } from "@/components/espace/kit";
import { cn } from "@/lib/utils";

const INTERVALS: Record<string, [string, string]> = {
  day: ["jour", "jours"],
  week: ["semaine", "semaines"],
  month: ["mois", "mois"],
  year: ["an", "ans"],
};

function per(interval: string, count: number) {
  const [one, many] = INTERVALS[interval] ?? [interval, interval];
  return count > 1 ? `/ ${count} ${many}` : `/ ${one}`;
}

export function RevenueTab({ initialMetrics, revenueGoal }: { initialMetrics: StripeMetrics; revenueGoal: number | null }) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(!initialMetrics.connected || !!initialMetrics.error);

  const recs = useMemo(() => revenueRecommendations({ metrics, revenueGoal }), [metrics, revenueGoal]);
  const live = metrics.connected && !metrics.error ? metrics : null;

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/mrr");
      setMetrics(await res.json());
    } catch {
      // keep the last numbers on screen
    } finally {
      setRefreshing(false);
    }
  }

  async function disconnect() {
    const res = await fetch("/api/stripe-connection", { method: "DELETE" });
    if (res.ok) {
      setMetrics({ connected: false });
      setShowForm(true);
    }
  }

  return (
    <div className="mx-auto flex max-w-[940px] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <TabHeader
        eyebrow="Revenus"
        title="Tes revenus, en direct."
        sub="Branché sur ton propre compte Stripe, en lecture seule. Les recommandations sont calculées sur tes vrais chiffres."
      >
        {live && (
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 self-start rounded-full border border-ink/12 px-4 py-2 font-body text-[13px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
            Actualiser
          </button>
        )}
      </TabHeader>

      {live ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Kpi label="MRR" value={money(live.mrr, live.currency)} accent big hint="revenu mensuel récurrent" />
            <Kpi label="Abonnés actifs" value={String(live.activeSubscriptions)} hint={live.trialing ? `+ ${live.trialing} en essai` : undefined} />
            <Kpi label="Revenu moyen" value={money(live.arpu, live.currency)} hint="par abonné et par mois" />
            <Kpi label="Nouveaux · 30 j" value={String(live.newLast30)} tone={live.newLast30 > 0 ? "good" : undefined} />
            <Kpi label="Résiliations · 30 j" value={String(live.canceledLast30)} tone={live.canceledLast30 > 0 ? "warn" : undefined} />
            <Kpi label="Paiements en échec" value={String(live.pastDue)} tone={live.pastDue > 0 ? "warn" : undefined} />
          </div>

          {revenueGoal && live.currency === "eur" ? <GoalBar mrr={live.mrr} arpu={live.arpu} goal={revenueGoal} currency={live.currency} /> : null}
        </>
      ) : null}

      <Recommendations items={recs} />

      {live && live.prices.length > 0 && (
        <section className="glass-panel rounded-[24px] p-6 sm:p-8">
          <h2 className="font-display text-[18px] font-semibold text-ink">Tes prix en cours</h2>
          <p className="mt-1 font-body text-[13.5px] text-ink-muted">Les prix de tes abonnements actifs, du plus utilisé au moins utilisé.</p>
          <div className="mt-5 divide-y divide-ink/8 overflow-hidden rounded-[16px] border border-ink/10">
            {live.prices.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="font-display text-[16px] font-semibold text-ink">
                  {money(p.amount, p.currency)}{" "}
                  <span className="font-body text-[13px] font-normal text-ink-faint">{per(p.interval, p.intervalCount)}</span>
                </span>
                <span className="font-body text-[13px] text-ink-muted">
                  {p.subscriptions} abonné{p.subscriptions > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {showForm ? (
        <ConnectCard
          error={metrics.connected && !!metrics.error}
          onConnected={(m) => {
            setMetrics(m);
            setShowForm(false);
          }}
          onCancel={live ? () => setShowForm(false) : undefined}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-4 font-body text-[12.5px] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-success" /> Stripe connecté
          </span>
          <button type="button" onClick={() => setShowForm(true)} className="hover:text-ink">
            Changer de clé
          </button>
          <button type="button" onClick={disconnect} className="hover:text-red-400">
            Déconnecter
          </button>
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  accent,
  big,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  big?: boolean;
  tone?: "good" | "warn";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-panel relative overflow-hidden rounded-[20px] p-5", big && "col-span-2 lg:col-span-1")}
    >
      {accent && <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-accent/15 blur-2xl" />}
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{label}</p>
      <p
        className={cn(
          "mt-2 font-display font-semibold",
          big ? "text-[34px]" : "text-[26px]",
          accent ? "text-accent" : tone === "good" ? "text-success" : tone === "warn" ? "text-amber-300" : "text-ink"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 font-body text-[12px] text-ink-faint">{hint}</p>}
    </motion.div>
  );
}

function GoalBar({ mrr, arpu, goal, currency }: { mrr: number; arpu: number; goal: number; currency: string }) {
  const pct = Math.min(100, Math.round((mrr / goal) * 100));
  const missing = Math.max(0, goal - mrr);
  const customers = arpu > 0 ? Math.ceil(missing / arpu) : null;
  return (
    <div className="glass-panel rounded-[20px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-body text-[14px] text-ink">
          <Target className="size-4 text-accent" /> Ton objectif : {money(goal, "eur")} par mois
        </p>
        <p className="font-mono text-[12px] text-ink-muted">{pct}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(1, pct)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2.5 font-body text-[12.5px] text-ink-faint">
        {missing === 0
          ? "Objectif atteint. Il est temps d'en fixer un nouveau."
          : customers
            ? `Il te manque ${money(Math.round(missing), currency)} par mois, soit environ ${customers} abonné${customers > 1 ? "s" : ""} au revenu moyen actuel.`
            : `Il te manque ${money(Math.round(missing), currency)} par mois.`}
      </p>
    </div>
  );
}

function ConnectCard({
  error,
  onConnected,
  onCancel,
}: {
  error: boolean;
  onConnected: (metrics: StripeMetrics) => void;
  onCancel?: () => void;
}) {
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function connect() {
    if (!key.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.metrics) {
        setMessage(data.message ?? "Connexion impossible, réessaie.");
        return;
      }
      setKey("");
      onConnected(data.metrics);
    } catch {
      setMessage("Erreur réseau, réessaie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="connecter-stripe" className="glass-panel scroll-mt-16 rounded-[26px] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-ink/10 bg-ink/[0.04]">
          <BrandLogo brand="stripe" className="size-6" />
        </span>
        <div>
          <h2 className="font-display text-[22px] font-semibold text-ink">
            {error ? "Reconnecte ton Stripe" : "Connecte ton Stripe"}
          </h2>
          <p className="mt-1 font-body text-[14px] leading-relaxed text-ink-muted">
            Avec une clé restreinte en lecture seule : elle ne peut ni débiter, ni rembourser, ni rien modifier.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-5 flex items-start gap-2 rounded-[14px] border border-amber-300/30 bg-amber-300/10 p-3 font-body text-[13px] text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          On n&apos;arrive plus à lire ton compte avec la clé enregistrée. Crée-en une nouvelle et colle-la ci-dessous.
        </p>
      )}

      <div className="mt-6">
        <Steps
          steps={[
            "Ouvre Stripe → Développeurs → Clés API.",
            "Clique sur « Créer une clé restreinte » et nomme-la « SaaSFounder ».",
            "Mets « Lecture » sur Abonnements (Subscriptions) et Prix (Prices), laisse tout le reste sur « Aucun ».",
            "Crée la clé, copie-la (rk_live_...) et colle-la ici.",
          ]}
        />
        <a
          href="https://dashboard.stripe.com/apikeys"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 font-body text-[13px] text-accent hover:underline"
        >
          Ouvrir les clés API Stripe <ArrowUpRight className="size-3.5" />
        </a>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Clé Stripe restreinte</span>
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && connect()}
            placeholder="rk_live_..."
            autoComplete="off"
            className="h-[52px] w-full rounded-full border border-ink/12 bg-ink/[0.03] pl-11 pr-4 font-mono text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-accent/60"
          />
        </label>
        <Button showArrow={false} disabled={saving || !key.trim()} onClick={connect}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : "Connecter"}
        </Button>
      </div>
      {message && <p className="mt-3 font-body text-[13px] text-red-400">{message}</p>}
      {onCancel && (
        <button type="button" onClick={onCancel} className="mt-4 font-body text-[12.5px] text-ink-faint hover:text-ink">
          Annuler
        </button>
      )}
    </section>
  );
}
