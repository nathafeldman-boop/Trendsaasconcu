"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// What SaaSFounder's beta testers reported, as they reported it (names and
// photos shared with their agreement). Stacked under the calculation and
// the generation, before the plans, the way SaaSUnlock shows its reviews.
const REVIEWS = [
  { name: "Kevin", photo: "/temoignages/kevin.webp", quote: "Incroyable. J'ai fait 3 700 € le premier mois." },
  { name: "Marvin", photo: "/temoignages/marvin.webp", quote: "En 24 heures, j'avais déjà fait 100 €." },
  { name: "Alex", photo: "/temoignages/alex.webp", quote: "J'ai fait 800 € en une seule journée." },
  { name: "Danny", photo: "/temoignages/danny.webp", quote: "Mon premier paiement est tombé une heure après avoir utilisé l'appli." },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Testimonials({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <ul className="flex flex-col gap-3">
        {REVIEWS.map((review, i) => (
          <motion.li
            key={review.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.6, ease: EASE }}
            className="rounded-[18px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 text-left shadow-[0_20px_50px_-35px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center gap-3">
              <span className="relative size-9 shrink-0 rounded-full bg-gradient-to-br from-accent to-accent-deep p-[1.5px]">
                <Image src={review.photo} alt={review.name} width={72} height={72} className="size-full rounded-full object-cover" />
              </span>
              <p className="flex items-center gap-1 font-body text-[15px] font-semibold text-ink">
                {review.name}
                <BadgeCheck className="size-4 text-accent" strokeWidth={2.25} aria-label="Testeur bêta" />
              </p>
              <span className="flex items-center gap-0.5" aria-label="5 étoiles sur 5">
                {Array.from({ length: 5 }, (_, s) => (
                  <Star key={s} className="size-3.5 fill-[#f5c451] text-[#f5c451]" />
                ))}
              </span>
            </div>
            <p className="mt-2.5 font-body text-[15px] leading-relaxed text-ink">{review.quote}</p>
          </motion.li>
        ))}
      </ul>
      <p className="mt-3 text-center font-body text-[11px] text-ink-faint">Avis de nos testeurs bêta · résultats individuels.</p>
    </div>
  );
}
