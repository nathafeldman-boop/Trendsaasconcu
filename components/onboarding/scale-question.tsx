"use client";

import { motion } from "framer-motion";
import { Face } from "@/components/onboarding/illustrations";
import { cn } from "@/lib/utils";

const DEFAULT_LABELS = ["Pas du tout", "Plutôt non", "Je ne sais pas", "Plutôt oui", "Complètement"];

// Agreement scale drawn as five faces, from a frown to a smile.
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
      {labels.map((label, index) => {
        const selected = value === index + 1;
        return (
          <motion.button
            key={label}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.3 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(index + 1)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-center gap-2 rounded-[16px] border px-1 py-4 transition-colors duration-150",
              selected
                ? "border-accent/70 bg-accent/[0.1] text-accent shadow-[0_0_24px_-10px_var(--color-accent)]"
                : "border-ink/12 bg-ink/[0.03] text-ink-muted hover:border-accent/40 hover:text-ink"
            )}
          >
            <Face level={index} className="size-9 sm:size-11" />
            <span className="text-center font-body text-[11px] leading-tight sm:text-[12px]">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
