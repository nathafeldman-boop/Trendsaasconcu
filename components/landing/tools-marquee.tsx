const TOOLS = ["Claude", "Supabase", "GitHub", "Stripe", "Vercel", "TikTok", "Instagram", "Replit", "Lovable"];

export function ToolsMarquee() {
  const loop = [...TOOLS, ...TOOLS];

  return (
    <div className="border-y border-ink/8 bg-ink/[0.015] py-8">
      <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
        Les outils sur lesquels tu vas construire
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent" />
        <div className="flex w-max animate-marquee items-center gap-12">
          {loop.map((tool, i) => (
            <span
              key={i}
              className="flex items-center gap-3 whitespace-nowrap font-display text-xl font-medium tracking-[-0.02em] text-ink-muted/70 sm:text-2xl"
            >
              <span className="size-1.5 rounded-full bg-accent/60 shadow-[0_0_8px_var(--color-accent)]" />
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
