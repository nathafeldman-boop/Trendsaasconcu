"use client";

import { motion } from "framer-motion";

const DEFAULT_LABELS = ["Pas du tout", "Plutôt non", "Neutre", "Plutôt oui", "Tout à fait"];

export function ScaleQuestion({
  value,
  onSelect,
  labels = DEFAULT_LABELS,
}: {
  value: number | null;
  onSelect: (value: number) => void;
  labels?: string[];
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {labels.map((label, index) => (
        <motion.button
          key={label}
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => onSelect(index + 1)}
          className={`flex h-16 flex-col items-center justify-center rounded-lg border font-mono text-[10px] uppercase tracking-wide transition-colors duration-150 ${
            value === index + 1
              ? "border-accent/70 bg-accent/[0.1] text-ink shadow-[0_0_24px_-10px_var(--color-accent)]"
              : "border-white/12 bg-white/[0.02] text-ink-muted hover:border-accent/40"
          }`}
        >
          <span className="font-display text-lg font-semibold not-italic normal-case tracking-normal">
            {index + 1}
          </span>
          {label}
        </motion.button>
      ))}
    </div>
  );
}
