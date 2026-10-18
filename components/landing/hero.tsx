"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { CountUp } from "@/components/ui/count-up";
import { LightRays } from "@/components/landing/light-rays";
import { CircuitLines } from "@/components/landing/circuit-lines";
import { HeroPrompt } from "@/components/landing/hero-prompt";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STATS = [
  { value: 20, label: "idées de SaaS validées" },
  { value: 18, label: "questions sur ta situation" },
  { value: 650, prefix: "~", label: "mots de prompt prêts à coller" },
  { value: 30, label: "jours de plan d'action" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <LightRays className="absolute inset-x-0 top-0 -z-10 h-[760px]" />
      <div aria-hidden className="carbon-weave absolute inset-0 -z-20" />
      <CircuitLines className="absolute inset-x-0 top-0 -z-10 hidden h-[640px] w-full opacity-80 md:block" />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-16 pt-14 text-center sm:px-8 sm:pt-20 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex h-9 items-center gap-2 rounded-[16px] bg-gradient-to-b from-white/[0.09] to-white/[0.02] pl-2 pr-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.12)]"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Sparkles className="size-3.5" strokeWidth={2} />
          </span>
          <span className="font-body text-[13px] text-ink">Ton coach IA intégré, propulsé par Claude</span>
        </motion.div>

        <h1
          aria-label="Crée ton SaaS qui rapporte, en 30 jours avec l'IA."
          className="mt-6 max-w-[900px] font-display text-[42px] font-normal leading-[1.04] tracking-[-0.055em] text-ink sm:text-[58px] lg:text-[68px]"
        >
          <span aria-hidden>
            <BlurReveal text="Crée ton SaaS qui" delay={80} className="text-chrome" />{" "}
            <span className="font-serif text-[1.04em] italic tracking-[-0.01em] text-accent [text-shadow:0_0_32px_rgba(51,244,239,0.45)]">
              <BlurReveal text="rapporte," delay={380} />
            </span>
            <br />
            <BlurReveal text="en 30 jours avec l'IA." delay={520} className="text-chrome" />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
          className="mt-6 max-w-xl font-body text-[16px] leading-relaxed text-ink-muted sm:text-[17px]"
        >
          Ton idée validée, ton prompt de build, ton plan marketing.{" "}
          <span className="text-ink">L&apos;IA fait le gros du travail</span>, tu prends les décisions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
          className="mt-8 flex w-full justify-center"
        >
          <HeroPrompt />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.15 }}
          className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-y-8 sm:grid-cols-4"
        >
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center px-3 ${index > 0 ? "sm:border-l sm:border-ink/10" : ""}`}
            >
              <p className="font-display text-[34px] font-medium tracking-[-0.04em] text-ink sm:text-[40px]">
                <CountUp value={stat.value} prefix={stat.prefix} />
              </p>
              <p className="mt-1 max-w-[18ch] font-body text-[13px] leading-snug text-ink-faint">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
