"use client";

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
      <VelocityField className="pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-6xl gap-14 px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pt-28">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={item}>
            <Eyebrow>La méthode pour lancer ton premier SaaS</Eyebrow>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-[42px] font-semibold leading-[1.06] tracking-tight sm:text-[56px] lg:text-[60px]"
          >
            <span className="text-ink">Prends ton élan,</span>
            <br />
            <span className="text-ink">lance ton premier SaaS</span>
            <br />
            <span className="text-ink-muted">et touche tes premiers revenus.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-md font-body text-[17px] leading-relaxed text-ink-muted"
          >
            Trouve une idée qui tient debout, construis-la avec l&apos;IA, et{" "}
            <span className="font-medium text-ink">décroche tes premiers clients</span>{" "}
            en un mois.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/inscription" size="default">
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
