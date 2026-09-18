const CAPABILITIES = [
  "Idées validées",
  "Prompts prêts à coller",
  "Paiements en ligne",
  "Hébergement inclus",
  "Vidéos marketing",
  "Plan jour par jour",
];

export function ToolsMarquee() {
  const loop = [...CAPABILITIES, ...CAPABILITIES];

  return (
    <div className="border-y border-ink/8 py-8">
      <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
        Ce que tu reçois pour construire
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-canvas to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-canvas to-transparent" />
        <div className="flex w-max animate-marquee gap-10">
          {loop.map((item, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-display text-xl font-medium text-ink-muted/70 sm:text-2xl"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
