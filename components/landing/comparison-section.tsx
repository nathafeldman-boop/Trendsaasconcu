"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const WITHOUT = [
  "Des semaines à chercher « la » bonne idée.",
  "Un site qui n'avance pas, bloqué au premier bug.",
  "Aucune idée de comment encaisser un paiement.",
  "Du contenu posté au hasard, sans stratégie.",
  "Cinq outils, zéro plan, et l'envie qui retombe.",
];

const WITH = [
  "Une idée validée, choisie pour ton profil.",
  "Un prompt de build prêt à coller dans ton IA.",
  "Stripe branché, tes paiements suivis en direct.",
  "Un plan marketing de 30 jours, action par action.",
  "Un coach IA qui répond quand tu bloques.",
];

export function ComparisonSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow>Une autre façon de lancer</Eyebrow>
        </div>
        <h2 className="mt-5 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.045em] text-chrome sm:text-[46px]">
          La galère du lancement,{" "}
          <span className="font-serif italic tracking-normal text-accent">supprimée.</span>
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="rounded-[22px] border border-ink/8 bg-ink/[0.02] p-7 sm:p-9"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Seul, sans méthode</p>
          <ul className="mt-6 flex flex-col gap-4">
            {WITHOUT.map((line, index) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
                className="flex items-start gap-3 font-body text-[15px] leading-snug text-ink-faint"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-red-400/80">
                  <X className="size-3" strokeWidth={3} />
                </span>
                <span className="line-through decoration-ink-faint/40">{line}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="glass-panel relative overflow-hidden rounded-[22px] p-7 sm:p-9"
        >
          <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-accent/15 blur-[80px]" />
          <p className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Avec SaaSFounder</p>
          <ul className="relative mt-6 flex flex-col gap-4">
            {WITH.map((line, index) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.08 }}
                className="flex items-start gap-3 font-body text-[15px] leading-snug text-ink"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-canvas shadow-[0_0_12px_-2px_var(--color-accent)]">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {line}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
