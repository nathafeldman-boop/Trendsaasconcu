"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Compass, Lightbulb, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

// Read back in /espace when the user reaches "Décris ton idée", so what they
// typed here is already filled in after signup and the questionnaire.
export const HERO_IDEA_STORAGE_KEY = "saasfounder-hero-idea";

const MODES = [
  { id: "idea", label: "J'ai une idée", icon: Lightbulb },
  { id: "find", label: "Trouve-moi une idée", icon: Compass },
  { id: "existing", label: "J'ai déjà un SaaS", icon: Rocket },
] as const;

type Mode = (typeof MODES)[number]["id"];

const EXAMPLES = [
  "Un outil qui relance les factures impayées des coachs sportifs",
  "Une app de réservation pour les salons de tatouage",
  "Un générateur de devis pour les artisans du bâtiment",
  "Un suivi d'abonnements pour les petites salles de sport",
];

const MODE_COPY: Record<Exclude<Mode, "idea">, { title: string; body: string }> = {
  find: {
    title: "Pas encore d'idée ? C'est notre travail.",
    body: "18 questions sur ton temps, ton budget et tes compétences, et on te propose l'idée de SaaS faite pour toi, avec son marché et son prompt de build.",
  },
  existing: {
    title: "Ton SaaS est en ligne, mais personne ne paie ?",
    body: "On analyse ton site et on se concentre sur ce qui manque : ton message, ton canal marketing et tes premiers clients.",
  },
};

export function HeroPrompt() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idea");
  const [idea, setIdea] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setExampleIndex((i) => (i + 1) % EXAMPLES.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  function start() {
    if (mode === "idea" && idea.trim()) {
      try {
        window.localStorage.setItem(HERO_IDEA_STORAGE_KEY, idea.trim().slice(0, 2000));
      } catch {
        // storage unavailable — the user just types it again later
      }
    }
    router.push("/commencer");
  }

  return (
    <div className="w-full max-w-[760px] rounded-[26px] p-2">
      <div className="relative rounded-[22px] border border-accent-deep/60 bg-[#021e24]/85 shadow-[inset_0_0_18px_rgba(255,255,255,0.08),inset_0_2px_5px_rgba(255,255,255,0.25),0_0_60px_-20px_var(--color-accent)] backdrop-blur-md">
        <div className="flex flex-wrap gap-1 p-2">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 rounded-[12px] px-3.5 py-2 font-body text-[13px] transition-colors",
                mode === id ? "text-ink" : "text-ink-faint hover:text-ink-muted"
              )}
            >
              {mode === id && (
                <motion.span
                  layoutId="hero-mode"
                  className="absolute inset-0 rounded-[12px] bg-gradient-to-b from-[#08444b] to-[#106f71] shadow-[inset_0_0_4px_var(--color-accent)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="relative size-4" strokeWidth={1.75} />
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className="relative min-h-[132px] px-4 pb-16 pt-2 text-left sm:px-5">
          <AnimatePresence mode="wait" initial={false}>
            {mode === "idea" ? (
              <motion.div
                key="idea"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="relative"
              >
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      start();
                    }
                  }}
                  aria-label="Décris ton idée de SaaS"
                  rows={3}
                  className="block w-full resize-none bg-transparent font-body text-[16px] leading-relaxed text-ink caret-accent outline-none"
                />
                {!idea && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden font-body text-[16px] leading-relaxed text-ink-faint">
                    {/* Remounting on each new example restarts the CSS reveal. */}
                    <span key={exampleIndex} className="block animate-blur-reveal">
                      {EXAMPLES[exampleIndex]}
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <p className="font-body text-[16px] font-medium text-ink">{MODE_COPY[mode].title}</p>
                <p className="mt-1.5 max-w-xl font-body text-[14px] leading-relaxed text-ink-muted">
                  {MODE_COPY[mode].body}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-x-4 bottom-3 flex items-center justify-between gap-3 sm:inset-x-5">
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint sm:block">
              Gratuit pour commencer · sans carte bancaire
            </p>
            <button
              type="button"
              onClick={start}
              className="group relative ml-auto flex h-11 items-center gap-2 overflow-hidden rounded-pill bg-accent px-5 font-body text-[14px] font-semibold text-canvas shadow-[0_0_28px_-6px_var(--color-accent),inset_0_1px_0_rgba(255,255,255,0.55)] transition-all hover:scale-[1.03] hover:bg-accent-light active:scale-95"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sheen bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
              <span className="relative">{mode === "idea" ? "Construire mon SaaS" : "Commencer"}</span>
              <ArrowUp className="relative size-4 rotate-45 transition-transform group-hover:rotate-90" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
