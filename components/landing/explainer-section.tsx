"use client";

import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";

const STEPS = [
  {
    title: "Choisis ton idée",
    description:
      "On te propose des idées de SaaS déjà validées par la demande — pas des idées sorties de nulle part.",
  },
  {
    title: "Construis-la avec l'IA",
    description:
      "Un prompt prêt à coller dans ton outil préféré, pensé pour te donner un plan de build complet, étape par étape.",
  },
  {
    title: "Trouve tes premiers clients",
    description:
      "Un plan d'action jour par jour pour sortir de l'ombre et décrocher tes premiers paiements.",
  },
];

export function ExplainerSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Eyebrow>En 30 secondes</Eyebrow>
          <h2 className="mt-5 max-w-sm font-display text-[32px] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[38px]">
            SaaSFounder, c&apos;est quoi concrètement ?
          </h2>
          <p className="mt-5 max-w-sm font-body text-[15px] leading-relaxed text-ink-muted">
            Une méthode en trois temps, pensée pour quelqu&apos;un qui part de zéro
            et veut voir un résultat réel — pas un cours théorique de plus.
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-2 bottom-2 left-[19px] w-px bg-ink/10" />
          <div className="space-y-10">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex gap-6 pl-0"
              >
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-canvas font-mono text-sm font-medium text-accent">
                  {index + 1}
                </div>
                <div className="pt-1.5">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
