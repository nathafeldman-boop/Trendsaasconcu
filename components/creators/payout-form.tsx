"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PAYOUT_METHODS, type PayoutMethod } from "@/lib/creators/program";
import { cn } from "@/lib/utils";

/** On the creator's page: add (or change) where to pay them. */
export function PayoutForm({ token, initialMethod, initialDetails }: { token: string; initialMethod: string; initialDetails: string }) {
  const router = useRouter();
  const known = PAYOUT_METHODS.some((m) => m.id === initialMethod);
  const [method, setMethod] = useState<PayoutMethod | null>(known ? (initialMethod as PayoutMethod) : null);
  const [details, setDetails] = useState(initialDetails);
  const [state, setState] = useState<"idle" | "saving" | "saved" | string>("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("saving");
    const res = await fetch("/api/creators/payout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, method, details }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) return setState(data?.error ?? "Enregistrement impossible, réessaie.");
    setState("saved");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {PAYOUT_METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={cn(
              "h-11 rounded-lg border px-3 font-body text-[14px] transition-colors",
              method === m.id ? "border-accent/60 bg-accent/10 text-ink" : "border-ink/12 text-ink-muted hover:text-ink"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      {method && (
        <input
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={PAYOUT_METHODS.find((m) => m.id === method)?.placeholder}
          required
          maxLength={120}
          className="h-[52px] rounded-lg border border-ink/12 bg-accent/5 px-4 font-body text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-accent/60"
        />
      )}
      {state !== "idle" && state !== "saving" && (
        <p className={cn("font-body text-[13px]", state === "saved" ? "text-success" : "text-red-400")}>
          {state === "saved" ? "Enregistré." : state}
        </p>
      )}
      <Button type="submit" showArrow={false} disabled={!method || details.trim().length < 3 || state === "saving"} className="w-full">
        {state === "saving" ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
