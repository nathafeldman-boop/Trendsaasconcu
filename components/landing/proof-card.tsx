"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

function ActivityRow({
  amount,
  label,
  time,
  className,
}: {
  amount: string;
  label: string;
  time: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-white/10 bg-canvas-overlay/90 px-4 py-3.5 backdrop-blur-xl ${className ?? ""}`}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <TrendingUp className="size-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-sm text-ink">{label}</p>
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          {time}
        </p>
      </div>
      <p className="font-display text-lg font-semibold text-ink">{amount}</p>
    </div>
  );
}

export function ProofCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
      className="relative w-full max-w-[380px]"
    >
      <div className="absolute -inset-6 -z-10 rounded-[32px] bg-accent/10 blur-3xl" />
      <div className="space-y-2.5 rotate-[1.5deg]">
        <ActivityRow
          amount="+ 29 €"
          label="Nouvel abonné"
          time="à l'instant"
          className="translate-x-2 opacity-60"
        />
        <ActivityRow amount="+ 49 €" label="Nouveau client" time="il y a 4 min" />
        <ActivityRow
          amount="+ 129 €"
          label="Plan annuel"
          time="il y a 12 min"
          className="-translate-x-1"
        />
      </div>
    </motion.div>
  );
}
