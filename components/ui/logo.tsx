import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[9px] border border-white/12 bg-white/[0.03]",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[18px]">
        <path
          d="M4 17.5C4 17.5 7.5 17.5 9.5 14.5C11.5 11.5 10 8.5 12.5 6.5C15 4.5 18.5 6 18.5 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-ink"
        />
        <circle cx="19.3" cy="5.3" r="2" className="fill-accent" />
      </svg>
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
        SaaSFounder
      </span>
    </div>
  );
}
