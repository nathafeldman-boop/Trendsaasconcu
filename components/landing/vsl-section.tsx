import { Eyebrow } from "@/components/ui/eyebrow";
import { VslPlayer } from "@/components/vsl/vsl-player";
import { LANDING_FILM } from "@/lib/vsl/scenes";

// The demo right under the hero: the real app, from the first question to
// the first customer, in about a minute.
export function VslSection() {
  return (
    <section id="demo" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 pb-10 pt-4 sm:px-8 sm:pb-16">
      <div className="flex flex-col items-center text-center">
        <Eyebrow tone="accent">La démo</Eyebrow>
        <h2 className="mt-5 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.045em] text-chrome sm:text-[46px]">
          Regarde SaaSFounder{" "}
          <span className="font-serif italic tracking-normal text-accent">en action.</span>
        </h2>
        <p className="mt-3 max-w-lg font-body text-[15px] leading-relaxed text-ink-muted">
          Une minute, sans le son : de ta première réponse à ton premier client, sur les vrais écrans de l&apos;app.
        </p>
      </div>
      <div className="relative mt-10">
        <div aria-hidden className="absolute -inset-x-10 -inset-y-8 -z-10 rounded-[60px] bg-accent/10 blur-[90px]" />
        <VslPlayer film={LANDING_FILM} autoPlay="in-view" cta={{ label: "Trouver mon idée", href: "/commencer" }} />
      </div>
    </section>
  );
}
