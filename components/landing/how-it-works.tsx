import { Bot, ClipboardList, Code2, Rocket, Target, TrendingUp } from "lucide-react";
import { CtaButton, TwoTone } from "@/components/landing/cta-button";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Tu réponds au questionnaire",
    text: "Des questions sur ton temps, ton niveau, ta cible et la vie que tu vises. Gratuit, sans carte.",
  },
  {
    icon: Code2,
    title: "On te donne ton idée et ton prompt",
    text: "L'idée choisie pour toi et pour ton objectif de revenus, et le prompt complet à coller dans Claude pour construire ton site.",
  },
  {
    icon: TrendingUp,
    title: "Tu lances et tu vends",
    text: "Ton site mis en ligne pour toi, tes idées de vidéos et ton plan de lancement, étape par étape.",
  },
];

const FEATURES = [
  { icon: Target, title: "Ton idée de SaaS sur mesure", text: "Choisie selon ton temps, ton niveau et ta cible." },
  { icon: Code2, title: "Le prompt qui écrit ton site", text: "Tu le colles dans Claude, il construit tout le site." },
  { icon: Rocket, title: "Ton site mis en ligne pour toi", text: "GitHub, Supabase et ton domaine branchés en quelques clics." },
  { icon: Bot, title: "Un coach IA expert des SaaS", text: "Il connaît ton idée et t'aide à trouver tes clients." },
];

export function HowItWorks() {
  return (
    <section id="comment" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">Comment ça marche</p>
      <h2 className="mt-4 max-w-2xl font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[48px]">
        <TwoTone strong="De zéro à ton premier client," soft="en trois étapes." />
      </h2>

      <ol className="relative mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
        <span aria-hidden className="absolute left-6 right-6 top-6 hidden h-px bg-ink/12 sm:block" />
        {STEPS.map((step, i) => (
          <li key={step.title} className="relative">
            <span className="relative flex size-12 items-center justify-center rounded-[12px] border border-ink/15 bg-canvas">
              <step.icon className="size-5 text-ink-muted" />
            </span>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-faint">Étape {i + 1}</p>
            <h3 className="mt-2 font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">{step.title}</h3>
            <p className="mt-2 font-body text-[15px] leading-relaxed text-ink-muted">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex justify-center">
        <CtaButton from="steps" className="w-full max-w-sm" />
      </div>

      <div className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-[14px] border border-ink/10 bg-ink/[0.025] p-5">
            <span className="flex size-10 items-center justify-center rounded-[10px] border border-ink/15">
              <feature.icon className="size-[18px] text-ink" />
            </span>
            <h3 className="mt-5 font-display text-[16px] font-semibold text-ink">{feature.title}</h3>
            <p className="mt-1.5 font-body text-[13.5px] leading-relaxed text-ink-muted">{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
