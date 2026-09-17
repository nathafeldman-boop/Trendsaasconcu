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
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-lg border px-5 py-4 text-left font-body text-[15px] transition-colors duration-150",
        selected
          ? "border-accent/60 bg-accent/[0.08] text-ink"
          : "border-white/12 bg-white/[0.02] text-ink hover:border-white/25"
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center border transition-colors duration-150",
          variant === "multi" ? "rounded-[6px]" : "rounded-full",
          selected ? "border-accent bg-accent" : "border-white/25"
        )}
      >
        {selected ? <Check className="size-3.5 text-canvas" strokeWidth={3} /> : null}
      </span>
      {label}
    </button>
  );
}
