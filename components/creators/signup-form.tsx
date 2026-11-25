"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PAYOUT_METHODS, type PayoutMethod } from "@/lib/creators/program";
import { cn } from "@/lib/utils";

export function CreatorSignupForm() {
  const router = useRouter();
  const [method, setMethod] = useState<PayoutMethod | null>(null);
  const [consent, setConsent] = useState(false);
  const [disclosure, setDisclosure] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    const res = await fetch("/api/creators/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        tiktok: form.get("tiktok"),
        instagram: form.get("instagram"),
        phone: form.get("phone"),
        payoutMethod: method ?? "",
        payoutDetails: method ? form.get("payoutDetails") : "",
        consent,
        disclosure,
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok || !data?.token) {
      setError(data?.error ?? "Inscription impossible, réessaie.");
      setLoading(false);
      return;
    }
    router.push(`/createurs/${data.token}?bienvenue=1`);
  }

  const placeholder = PAYOUT_METHODS.find((m) => m.id === method)?.placeholder;

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Input label="Ton prénom et nom" name="name" autoComplete="name" required maxLength={80} />
      <Input label="Ton @ TikTok" name="tiktok" placeholder="@toncompte" autoCapitalize="none" autoCorrect="off" required maxLength={40} />
      <Input label="Ton @ Instagram (facultatif)" name="instagram" placeholder="@toncompte" autoCapitalize="none" autoCorrect="off" maxLength={40} />
      <Input label="Ton numéro (WhatsApp)" name="phone" type="tel" autoComplete="tel" placeholder="06 12 34 56 78" required maxLength={30} />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
          Où on te paie ? <span className="normal-case tracking-normal text-ink-faint">(facultatif)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {PAYOUT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(method === m.id ? null : m.id)}
              className={cn(
                "h-11 rounded-lg border px-3 font-body text-[14px] transition-colors",
                method === m.id ? "border-accent/60 bg-accent/10 text-ink" : "border-ink/12 text-ink-muted hover:text-ink"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>
      {method ? (
        <Input label="Tes coordonnées de paiement" name="payoutDetails" placeholder={placeholder} required maxLength={120} />
      ) : (
        <p className="-mt-2 font-body text-[12.5px] text-ink-faint">Tu ne sais pas encore ? Laisse vide : tu pourras l&apos;ajouter plus tard sur ta page.</p>
      )}

      <label className="flex items-start gap-3 font-body text-[13px] leading-relaxed text-ink-muted">
        <input type="checkbox" checked={disclosure} onChange={(e) => setDisclosure(e.target.checked)} className="mt-1 size-4 accent-[var(--color-accent)]" />
        J&apos;indique « Collaboration commerciale » (ou #pub) sur chaque vidéo qui parle de SaaSFounder, comme la loi l&apos;impose.
      </label>
      <label className="flex items-start gap-3 font-body text-[13px] leading-relaxed text-ink-muted">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 accent-[var(--color-accent)]" />
        J&apos;accepte que SaaSFounder garde ces informations pour me contacter et me payer.
      </label>

      {error && <p className="font-body text-[13px] text-red-400">{error}</p>}
      <Button type="submit" showArrow={false} disabled={loading || !consent || !disclosure} className="w-full">
        {loading ? "Inscription…" : "Je m'inscris"}
      </Button>
    </form>
  );
}
