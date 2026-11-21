import Link from "next/link";
import { CtaButton, TwoTone } from "@/components/landing/cta-button";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="rounded-[20px] border border-ink/10 bg-ink/[0.025] px-6 py-16 text-center sm:py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">Prêt ?</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[52px]">
          <TwoTone strong="Ton idée t'attend" soft="à la fin du questionnaire." />
        </h2>
        <p className="mx-auto mt-5 max-w-md font-body text-[16px] leading-relaxed text-ink-muted">
          Réponds aux questions, découvre l&apos;idée faite pour toi, et décide ensuite.
        </p>
        <CtaButton from="final" className="mt-8" />
        <p className="mt-6 font-body text-[13px] text-ink-faint">
          <span className="font-semibold text-ink-muted">Garantie 48 h</span> · Pas de vente ? On te rembourse intégralement.{" "}
          <Link href="/remboursement" className="text-ink-muted underline underline-offset-2 hover:text-ink">
            Sous conditions
          </Link>
        </p>
      </div>
    </section>
  );
}
