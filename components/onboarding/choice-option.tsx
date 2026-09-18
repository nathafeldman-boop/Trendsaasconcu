"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChoiceOption({
  label,
  selected,
  onClick,
  variant = "single",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: "single" | "multi";
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-lg border px-5 py-4 text-left font-body text-[15px] transition-colors duration-150",
        selected
          ? "border-accent/70 bg-accent/[0.1] text-ink shadow-[0_0_28px_-10px_var(--color-accent)]"
          : "border-ink/12 bg-ink/[0.02] text-ink hover:border-accent/40"
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center border transition-colors duration-150",
          variant === "multi" ? "rounded-[6px]" : "rounded-full",
          selected ? "border-accent bg-accent" : "border-ink/25"
        )}
      >
        {selected ? <Check className="size-3.5 text-canvas" strokeWidth={3} /> : null}
      </span>
      {label}
    </motion.button>
  );
}
