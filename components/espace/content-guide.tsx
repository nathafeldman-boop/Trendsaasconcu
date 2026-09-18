"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ChevronDown } from "lucide-react";
import { FloatingIcon } from "@/components/ui/floating-icon";

const SECTIONS = [
  {
    title: "Le hook (les 3 premières secondes)",
    body: [
      "Sur TikTok et Instagram, la vidéo se joue dans les 3 premières secondes — si rien n'accroche, on passe à la suivante sans même voir le reste.",
      "Un hook efficace nomme le problème que ton public vit déjà : « Si tu passes encore 2h par semaine sur ton planning à la main... » plutôt qu'une intro générale sur toi ou ton entreprise.",
      "Montre quelque chose (ton écran, le résultat, un avant/après) dès la première seconde plutôt que de parler à la caméra sans rien à regarder.",
    ],
  },
  {
    title: "La structure : problème → solution → preuve → action",
    body: [
      "Problème : la douleur concrète de ton public, en une phrase.",
      "Solution : comment ton SaaS la résout, montré à l'écran plutôt qu'expliqué à l'oral.",
      "Preuve : une démonstration réelle (ton propre usage compte, tu n'as pas besoin de clients pour commencer).",
      "Action : dis clairement ce que la personne doit faire ensuite (« lien en bio », « commente 'demo' »).",
    ],
  },
  {
    title: "Adapter le format au canal",
    body: [
      "TikTok récompense le brut, filmé au téléphone, avec ta voix — le format trop léché fait moins bien qu'ailleurs.",
      "Instagram (Reels) tolère un peu plus de soin visuel, mais garde le même rythme rapide dès les premières secondes.",
      "Dans les deux cas, les sous-titres augmentent le temps de visionnage — beaucoup de gens regardent sans le son.",
    ],
  },
  {
    title: "La fréquence compte plus que la perfection",
    body: [
      "Une vidéo imparfaite publiée cette semaine vaut mieux qu'une vidéo parfaite jamais publiée.",
      "Vise une cadence que tu peux vraiment tenir (même 2-3 par semaine) plutôt qu'un rythme intenable que tu abandonnes après une semaine.",
      "Les premières vidéos servent surtout à apprendre ce qui marche pour TON produit — normal qu'elles ne cartonnent pas toutes.",
    ],
  },
  {
    title: "Erreurs fréquentes à éviter",
    body: [
      "Vendre avant de montrer : commence par le problème et la démo, garde le pitch pour la fin.",
      "Ne jamais montrer le produit à l'écran : les gens veulent voir ce qu'ils vont utiliser, pas juste t'entendre en parler.",
      "Changer de format à chaque vidéo : garde une structure reconnaissable pour que les gens sachent à quoi s'attendre de toi.",
    ],
  },
];

export function ContentGuide() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <div className="rounded-xl border border-ink/12 bg-ink/[0.02] p-6">
      <FloatingIcon className="size-10">
        <GraduationCap className="size-4" strokeWidth={1.75} />
      </FloatingIcon>
      <h2 className="mt-3 font-display text-xl font-semibold text-ink">
        Apprends à créer du contenu qui accroche
      </h2>
      <p className="mt-1 font-body text-[14px] text-ink-muted">
        Le format qui marche le mieux pour faire découvrir un SaaS sur TikTok et Instagram —
        avant même de penser au canal ou à l&apos;idée précise.
      </p>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-4 font-body text-[13px] font-medium text-accent underline underline-offset-2 hover:text-accent-deep"
      >
        {open ? "Masquer la formation" : "Voir la formation complète"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-5 flex flex-col gap-2.5 border-t border-ink/10 pt-5">
              {SECTIONS.map((section, i) => {
                const isOpen = openSection === i;
                return (
                  <div key={section.title} className="rounded-lg border border-ink/10">
                    <button
                      type="button"
                      onClick={() => setOpenSection(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span className="font-body text-[14px] font-medium text-ink">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-ink-faint transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <ul className="flex flex-col gap-2 border-t border-ink/8 px-4 py-3 font-body text-[13px] leading-relaxed text-ink-muted">
                        {section.body.map((line, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-accent">·</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
