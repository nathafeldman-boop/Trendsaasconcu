import { VslPlayer } from "@/components/vsl/vsl-player";
import { CtaButton, TwoTone } from "@/components/landing/cta-button";
import { LANDING_FILM } from "@/lib/vsl/scenes";

// The demo: the real app, from the first question to the first customer,
// in about a minute.
export function VslSection() {
  return (
    <section id="demo" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">La démo</p>
      <h2 className="mt-4 max-w-2xl font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[48px]">
        <TwoTone strong="Regarde SaaSFounder" soft="en action." />
      </h2>
      <p className="mt-4 max-w-lg font-body text-[15px] leading-relaxed text-ink-muted">
        Une minute, sans le son : de ta première réponse à ton premier client, sur les vrais écrans de l&apos;app.
      </p>
      <div className="mt-10">
        <VslPlayer film={LANDING_FILM} autoPlay="in-view" cta={{ label: "Créer mon business", href: "/commencer" }} />
      </div>
      <div className="mt-12 flex justify-center">
        <CtaButton from="demo" className="w-full max-w-sm" />
      </div>
    </section>
  );
}
