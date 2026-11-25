"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const FIELD =
  "h-[52px] w-full rounded-lg border border-ink/12 bg-accent/5 pl-[92px] pr-4 font-body text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-accent/60";

function LinkField({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-body text-[13px] font-semibold text-ink-muted">{label}</span>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode="url" className={FIELD} />
    </label>
  );
}

type Platform = "tiktok" | "instagram";
const NAME: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram" };
const other = (p: Platform): Platform => (p === "tiktok" ? "instagram" : "tiktok");

/** A video already added on one platform only, that a new link could be the twin of. */
export type LonePost = { key: string; platform: Platform; date: string; views: number };

const CHOICE =
  "w-full rounded-lg border border-ink/12 bg-ink/[0.03] px-4 py-3 text-left font-body text-[14px] text-ink transition-colors hover:border-accent/60 hover:bg-accent/5 disabled:opacity-50";

/**
 * A new video: its TikTok link, its Instagram link, or both. With a single
 * link, it first asks whether the same video is on the other platform:
 * already added (then the two are linked), to paste now, later, or never.
 */
export function AddVideoForm({ token, lonePosts }: { token: string; lonePosts: LonePost[] }) {
  const router = useRouter();
  const [links, setLinks] = useState<Record<Platform, string>>({ tiktok: "", instagram: "" });
  const [asking, setAsking] = useState<"twin" | "other" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filled = (["tiktok", "instagram"] as Platform[]).filter((p) => links[p].trim());
  const single = filled.length === 1 ? filled[0] : null;
  // Videos on the other platform still waiting for their twin.
  const twins = single ? lonePosts.filter((p) => p.platform === other(single)) : [];

  function edit(platform: Platform, value: string) {
    setLinks((l) => ({ ...l, [platform]: value }));
    setAsking(null);
    setError(null);
  }

  async function send(post?: string) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/creators/videos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, ...links, post }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setLoading(false);
    setAsking(null);
    if (!res?.ok) {
      setError(data?.error ?? "Impossible d'ajouter la vidéo, réessaie.");
      router.refresh();
      return;
    }
    setLinks({ tiktok: "", instagram: "" });
    router.refresh();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (filled.length === 0) return;
    if (!single) return void send();
    setAsking(twins.length > 0 ? "twin" : "other");
  }

  function pasteOther() {
    if (!single) return;
    setAsking(null);
    document.getElementById(`link-${other(single)}`)?.focus();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <LinkField id="link-tiktok" label="TikTok" value={links.tiktok} onChange={(v) => edit("tiktok", v)} placeholder="tiktok.com/@…/video/…" />
      <LinkField id="link-instagram" label="Instagram" value={links.instagram} onChange={(v) => edit("instagram", v)} placeholder="instagram.com/reel/…" />

      {asking === "twin" && single && (
        <div className="rounded-[14px] border border-accent/40 bg-accent/[0.06] p-4">
          <p className="font-body text-[14.5px] font-semibold text-ink">
            {single === "tiktok" ? "Ce TikTok" : "Ce reel Instagram"} est-il la même vidéo qu&apos;un {NAME[other(single)]} que tu as déjà
            ajouté ?
          </p>
          <p className="mt-1 font-body text-[12.5px] text-ink-muted">Si oui, choisis-le : on paiera la plateforme qui fait le plus de vues.</p>
          <div className="mt-3 flex flex-col gap-2">
            {twins.map((t) => (
              <button key={t.key} type="button" disabled={loading} onClick={() => send(t.key)} className={CHOICE}>
                Oui, c&apos;est mon {NAME[t.platform]} du {new Date(t.date).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })} ·{" "}
                {t.views.toLocaleString("fr-FR")} vues
              </button>
            ))}
            <button type="button" disabled={loading} onClick={() => setAsking("other")} className={CHOICE}>
              Non, c&apos;est une nouvelle vidéo
            </button>
          </div>
        </div>
      )}

      {asking === "other" && single && (
        <div className="rounded-[14px] border border-accent/40 bg-accent/[0.06] p-4">
          <p className="font-body text-[14.5px] font-semibold text-ink">Tu as aussi posté cette vidéo sur {NAME[other(single)]} ?</p>
          <p className="mt-1 font-body text-[12.5px] text-ink-muted">
            La même vidéo sur les deux plateformes compte une seule fois : on paie celle qui fait le plus de vues.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button type="button" onClick={pasteOther} className={CHOICE}>
              Oui, je colle le lien {NAME[other(single)]}
            </button>
            <button type="button" disabled={loading} onClick={() => send()} className={CHOICE}>
              Pas encore : je l&apos;ajouterai sur cette vidéo quand elle sera postée
            </button>
            <button type="button" disabled={loading} onClick={() => send()} className={CHOICE}>
              Non, elle est seulement sur {NAME[single]}
            </button>
          </div>
        </div>
      )}

      {error && <p className="font-body text-[13px] text-red-400">{error}</p>}
      {!asking && (
        <Button type="submit" showArrow={false} disabled={loading || filled.length === 0} className="w-full">
          {loading ? "Vérification de la vidéo…" : filled.length === 2 ? "Ajouter cette vidéo (TikTok + Instagram)" : "Ajouter ma vidéo"}
        </Button>
      )}
      {loading && asking && <p className="font-body text-[13px] text-ink-muted">Vérification de la vidéo…</p>}
    </form>
  );
}

/** Adds the link a video is missing (its Instagram or its TikTok). */
export function AddMissingLink({ token, post, platform }: { token: string; post: string; platform: "tiktok" | "instagram" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const name = platform === "tiktok" ? "TikTok" : "Instagram";

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="font-body text-[12.5px] font-semibold text-accent hover:underline">
        + Ajouter le lien {name}
      </button>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/creators/videos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, post, [platform]: url }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      setError(data?.error ?? "Impossible d'ajouter le lien, réessaie.");
      return;
    }
    setOpen(false);
    setUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={platform === "tiktok" ? "Lien TikTok" : "Lien du reel Instagram"}
          inputMode="url"
          className="h-10 min-w-0 flex-1 rounded-lg border border-ink/12 bg-accent/5 px-3 font-body text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-accent/60"
        />
        <button type="submit" disabled={loading || !url.trim()} className="shrink-0 rounded-lg bg-accent px-3 font-body text-[13px] font-semibold text-canvas disabled:opacity-50">
          {loading ? "…" : "Ajouter"}
        </button>
      </div>
      {error && <p className="font-body text-[12.5px] text-red-400">{error}</p>}
    </form>
  );
}
