import { Eyebrow } from "@/components/ui/eyebrow";
import { PricingCards } from "@/components/pricing/pricing-cards";

export function PricingSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <Eyebrow>Tarifs</Eyebrow>
      <h2 className="mt-5 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.045em] text-chrome sm:text-[46px]">
        Choisis ton <span className="font-serif italic tracking-normal text-accent">rythme.</span>
      </h2>
      <p className="mt-3 max-w-lg font-body text-[15px] leading-relaxed text-ink-muted">
        Même contenu, même accompagnement — choisis juste la formule qui te convient.
        Résiliable à tout moment.
      </p>
      <div className="mt-10">
        <PricingCards isAuthenticated={isAuthenticated} />
      </div>
    </section>
  );
}
