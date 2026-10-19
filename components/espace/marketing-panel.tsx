"use client";

import { useState } from "react";
import { Loader2, Megaphone, RefreshCw, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo, type Brand } from "@/components/ui/brand-logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type MarketingProgress = {
  chosen_channel: string | null;
  tiktok_url: string;
  self_reported_views: number | null;
  submitted_at: string | null;
};

const CHANNELS: { id: string; brand: Brand; hint: string }[] = [
  { id: "TikTok", brand: "tiktok", hint: "De la portée sans abonnés au départ." },
  { id: "Instagram", brand: "instagram", hint: "Si ta cible y est déjà." },
];

export function MarketingPanel({
  userId,
  state,
  onChange,
}: {
  userId: string;
  state: MarketingProgress;
  onChange: (next: MarketingProgress) => void;
}) {
  const [ideas, setIdeas] = useState<string[] | null>(null);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [urlDraft, setUrlDraft] = useState(state.tiktok_url);
  const [viewsDraft, setViewsDraft] = useState(state.self_reported_views?.toString() ?? "");
  const [saved, setSaved] = useState<string | null>(null);

  async function persist(patch: Partial<MarketingProgress>) {
    onChange({ ...state, ...patch });
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("marketing_progress").upsert({ user_id: userId, ...patch });
  }

  async function loadIdeas(channel: string) {
    setLoadingIdeas(true);
    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "content", tool: channel }),
      });
      const data = await res.json();
      setIdeas(Array.isArray(data.ideas) ? data.ideas : []);
    } catch {
      setIdeas([]);
    } finally {
      setLoadingIdeas(false);
    }
  }

  async function pickChannel(channel: string) {
    await persist({ chosen_channel: channel });
    loadIdeas(channel);
  }

  function flash(text: string) {
    setSaved(text);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <section id="canal" className="glass-panel scroll-mt-16 rounded-[26px] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-accent/25 bg-accent/10 text-accent">
            <Megaphone className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="font-display text-[22px] font-semibold text-ink">Ton canal et tes idées de vidéos</h2>
            <p className="mt-1 font-body text-[14px] leading-relaxed text-ink-muted">
              Un seul canal pendant 30 jours. Choisis-le : 3 idées de vidéos adaptées à ton SaaS et à ta cible
              s&apos;affichent.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => pickChannel(channel.id)}
              className={cn(
                "flex items-center gap-3.5 rounded-[18px] border p-4 text-left transition-colors",
                state.chosen_channel === channel.id ? "border-accent/50 bg-accent/[0.07]" : "border-ink/10 hover:border-ink/25"
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-ink/10 bg-ink/[0.04]">
                <BrandLogo brand={channel.brand} className="size-5" />
              </span>
              <span>
                <span className="block font-display text-[15px] font-semibold text-ink">{channel.id}</span>
                <span className="block font-body text-[12.5px] text-ink-muted">{channel.hint}</span>
              </span>
            </button>
          ))}
        </div>

        {state.chosen_channel && (
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
                Idées de vidéos {state.chosen_channel}
              </p>
              {!loadingIdeas && (
                <button
                  type="button"
                  onClick={() => loadIdeas(state.chosen_channel!)}
                  className="flex items-center gap-1.5 font-body text-[12.5px] text-ink-faint hover:text-ink"
                >
                  <RefreshCw className="size-3.5" /> {ideas?.length ? "D'autres idées" : "Générer 3 idées"}
                </button>
              )}
            </div>
            {loadingIdeas ? (
              <p className="mt-3 flex items-center gap-2 font-body text-[13.5px] text-ink-faint">
                <Loader2 className="size-4 animate-spin text-accent" /> Ton coach cherche 3 idées pour ta cible...
              </p>
            ) : ideas?.length ? (
              <ul className="mt-3 flex flex-col gap-2.5">
                {ideas.map((idea, i) => (
                  <li key={i} className="flex gap-3 rounded-[16px] border border-ink/10 bg-ink/[0.025] p-4">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/12 font-mono text-[11px] text-accent">
                      {i + 1}
                    </span>
                    <span className="font-body text-[14px] leading-relaxed text-ink/90">{idea}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </section>

      {state.chosen_channel && (
        <section id="video" className="glass-panel scroll-mt-16 rounded-[26px] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-accent/25 bg-accent/10 text-accent">
              <Video className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="font-display text-[22px] font-semibold text-ink">Ta vidéo publiée</h2>
              <p className="mt-1 font-body text-[14px] leading-relaxed text-ink-muted">
                Colle son lien, puis note tes vues 24 h après : les recommandations s&apos;adaptent à tes résultats.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Lien de ta vidéo"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder={`https://www.${state.chosen_channel.toLowerCase()}.com/...`}
                className="w-full"
              />
            </div>
            <Button
              type="button"
              showArrow={false}
              variant="secondary"
              disabled={!urlDraft.trim()}
              onClick={async () => {
                await persist({ tiktok_url: urlDraft.trim(), submitted_at: new Date().toISOString() });
                flash("Vidéo enregistrée.");
              }}
            >
              Enregistrer
            </Button>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-56">
              <Input
                label="Vues après 24 h"
                type="number"
                min={0}
                value={viewsDraft}
                onChange={(e) => setViewsDraft(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              type="button"
              showArrow={false}
              variant="secondary"
              disabled={viewsDraft === ""}
              onClick={async () => {
                const views = Number(viewsDraft);
                await persist({ self_reported_views: Number.isFinite(views) && views >= 0 ? Math.round(views) : null });
                flash("Vues notées, recommandations mises à jour.");
              }}
            >
              Noter mes vues
            </Button>
          </div>
          <p className="mt-3 font-body text-[12px] leading-relaxed text-ink-faint">
            On n&apos;a pas d&apos;accès direct aux statistiques de {state.chosen_channel} : c&apos;est toi qui notes tes vues.
          </p>
          {saved && <p className="mt-3 font-body text-[12.5px] text-accent">{saved}</p>}
        </section>
      )}
    </div>
  );
}
