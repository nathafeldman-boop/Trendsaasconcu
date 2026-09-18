"use client";

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Lightbulb, Sparkles, Rocket, Users } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { FloatingIcon } from "@/components/ui/floating-icon";

const SLIDES = [
  {
    icon: Lightbulb,
    title: "On t'aide à trouver ton idée.",
    body: "Que tu aies déjà une idée ou non, on te guide vers une direction concrète pour ton premier SaaS.",
  },
  {
    icon: Sparkles,
    title: "On t'écrit ton prompt.",
    body: "Prêt à coller dans l'IA de ton choix (Claude, Replit, ChatGPT...) pour construire ton site.",
  },
  {
    icon: Rocket,
    title: "On t'aide sur le marketing.",
    body: "Le bon canal, des idées de contenu, et un plan pour trouver tes premiers clients.",
  },
  {
    icon: Users,
    title: "Rien ne se perd.",
    body: "Tes réponses restent sur cet appareil, et ton avancée est sauvegardée dans ton espace.",
  },
];

export function IntroCarousel({ onDone }: { onDone: () => void }) {
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

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60 && !isLast) setSlide((s) => s + 1);
    else if (info.offset.x > 60 && slide > 0) setSlide((s) => s - 1);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
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
          {isLast ? "Commencer" : "Suivant"}
        </Button>
      </div>
    </div>
  );
}
