import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-white/8 bg-canvas-raised">
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <div className="flex justify-center">
          <Eyebrow tone="accent">Ton tour</Eyebrow>
        </div>
        <h2 className="mt-6 font-display text-[34px] font-semibold leading-[1.1] tracking-tight sm:text-[46px]">
          <span className="text-ink">Le prochain SaaS qui marche</span>
          <br />
          <span className="text-ink-muted">pourrait être le tien.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
          Il te manque juste la méthode pour t&apos;y mettre. On te la donne, et
          tu prends le relais.
        </p>
        <div className="mt-9 flex justify-center">
          <Button href="/inscription" size="default">
            Trouver mon idée
          </Button>
        </div>
      </div>
    </section>
  );
}
