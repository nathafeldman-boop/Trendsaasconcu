"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const CREATOR_TOKEN_KEY = "saasfounder-creator-token";

/** Remembers the creator's space on this device, so /createurs leads back to it. */
export function RememberCreator({ token }: { token: string }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(CREATOR_TOKEN_KEY, token);
    } catch {
      // private browsing: the link still works
    }
  }, [token]);
  return null;
}

/** On /createurs: back to their space (remembered, or found by TikTok handle + phone). */
export function CreatorLogin() {
  const router = useRouter();
  const [saved, setSaved] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from this device's storage
      setSaved(window.localStorage.getItem(CREATOR_TOKEN_KEY));
    } catch {
      // ignore
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    const res = await fetch("/api/creators/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tiktok: form.get("tiktok"), phone: form.get("phone") }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok || !data?.token) {
      setError(data?.error ?? "Impossible pour le moment, réessaie.");
      setLoading(false);
      return;
    }
    router.push(`/createurs/${data.token}`);
  }

  return (
    <div id="connexion" className="rounded-[20px] border border-accent/30 bg-accent/[0.05] p-5">
      <p className="font-body text-[15px] font-semibold text-ink">Déjà inscrit ?</p>
      {saved && (
        <Button href={`/createurs/${saved}`} showArrow={false} className="mt-3 w-full">
          Ouvrir mon espace créateur
        </Button>
      )}
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-3 font-body text-[14px] text-accent underline underline-offset-2">
          {saved ? "Ce n'est pas mon compte" : "Retrouver mon espace avec mon @ TikTok et mon numéro"}
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
          <Input label="Ton @ TikTok" name="tiktok" placeholder="@toncompte" autoCapitalize="none" autoCorrect="off" required maxLength={40} />
          <Input label="Le numéro donné à l'inscription" name="phone" type="tel" placeholder="06 12 34 56 78" required maxLength={30} />
          {error && <p className="font-body text-[13px] text-red-400">{error}</p>}
          <Button type="submit" showArrow={false} disabled={loading} className="w-full">
            {loading ? "Recherche…" : "Retrouver mon espace"}
          </Button>
        </form>
      )}
    </div>
  );
}
