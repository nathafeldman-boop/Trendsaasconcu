"use client";

import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { LightRays } from "@/components/landing/light-rays";
import { CircuitLines } from "@/components/landing/circuit-lines";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-ink/8 bg-gradient-to-b from-canvas-raised to-canvas">
      <LightRays className="absolute inset-0 opacity-70" />
      <CircuitLines className="absolute inset-0 hidden h-full w-full opacity-60 md:block" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32"
      >
        <div className="flex justify-center">
          <Eyebrow tone="accent">Ton tour</Eyebrow>
        </div>
        <h2 className="mt-6 font-display text-[36px] font-normal leading-[1.06] tracking-[-0.05em] sm:text-[54px]">
          <span className="text-chrome">Le prochain SaaS qui marche</span>
          <br />
          <span className="text-chrome">pourrait être</span>{" "}
          <span className="font-serif italic tracking-normal text-accent [text-shadow:0_0_32px_rgba(51,244,239,0.45)]">
            le tien.
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
          Un mini-accompagnement complet pour le prix d&apos;un abonnement. On te donne la méthode,
          tu prends le relais.
        </p>
        <div className="mt-9 flex justify-center">
          <Button href="/commencer" size="default">
            Construire mon SaaS
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
