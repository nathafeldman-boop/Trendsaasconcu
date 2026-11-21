import { BrandLogo, brandTitle, type Brand } from "@/components/ui/brand-logo";

const TOOLS: Brand[] = ["claude", "supabase", "github", "stripe", "netlify", "tiktok", "instagram", "paypal", "revolut"];

export function ToolsMarquee() {
  const loop = [...TOOLS, ...TOOLS];

  return (
    <div className="py-8">
      <p className="mb-7 px-5 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted sm:tracking-[0.25em]">
        Les outils sur lesquels tu vas construire
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent" />
        <div className="flex w-max animate-marquee items-center gap-12">
          {loop.map((tool, i) => (
            <span
              key={i}
              className="flex items-center gap-2.5 whitespace-nowrap font-display text-xl font-semibold tracking-[-0.02em] text-ink-muted sm:text-[22px]"
            >
              <BrandLogo brand={tool} monochrome className="size-6" />
              {brandTitle(tool)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
