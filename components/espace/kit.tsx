"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// Small building blocks shared by the member-area tabs.

export function TabHeader({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        <h1 className="mt-3 font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">{title}</h1>
        <p className="mt-2 max-w-xl font-body text-[15px] leading-relaxed text-ink-muted">{sub}</p>
      </div>
      {children}
    </header>
  );
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (permissions, insecure context): the text stays selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border border-ink/15 bg-canvas/80 px-3 py-1.5 font-mono text-[11px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink",
        className
      )}
    >
      {copied ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}

export function PromptBlock({ label, text, tall = false }: { label: string; text: string; tall?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-ink/10 bg-black/40">
      <div className="flex items-center justify-between gap-3 border-b border-ink/8 px-4 py-2.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{label}</span>
        <CopyButton text={text} />
      </div>
      <pre
        className={cn(
          "overflow-y-auto whitespace-pre-wrap px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-ink/90",
          tall ? "max-h-[440px]" : "max-h-64"
        )}
      >
        {text}
      </pre>
    </div>
  );
}

export function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-mono text-[11px] text-accent">
            {i + 1}
          </span>
          <span className="pt-0.5 font-body text-[14px] leading-relaxed text-ink-muted">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function StatusChip({ done, label }: { done: boolean; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em]",
        done ? "border-success/30 bg-success/10 text-success" : "border-ink/12 text-ink-faint"
      )}
    >
      {done && <Check className="size-3" strokeWidth={3} />}
      {label ?? (done ? "Fait" : "À faire")}
    </span>
  );
}

/** Scrolls to a section of the current tab, below the sticky top bar. */
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
