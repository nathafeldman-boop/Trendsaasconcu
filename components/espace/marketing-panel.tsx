"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type MarketingState = {
  chosen_channel: string | null;
  tiktok_url: string;
  self_reported_views: number | null;
  submitted_at: string | null;
};

const CHANNELS = ["TikTok", "Instagram"];

export function MarketingPanel({
  userId,
  ideaText,
  initial,
}: {
  userId: string;
  ideaText: string;
  initial: MarketingState;
}) {
  const [state, setState] = useState(initial);
  const [ideas, setIdeas] = useState<string[] | null>(null);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [urlDraft, setUrlDraft] = useState(initial.tiktok_url);
  const [viewsDraft, setViewsDraft] = useState(initial.self_reported_views?.toString() ?? "");
  const [saved, setSaved] = useState(false);

  async function persist(patch: Partial<MarketingState>) {
    const next = { ...state, ...patch };
    setState(next);
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("marketing_progress").upsert({ user_id: userId, ...next });
  }

  async function pickChannel(channel: string) {
    await persist({ chosen_channel: channel });
    setLoadingIdeas(true);
    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "content", idea: ideaText || "mon SaaS", tool: channel }),
      });
      const data = await res.json();
      setIdeas(data.ideas ?? []);
    } finally {
      setLoadingIdeas(false);
    }
  }

  async function submitUrl() {
    await persist({ tiktok_url: urlDraft.trim(), submitted_at: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function submitViews() {
    const views = Number(viewsDraft);
    await persist({ self_reported_views: Number.isFinite(views) ? views : null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.02] p-6">
      <h2 className="font-display text-xl font-semibold text-ink">Marketing</h2>
      <p className="mt-1 font-body text-[14px] text-ink-muted">
        Trouve tes premiers clients avec le bon canal et le bon format.
      </p>

      <div className="mt-5 flex gap-3">
        {CHANNELS.map((channel) => (
          <button
            key={channel}
            onClick={() => pickChannel(channel)}
            className={`rounded-full border px-4 py-2 font-body text-[14px] transition-colors ${
              state.chosen_channel === channel
                ? "border-accent/70 bg-accent/10 text-ink"
                : "border-white/15 text-ink-muted hover:border-accent/40"
            }`}
          >
            {channel}
          </button>
        ))}
      </div>

      {loadingIdeas && (
        <p className="mt-4 font-body text-[13px] text-ink-faint">Génération d&apos;idées...</p>
      )}

      {ideas && ideas.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {ideas.map((idea, i) => (
            <li
              key={i}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-3 font-body text-[13px] text-ink-muted"
            >
              {idea}
            </li>
          ))}
        </ul>
      )}

      {state.chosen_channel && (
        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Une fois postée</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Input
              label="URL de ta vidéo"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder={`https://${state.chosen_channel.toLowerCase()}.com/...`}
              className="min-w-[220px] flex-1"
            />
            <Button type="button" showArrow={false} onClick={submitUrl} className="self-end">
              Enregistrer
            </Button>
          </div>
          <p className="mt-2 font-body text-[12px] leading-relaxed text-ink-faint">
            On n&apos;a pas encore d&apos;accès direct aux statistiques de {state.chosen_channel} (ça demande
            leur API). Reviens dans 24h et indique tes vues ci-dessous si tu veux qu&apos;on ajuste nos
            conseils.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Input
              label="Vues (optionnel)"
              type="number"
              value={viewsDraft}
              onChange={(e) => setViewsDraft(e.target.value)}
              className="w-40"
            />
            <Button type="button" showArrow={false} variant="secondary" onClick={submitViews} className="self-end">
              Noter
            </Button>
          </div>
        </div>
      )}

      {saved && <p className="mt-3 font-body text-[12px] text-accent">Enregistré.</p>}
    </div>
  );
}
