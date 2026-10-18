"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChoiceOption({
  label,
  selected,
  onClick,
  variant = "single",
  detail,
  icon,
  layout = "row",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: "single" | "multi";
  /** Smaller line under the label. */
  detail?: string;
  /** Icon or brand logo shown in a tile before the label. */
  icon?: React.ReactNode;
  /** "tile" stacks the icon above the text, for 2-column grids. */
  layout?: "row" | "tile";
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-[16px] border text-left font-body transition-colors duration-150",
        layout === "tile" ? "flex-col items-start gap-3 p-4" : "items-center gap-3.5 px-5 py-4",
        selected
          ? "border-accent/70 bg-accent/[0.1] text-ink shadow-[0_0_28px_-10px_var(--color-accent)]"
          : "border-ink/12 bg-ink/[0.03] text-ink hover:border-accent/40 hover:bg-ink/[0.05]"
      )}
    >
      {selected && (
        <motion.span
          aria-hidden
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-accent/25 to-transparent"
        />
      )}
      {icon ? (
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[12px] border transition-colors",
            selected ? "border-accent/50 bg-accent/15 text-accent" : "border-ink/10 bg-ink/[0.04] text-ink-muted group-hover:text-accent"
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium">{label}</span>
        {detail ? <span className="mt-0.5 block text-[13px] text-ink-faint">{detail}</span> : null}
      </span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center border transition-colors duration-150",
          layout === "tile" && "absolute right-4 top-4",
          variant === "multi" ? "rounded-[6px]" : "rounded-full",
          selected ? "border-accent bg-accent" : "border-ink/25"
        )}
      >
        {selected ? <Check className="size-3.5 text-canvas" strokeWidth={3} /> : null}
      </span>
    </motion.button>
  );
}
