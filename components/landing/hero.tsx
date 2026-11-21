import { Check } from "lucide-react";
import { CtaButton, TwoTone } from "@/components/landing/cta-button";
import { PaymentsPhone } from "@/components/ui/payments-phone";

// Lock-screen pushes worded like the Stripe app's. An illustration (and
// labelled so), not real sales.
const NOTIFICATIONS = [
  { when: "maintenant", amount: "29,00 €", email: "xxxxxx@gmail.com" },
  { when: "il y a 12 min", amount: "79,00 €", email: "xxxxxxx@outlook.fr" },
  { when: "il y a 1 h", amount: "129,00 €", email: "xxxxx@gmail.com" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_30%_30%,black,transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:pb-24 lg:pt-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">Idée · Site · Premiers clients</p>
          <h1 className="mt-5 font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[64px]">
            <TwoTone strong="Crée ton premier business" soft="et encaisse tes premiers revenus." />
          </h1>
          <p className="mt-6 max-w-[520px] font-body text-[17px] leading-relaxed text-ink-muted">
            Réponds à quelques questions : on te donne l&apos;idée faite pour toi, le prompt qui écrit ton site, et le plan pour
            trouver tes premiers clients.
          </p>
          <CtaButton from="hero" className="mt-8" />
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-body text-[13px] text-ink-muted">
            {["Questionnaire gratuit", "Sans carte bancaire", "Garantie 48 h"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-3.5" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <PaymentsPhone notifications={NOTIFICATIONS} />
      </div>
    </section>
  );
}
