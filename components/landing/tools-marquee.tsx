import { BrandLogo, brandTitle, type Brand } from "@/components/ui/brand-logo";

const TOOLS: Brand[] = ["claude", "supabase", "github", "stripe", "vercel", "tiktok", "instagram", "replit", "hostinger"];

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
              className="flex items-center gap-3 whitespace-nowrap font-display text-xl font-medium tracking-[-0.02em] text-ink-muted sm:text-2xl"
            >
              <BrandLogo brand={tool} className="size-6 sm:size-7" />
              {brandTitle(tool)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
