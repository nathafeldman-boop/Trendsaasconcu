"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// What SaaSFounder's beta testers reported, as they reported it (names and
// photos shared with their agreement). Shown while the projection is
// calculated and while their business is generated, before the plans.
const REVIEWS = [
  { name: "Kevin", photo: "/temoignages/kevin.webp", quote: "Incroyable. J'ai fait 3 700 € le premier mois.", result: "3 700 € le 1er mois" },
  { name: "Marvin", photo: "/temoignages/marvin.webp", quote: "En 24 heures, j'avais déjà fait 100 €.", result: "100 € en 24 h" },
  { name: "Alex", photo: "/temoignages/alex.webp", quote: "J'ai fait 800 € en une seule journée.", result: "800 € en 1 jour" },
  { name: "Danny", photo: "/temoignages/danny.webp", quote: "Mon premier paiement est tombé une heure après avoir utilisé l'appli.", result: "1er paiement en 1 h" },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EVERY_MS = 4500;

export function Testimonials({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const review = REVIEWS[index];

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % REVIEWS.length), EVERY_MS);
    return () => window.clearTimeout(id);
  }, [index, paused]);

  const go = (step: number) => {
    setPaused(true);
    setIndex((i) => (i + step + REVIEWS.length) % REVIEWS.length);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9),0_0_50px_-30px_var(--color-accent)]">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-accent/15 blur-3xl" />
        <AnimatePresence mode="wait">
          <motion.div
            key={review.name}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative"
          >
            <div className="flex items-center gap-3">
              <span className="relative size-12 shrink-0 rounded-full bg-gradient-to-br from-accent to-accent-deep p-[2px]">
                <Image src={review.photo} alt={review.name} width={96} height={96} className="size-full rounded-full object-cover" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-body text-[15px] font-semibold text-ink">
                  {review.name}
                  <BadgeCheck className="size-4 text-accent" strokeWidth={2.25} aria-label="Testeur bêta" />
                </p>
                <div className="mt-0.5 flex items-center gap-0.5" aria-label="5 étoiles sur 5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-3.5 fill-[#f5c451] text-[#f5c451]" />
                  ))}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-accent">
                {review.result}
              </span>
            </div>
            <p className="mt-4 font-body text-[16px] leading-relaxed text-ink">« {review.quote} »</p>
          </motion.div>
        </AnimatePresence>

        <div className="relative mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Avis précédent"
            className="flex size-9 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {REVIEWS.map((r, i) => (
              <button
                key={r.name}
                type="button"
                onClick={() => {
                  setPaused(true);
                  setIndex(i);
                }}
                aria-label={`Avis de ${r.name}`}
                className={cn("h-1.5 rounded-full transition-all duration-300", i === index ? "w-5 bg-ink" : "w-1.5 bg-ink/25")}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Avis suivant"
            className="flex size-9 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-center font-body text-[11px] text-ink-faint">Testeurs bêta de SaaSFounder · résultats individuels</p>
    </div>
  );
}
