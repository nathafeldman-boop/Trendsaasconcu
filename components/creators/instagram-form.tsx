"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** On the creator's page: add or change their Instagram account. */
export function InstagramForm({ token, initial }: { token: string; initial: string | null }) {
  const router = useRouter();
  const [handle, setHandle] = useState(initial ? `@${initial}` : "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | string>("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("saving");
    const res = await fetch("/api/creators/instagram", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, handle }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) return setState(data?.error ?? "Enregistrement impossible, réessaie.");
    setState("saved");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="@toncompte"
        autoCapitalize="none"
        maxLength={40}
        className="h-11 min-w-0 flex-1 rounded-lg border border-ink/12 bg-accent/5 px-3 font-body text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-accent/60"
      />
      <button
        type="submit"
        disabled={state === "saving" || handle.trim().length < 2}
        className="h-11 rounded-lg bg-ink px-4 font-body text-[13.5px] font-semibold text-canvas disabled:opacity-40"
      >
        {state === "saved" ? "Enregistré" : "Enregistrer"}
      </button>
      {state !== "idle" && state !== "saving" && state !== "saved" && <span className="self-center font-body text-[12px] text-red-400">{state}</span>}
    </form>
  );
}
