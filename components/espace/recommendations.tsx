"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Lightbulb, Sparkles, X } from "lucide-react";
import type { Impact, Recommendation } from "@/lib/espace/recommendations";
import { PromptBlock, scrollToSection, Steps } from "@/components/espace/kit";
import { cn } from "@/lib/utils";

const IMPACT: Record<Impact, { label: string; className: string }> = {
  fort: { label: "Impact fort", className: "border-accent/40 bg-accent/12 text-accent" },
  moyen: { label: "Impact moyen", className: "border-ink/15 bg-ink/[0.05] text-ink" },
  bonus: { label: "Bonus", className: "border-success/30 bg-success/10 text-success" },
};

export function ImpactBadge({ impact }: { impact: Impact }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
        IMPACT[impact].className
      )}
    >
      {IMPACT[impact].label}
    </span>
  );
}

export function Recommendations({ items }: { items: Recommendation[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((r) => r.id === openId) ?? null;

  if (!items.length) return null;

  return (
    <section aria-label="Recommandations">
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-full bg-accent/12 text-accent">
          <Lightbulb className="size-3.5" strokeWidth={2} />
        </span>
        <h2 className="font-display text-[17px] font-semibold text-ink">Tes prochaines actions</h2>
        <span className="hidden font-body text-[13px] text-ink-faint sm:inline">· clique pour voir comment faire</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((rec, i) => (
          <motion.button
            key={rec.id}
            type="button"
            onClick={() => setOpenId(rec.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={cn(
              "glass-panel group relative flex flex-col items-start gap-3 overflow-hidden rounded-[20px] p-5 text-left transition-transform duration-200 hover:-translate-y-0.5",
              rec.impact === "fort" && "shadow-[inset_0_0_0_1px_rgba(51,244,239,0.22)]"
            )}
          >
            {rec.impact === "fort" && (
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-accent/10 blur-2xl"
              />
            )}
            <ImpactBadge impact={rec.impact} />
            <span className="font-display text-[16px] font-semibold leading-snug text-ink">{rec.title}</span>
            <span className="font-body text-[13.5px] leading-relaxed text-ink-muted">{rec.summary}</span>
            <span className="mt-auto flex items-center gap-1.5 pt-1 font-body text-[13px] font-medium text-accent">
              Comment faire
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </motion.button>
        ))}
      </div>

      <RecommendationDrawer rec={open} onClose={() => setOpenId(null)} />
    </section>
  );
}

function RecommendationDrawer({ rec, onClose }: { rec: Recommendation | null; onClose: () => void }) {
  useEffect(() => {
    if (!rec) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [rec, onClose]);

  return (
    <AnimatePresence>
      {rec && (
        <motion.div
          key="drawer"
          className="fixed inset-0 z-[120] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={rec.title}
            initial={{ x: 48, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="relative flex h-full w-full max-w-[600px] flex-col overflow-y-auto border-l border-ink/10 bg-canvas-raised px-6 pb-10 pt-6 sm:px-9"
          >
            <div className="flex items-center justify-between">
              <ImpactBadge impact={rec.impact} />
              <button
                type="button"
                onClick={onClose}
                className="flex size-9 items-center justify-center rounded-full border border-ink/12 text-ink-muted transition-colors hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <h2 className="mt-5 font-display text-[26px] font-semibold leading-tight text-ink">{rec.title}</h2>
            <p className="mt-2 font-body text-[15px] leading-relaxed text-ink-muted">{rec.summary}</p>

            <div className="mt-7 rounded-[18px] border border-ink/8 bg-ink/[0.03] p-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">Pourquoi</p>
              <p className="mt-2 font-body text-[14px] leading-relaxed text-ink/90">{rec.why}</p>
            </div>

            <div className="mt-7">
              <p className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">Comment faire</p>
              <Steps steps={rec.steps} />
            </div>

            {rec.prompts?.map((p) => (
              <div key={p.label} className="mt-7">
                <PromptBlock label={p.label} text={p.text} />
              </div>
            ))}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {rec.link && <DrawerLink link={rec.link} onClose={onClose} />}
              <Link
                href={`/espace/coach?q=${encodeURIComponent(rec.coachQuestion)}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ink/12 bg-ink/[0.04] px-5 font-body text-[14px] font-medium text-ink transition-colors hover:border-accent/45 hover:text-accent"
              >
                <Sparkles className="size-4" />
                Demander au coach
              </Link>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DrawerLink({ link, onClose }: { link: { label: string; href: string }; onClose: () => void }) {
  const className =
    "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 font-body text-[14px] font-semibold text-canvas shadow-[0_0_28px_-8px_var(--color-accent)] transition-colors hover:bg-accent-light";

  if (link.href.startsWith("#")) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          onClose();
          // Let the drawer leave before scrolling, or the body is still locked.
          setTimeout(() => scrollToSection(link.href.slice(1)), 220);
        }}
      >
        {link.label}
        <ArrowRight className="size-4" />
      </button>
    );
  }
  if (link.href.startsWith("http")) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
        <ArrowUpRight className="size-4" />
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
      <ArrowRight className="size-4" />
    </Link>
  );
}
