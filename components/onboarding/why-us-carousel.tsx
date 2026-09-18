"use client";

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { BookOpen, Terminal, Megaphone, Wallet, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingIcon } from "@/components/ui/floating-icon";
import { CountUp } from "@/components/ui/count-up";

const SLIDES = [
  {
    icon: BookOpen,
    title: "Pas juste des vidéos à regarder.",
    body: "Une formation classique donne des cours génériques. Toi, tu repars avec ton idée, ton prompt et ton plan, déjà adaptés à tes réponses.",
  },
  {
    icon: Terminal,
    title: "Le prompt exact pour construire.",
    body: "Colle-le dans Claude, Replit ou ChatGPT et ton site prend forme — pas besoin de deviner quoi demander à l'IA.",
  },
  {
    icon: Megaphone,
    title: "Le marketing, pas juste le code.",
    body: "La plupart des formations s'arrêtent à « comment coder ». On t'aide aussi à trouver tes premiers clients.",
  },
  {
    icon: Wallet,
    title: "Ton propre dashboard de revenus.",
    body: "Connecte ton compte Stripe et suis ton chiffre d'affaires directement dans ton espace.",
    dashboard: true,
  },
  {
    icon: Tag,
    title: "Moins cher qu'une formation classique.",
    body: "La plupart des formations coûtent 300 à 2000 € en une fois. SaaSFounder démarre à 9,99 €/semaine, résiliable à tout moment.",
  },
];

function SlideDashboard() {
  return (
    <div className="mt-6 rounded-lg border border-accent/30 bg-accent/[0.06] p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Aperçu · ton espace</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            <CountUp value={1240} format={(n) => `${n.toLocaleString("fr-FR")} €`} />
          </p>
          <p className="mt-0.5 font-body text-[11px] text-ink-faint">Volume brut</p>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            <CountUp value={19} />
          </p>
          <p className="mt-0.5 font-body text-[11px] text-ink-faint">Clients</p>
        </div>
      </div>
      <svg viewBox="0 0 200 46" className="mt-4 h-11 w-full text-accent" preserveAspectRatio="none">
        <motion.path
          d="M4,42 L30,38 L58,34 L88,26 L120,18 L152,10 L196,4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.3, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <p className="mt-2 font-body text-[11px] text-ink-faint">
        Exemple illustratif — les chiffres réels dépendent de ton propre compte Stripe.
      </p>
    </div>
  );
}

export function WhyUsCarousel({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide];
  const Icon = current.icon;

  function next() {
    if (isLast) {
      onDone();
    } else {
      setSlide((s) => s + 1);
    }
  }

  function back() {
    if (slide > 0) setSlide((s) => s - 1);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60 && !isLast) setSlide((s) => s + 1);
    else if (info.offset.x > 60 && slide > 0) setSlide((s) => s - 1);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-6 sm:px-8">
        <button
          type="button"
          onClick={back}
          disabled={slide === 0}
          className="font-body text-[13px] text-ink-faint transition-colors hover:text-ink-muted disabled:opacity-0"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={onDone}
          className="font-body text-[13px] text-ink-faint transition-colors hover:text-ink-muted"
        >
          Passer
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 pb-16 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="cursor-grab active:cursor-grabbing"
          >
            <FloatingIcon className="size-14">
              <Icon className="size-6" strokeWidth={1.75} />
            </FloatingIcon>
            <h1 className="mt-6 font-display text-[28px] font-semibold leading-tight tracking-tight text-ink sm:text-[32px]">
              {current.title}
            </h1>
            <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
              {current.body}
            </p>
            {current.dashboard && <SlideDashboard />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSlide(index)}
              aria-label={`Étape ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === slide ? "w-6 bg-accent" : "w-1.5 bg-ink/20"
              }`}
            />
          ))}
        </div>

        <Button showArrow={!isLast} onClick={next} className="mt-8 w-full">
          {isLast ? "Continuer" : "Suivant"}
        </Button>
      </div>
    </div>
  );
}
