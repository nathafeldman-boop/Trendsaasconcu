"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { LightRays } from "@/components/landing/light-rays";
import { CircuitLines } from "@/components/landing/circuit-lines";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-ink/8 bg-gradient-to-b from-canvas-raised to-canvas">
      <LightRays className="absolute inset-0 opacity-70" />
      <CircuitLines className="absolute inset-0 hidden h-full w-full opacity-50 md:block" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center lg:text-left"
        >
          <div className="flex justify-center lg:justify-start">
            <Eyebrow tone="accent">Ton tour</Eyebrow>
          </div>
          <h2 className="mt-6 font-display text-[36px] font-normal leading-[1.06] tracking-[-0.05em] sm:text-[54px]">
            <span className="text-chrome">Le prochain SaaS qui marche pourrait être</span>{" "}
            <span className="font-serif italic tracking-normal text-accent [text-shadow:0_0_32px_rgba(51,244,239,0.45)]">
              le tien.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-md font-body text-[15px] leading-relaxed text-ink-muted lg:mx-0">
            Un mini-accompagnement complet pour le prix d&apos;un abonnement. On te donne la méthode,
            tu prends le relais, et tu construis la vie que tu vises.
          </p>
          <div className="mt-9 flex justify-center lg:justify-start">
            <Button href="/commencer" size="default">
              Construire mon SaaS
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative mx-auto w-full max-w-[340px] lg:max-w-[400px]"
        >
          <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-accent/10 blur-[90px]" />
          <div className="relative aspect-[736/1100] overflow-hidden rounded-[28px] border border-white/10 shadow-[0_40px_120px_-40px_rgba(0,0,0,1)]">
            <motion.div
              initial={{ scale: 1.14 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: EASE }}
              className="absolute inset-0"
            >
              <Image
                src="/images/hero-bg.jpg"
                alt="Une sportive noire et une supercar turquoise devant un jet privé, de nuit"
                fill
                sizes="(min-width: 1024px) 400px, 340px"
                className="object-cover object-[50%_62%]"
              />
            </motion.div>
            {/* Grade the photo into the carbon black around it. */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/10 to-canvas/30" />
            <div aria-hidden className="absolute inset-0 rounded-[28px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.12)]" />

            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
              className="absolute inset-x-4 bottom-4"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/55 p-3 backdrop-blur-md"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-accent text-canvas">
                  <CreditCard className="size-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-body text-[13px] font-semibold text-ink">Paiement reçu</p>
                    <p className="font-body text-[11px] text-ink-faint">maintenant</p>
                  </div>
                  <p className="font-body text-[12px] text-ink-muted">27,99 € · Plan trimestriel</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
