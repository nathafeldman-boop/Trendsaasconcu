"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { track } from "@/lib/analytics/track";

// Ways from a generated guide (lib/seo) into the questionnaire: one right
// under the introduction, and a bar pinned to the bottom of phones once the
// reader has scrolled past it.

function go(from: string) {
  track("hero_submitted", { mode: "cta", has_idea: false, from });
}

export function SeoTopCta() {
  return (
    <Link
      href="/commencer"
      onClick={() => go("seo-top")}
      className="group flex items-center gap-4 rounded-[16px] border border-accent/30 bg-accent/[0.06] px-5 py-4 transition-colors hover:border-accent/60"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <Sparkles className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block font-body text-[15px] font-semibold text-ink">Trouve ton idée de business en 2 minutes</span>
        <span className="block font-body text-[13.5px] leading-snug text-ink-muted">
          Questionnaire gratuit : ton idée, le prompt qui crée ton site et ton plan pour tes premiers clients.
        </span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function SeoStickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-canvas/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur transition-transform duration-300 sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link
        href="/commencer"
        onClick={() => go("seo-sticky")}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-ink font-body text-[15px] font-semibold text-canvas"
      >
        Lancer mon business gratuitement <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
