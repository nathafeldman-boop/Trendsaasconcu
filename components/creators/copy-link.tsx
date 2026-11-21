"use client";

import { useState } from "react";

export function CopyLink({ path, label = "Copier mon lien" }: { path: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(`${window.location.origin}${path}`).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="rounded-full border border-ink/15 px-3 py-1.5 font-body text-[12.5px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
    >
      {copied ? "Copié !" : label}
    </button>
  );
}
