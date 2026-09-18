"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { VelocityField } from "@/components/landing/velocity-field";
import { DashboardPreview } from "@/components/landing/dashboard-preview";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.14] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      >
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          className="scale-110 object-cover object-center blur-[2px]"
        />
      </div>
      <VelocityField className="pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-10 pb-14 sm:px-8 sm:pt-14 sm:pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:pt-16">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={item}>
            <Eyebrow>La méthode pour lancer ton SaaS</Eyebrow>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-5 font-display text-[46px] font-semibold leading-[1.02] tracking-tight sm:text-[60px] lg:text-[68px]"
          >
            <span className="text-ink">Deviens fondateur.</span>
            <br />
            <span className="text-ink-muted">Lance ton SaaS.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-sm font-body text-[17px] leading-relaxed text-ink-muted"
          >
            Ton idée. <span className="font-medium text-ink">Construite avec l&apos;IA.</span>{" "}
            Vendue en un mois.
          </motion.p>

          <motion.div variants={item} className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/commencer" size="default">
              Trouver mon idée
            </Button>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              Sans carte bancaire · 3 min pour démarrer
            </p>
          </motion.div>
        </motion.div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[380px] translate-x-4 sm:translate-x-8 lg:translate-x-10">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
