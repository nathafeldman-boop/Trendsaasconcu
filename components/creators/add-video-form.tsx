"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const FIELD =
  "h-[52px] w-full rounded-lg border border-ink/12 bg-accent/5 pl-[92px] pr-4 font-body text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-accent/60";

function LinkField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-body text-[13px] font-semibold text-ink-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode="url" className={FIELD} />
    </label>
  );
}

/** A new video: its TikTok link, its Instagram link, or both. */
export function AddVideoForm({ token }: { token: string }) {
  const router = useRouter();
  const [tiktok, setTiktok] = useState("");
  const [instagram, setInstagram] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/creators/videos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, tiktok, instagram }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      setError(data?.error ?? "Impossible d'ajouter la vidéo, réessaie.");
      router.refresh();
      return;
    }
    setTiktok("");
    setInstagram("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <LinkField label="TikTok" value={tiktok} onChange={setTiktok} placeholder="tiktok.com/@…/video/…" />
      <LinkField label="Instagram" value={instagram} onChange={setInstagram} placeholder="instagram.com/reel/…" />
      {error && <p className="font-body text-[13px] text-red-400">{error}</p>}
      <Button type="submit" showArrow={false} disabled={loading || (!tiktok.trim() && !instagram.trim())} className="w-full">
        {loading ? "Vérification de la vidéo…" : "Ajouter ma vidéo"}
      </Button>
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
