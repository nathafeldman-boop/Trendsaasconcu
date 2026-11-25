import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { CreatorSignupForm } from "@/components/creators/signup-form";
import { bonusLabel, formatEuros, rateLabel, STREAK_BONUS_CENTS } from "@/lib/creators/program";

export const metadata: Metadata = {
  title: "Programme créateurs — SaaSFounder",
  description: "Fais des vidéos sur SaaSFounder et sois payé à la vue.",
  robots: { index: false, follow: false },
};

const STEPS = [
  { title: "Inscris-toi", body: "Ton nom, ton @ TikTok (et Instagram si tu en as un), ton numéro et où on te paie." },
  { title: "Publie tes vidéos", body: "Filme notre simulation (un SaaS créé de A à Z) ou parle de SaaSFounder, puis colle le lien de chaque vidéo sur ta page." },
  { title: "Sois payé à la vue", body: "On met tes vues à jour toutes les 10 minutes. Tu vois ce qu'on te doit en direct." },
];

export default function CreatorsPage() {
  return (
    <main className="mx-auto max-w-md px-5 pb-20 pt-6">
      <Link href="/" className="inline-flex">
        <Logo />
      </Link>
      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Programme créateurs</p>
      <h1 className="mt-3 font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
        Tes TikToks te paient : <span className="text-accent">{rateLabel()}.</span>
      </h1>
      <p className="mt-4 rounded-[14px] border border-accent/30 bg-accent/[0.06] px-4 py-3 font-body text-[14.5px] leading-relaxed text-ink">
        <strong>Bonus par vidéo :</strong> {bonusLabel()}.
        <br />
        <strong>Série :</strong> {formatEuros(STREAK_BONUS_CENTS)} en plus chaque mois où tu publies au moins une vidéo par jour.
      </p>
      <ol className="mt-8 flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent/40 font-mono text-[12px] text-accent">{i + 1}</span>
            <div>
              <p className="font-body text-[15px] font-semibold text-ink">{step.title}</p>
              <p className="font-body text-[14px] leading-relaxed text-ink-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="glass-panel mt-10 rounded-[20px] p-6">
        <CreatorSignupForm />
      </div>
      <p className="mt-6 text-center font-body text-[12px] leading-relaxed text-ink-faint">
        Seules les vues des vidéos publiées par ton compte sont comptées. Les vues achetées ou artificielles ne sont pas payées.
      </p>
    </main>
  );
}
