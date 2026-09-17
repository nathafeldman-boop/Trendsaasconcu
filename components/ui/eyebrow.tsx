import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
  tone = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "muted" | "accent";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em]",
        tone === "accent" ? "text-accent" : "text-ink-muted",
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "accent" ? "bg-accent" : "bg-ink-muted"
        )}
      />
      {children}
    </div>
  );
}
