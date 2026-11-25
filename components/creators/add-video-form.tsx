"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AddVideoForm({ token }: { token: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/creators/videos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, url }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      setError(data?.error ?? "Impossible d'ajouter la vidéo, réessaie.");
      return;
    }
    setUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Lien TikTok ou reel Instagram"
        inputMode="url"
        required
        className="h-[52px] rounded-lg border border-ink/12 bg-accent/5 px-4 font-body text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-accent/60"
      />
      {error && <p className="font-body text-[13px] text-red-400">{error}</p>}
      <Button type="submit" showArrow={false} disabled={loading || !url.trim()} className="w-full">
        {loading ? "Vérification de la vidéo…" : "Ajouter ma vidéo"}
      </Button>
    </form>
  );
}
