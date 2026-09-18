import { Eyebrow } from "@/components/ui/eyebrow";
import { PricingCards } from "@/components/pricing/pricing-cards";

export function PricingSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <Eyebrow>Tarifs</Eyebrow>
      <h2 className="mt-5 font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[38px]">
        Choisis ton rythme.
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
