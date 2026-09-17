"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

const PREVIOUS_PERIOD = [8, 10, 9, 13, 15, 14, 17];
const CURRENT_PERIOD = [10, 14, 19, 24, 27, 30, 34];

function buildPath(points: number[], width: number, height: number, padding = 6) {
  const max = Math.max(...PREVIOUS_PERIOD, ...CURRENT_PERIOD);
  const step = (width - padding * 2) / (points.length - 1);
  return points
    .map((value, index) => {
      const x = padding + index * step;
      const y = padding + (1 - value / max) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const CHART_WIDTH = 280;
const CHART_HEIGHT = 88;

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
      className="relative w-full max-w-[380px]"
    >
      <div className="absolute -inset-6 -z-10 rounded-[32px] bg-accent/10 blur-3xl" />

      <div className="mb-3">
        <Eyebrow tone="accent">Aperçu · ton espace paiements</Eyebrow>
      </div>

      <div className="rounded-lg border border-white/10 bg-canvas-overlay/90 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Wallet className="size-4" strokeWidth={2.25} />
          </div>
          <span className="font-body text-sm font-medium text-ink">Paiements</span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            En direct
          </span>
        </div>

        <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          Aujourd&apos;hui
        </p>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <div>
            <p className="font-display text-xl font-semibold text-ink sm:text-2xl">1 000 €</p>
            <p className="mt-0.5 font-body text-[12px] text-ink-muted">Revenu</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-ink sm:text-2xl">22</p>
            <p className="mt-0.5 font-body text-[12px] text-ink-muted">Paiements</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-ink sm:text-2xl">18</p>
            <p className="mt-0.5 font-body text-[12px] text-ink-muted">Clients</p>
          </div>
        </div>

        <div className="my-5 h-px bg-white/10" />

        <div className="flex items-center justify-between">
          <p className="font-body text-[13px] font-medium text-ink">Volume brut · 4 semaines</p>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-400">
            +47 %
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              4 sem. précédentes
            </p>
            <p className="font-display text-sm font-semibold text-ink-muted">21 830 €</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              4 dernières semaines
            </p>
            <p className="font-display text-sm font-semibold text-accent">32 045 €</p>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="mt-3 h-[70px] w-full"
          preserveAspectRatio="none"
        >
          <path
            d={buildPath(PREVIOUS_PERIOD, CHART_WIDTH, CHART_HEIGHT)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ink-faint/60"
          />
          <motion.path
            d={buildPath(CURRENT_PERIOD, CHART_WIDTH, CHART_HEIGHT)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
