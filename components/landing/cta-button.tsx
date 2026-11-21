"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

/** The landing page's one call to action: into the questionnaire. */
export function CtaButton({ from, className, size = "lg" }: { from: string; className?: string; size?: "lg" | "sm" }) {
  return (
    <Link
      href="/commencer"
      onClick={() => track("hero_submitted", { mode: "cta", has_idea: false, from })}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-[10px] bg-ink font-body font-semibold text-canvas transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97]",
        size === "lg" ? "h-[52px] px-10 text-[16px]" : "h-10 px-4 text-[14px]",
        className
      )}
    >
      Créer mon business
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
    </Link>
  );
}

/** "Crée ton premier business" in white, the rest in grey, as in every heading here. */
export function TwoTone({ strong, soft }: { strong: string; soft: string }) {
  return (
    <>
      {strong} <span className="text-ink-faint">{soft}</span>
    </>
  );
}
