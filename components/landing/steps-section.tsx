"use client";

import { motion, type Variants } from "framer-motion";
import { Check, Copy, Sparkles } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function QuestionMock() {
  const options = ["Moins de 5 h", "5 à 15 h", "Plus de 15 h"];
  return (
    <div className="glass-panel rounded-[22px] p-5 sm:p-6">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        <span>Chapitre 2 · Ton temps</span>
        <span>7 / 18</span>
      </div>
      <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-ink/8">
        <motion.div
          initial={{ width: "8%" }}
          whileInView={{ width: "39%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
          className="h-full rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]"
        />
      </div>
      <p className="mt-6 font-display text-[20px] font-medium leading-snug tracking-[-0.02em] text-ink">
        Combien d&apos;heures par semaine peux-tu y consacrer ?
      </p>
      <div className="mt-5 flex flex-col gap-2.5">
        {options.map((option, index) => {
          const selected = index === 1;
          return (
            <motion.div
              key={option}
              initial={false}
              whileInView={
                selected
                  ? {
                      borderColor: "rgba(51, 244, 239, 0.7)",
                      backgroundColor: "rgba(51, 244, 239, 0.1)",
                      boxShadow: "0 0 28px -10px rgba(51, 244, 239, 1)",
                    }
                  : {}
              }
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 1.1 }}
              className="flex items-center justify-between rounded-[14px] border border-ink/12 bg-ink/[0.02] px-4 py-3 font-body text-[14px] text-ink"
            >
              {option}
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1.2, ease: EASE }}
                  className="flex size-5 items-center justify-center rounded-full bg-accent text-canvas"
                >
                  <Check className="size-3" strokeWidth={3} />
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const PROMPT_LINES = [
  { text: "# Objectif", tone: "accent" },
  { text: "SaaS de relance de factures pour coachs sportifs.", tone: "ink" },
  { text: "# Écrans", tone: "accent" },
  { text: "- Landing, inscription, tableau de bord des factures", tone: "ink" },
  { text: "# Paiements", tone: "accent" },
  { text: "- Abonnement Stripe à 19 €/mois, essai 7 jours", tone: "ink" },
  { text: "# Avant de coder", tone: "accent" },
  { text: "Propose-moi un plan en 5 étapes.", tone: "ink" },
] as const;

const linesIn: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 1.1 } },
};

const lineIn: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

function PromptMock() {
  return (
    <div className="glass-panel rounded-[22px] p-5 sm:p-6">
      <div className="ml-auto max-w-[85%] rounded-[16px] rounded-br-[4px] bg-accent/12 px-4 py-3 font-body text-[14px] leading-snug text-ink">
        Un outil qui relance les factures impayées des coachs sportifs.
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-accent text-canvas">
          <Sparkles className="size-3.5" strokeWidth={2.25} />
        </span>
        <p className="font-body text-[13px] font-medium text-ink">Claude écrit ton prompt</p>
        <motion.span
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2, delay: 1.0 }}
          className="flex gap-1"
        >
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
              className="size-1.5 rounded-full bg-accent"
            />
          ))}
        </motion.span>
      </div>

      <div className="mt-3 rounded-[14px] border border-ink/8 bg-black/60 p-4">
        <motion.div
          variants={linesIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          className="flex flex-col gap-1.5 font-mono text-[12px] leading-relaxed"
        >
          {PROMPT_LINES.map((line) => (
            <motion.p
              key={line.text}
              variants={lineIn}
              className={line.tone === "accent" ? "text-accent" : "text-ink-muted"}
            >
              {line.text}
            </motion.p>
          ))}
        </motion.div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">~650 mots · prêt à coller</p>
        <span className="flex items-center gap-1.5 rounded-pill border border-ink/12 px-3 py-1.5 font-body text-[12px] text-ink">
          <Copy className="size-3.5" /> Copier
        </span>
      </div>
    </div>
  );
}

const MRR_POINTS = [4, 6, 5, 9, 12, 11, 16, 20, 24, 23, 30, 36];
const CHART_W = 320;
const CHART_H = 110;

function mrrPath(closed: boolean) {
  const max = Math.max(...MRR_POINTS);
  const step = CHART_W / (MRR_POINTS.length - 1);
  const line = MRR_POINTS.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(CHART_H - (v / max) * (CHART_H - 8)).toFixed(1)}`).join(" ");
  return closed ? `${line} L${CHART_W},${CHART_H} L0,${CHART_H} Z` : line;
}

function LaunchMock() {
  const tasks = ["Site en ligne", "Paiements Stripe branchés", "3 vidéos publiées"];
  return (
    <div className="glass-panel rounded-[22px] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Pilotage · ton MRR</p>
        <span className="flex items-center gap-1.5 rounded-full bg-success/12 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-success">
          <span className="size-1.5 rounded-full bg-success" /> En direct
        </span>
      </div>
      <div className="mt-3 flex items-end gap-3">
        <p className="font-display text-[38px] font-medium tracking-[-0.04em] text-ink">
          <CountUp value={1240} format={(n) => `${n.toLocaleString("fr-FR")} €`} />
        </p>
        <p className="mb-2 font-mono text-[12px] text-success">+212 %</p>
      </div>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="mt-3 h-[110px] w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mrr-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={mrrPath(true)}
          fill="url(#mrr-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.0 }}
        />
        <motion.path
          d={mrrPath(false)}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px var(--color-accent))" }}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
        />
      </svg>

      <div className="mt-5 flex flex-col gap-2 border-t border-ink/8 pt-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.6 + index * 0.2 }}
            className="flex items-center gap-2.5 font-body text-[13px] text-ink"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-accent text-canvas">
              <Check className="size-2.5" strokeWidth={3.5} />
            </span>
            {task}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  {
    label: "Étape 1",
    title: "Réponds à 18 questions, on trouve ton idée",
    body: "Ton temps, ton budget, tes compétences, la vie que tu vises. On croise tout ça avec 20 idées de SaaS validées et on garde celle qui est faite pour toi.",
    mock: QuestionMock,
  },
  {
    label: "Étape 2",
    title: "Claude écrit ton prompt de build",
    body: "Écrans, données, paiements, déploiement : un prompt d'environ 650 mots à coller dans Claude Code, Replit ou Lovable. Tu pilotes, l'IA code.",
    mock: PromptMock,
  },
  {
    label: "Étape 3",
    title: "Tu lances, on suit tes chiffres avec toi",
    body: "Checklist de lancement guidée, plan marketing de 30 jours et ton MRR Stripe en direct dans ton espace. Ton coach IA répond quand tu bloques, même sur une capture d'écran.",
    mock: LaunchMock,
  },
];

export function StepsSection() {
  return (
    <section id="methode" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow tone="accent">La méthode</Eyebrow>
        </div>
        <h2 className="mt-5 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.045em] text-chrome sm:text-[46px]">
          Ton SaaS en{" "}
          <span className="font-serif italic tracking-normal text-accent">3 étapes.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
          Pas un cours théorique de plus : des livrables que tu utilises le jour même.
        </p>
      </div>

      <div className="relative mt-16 flex flex-col gap-20 sm:gap-24">
        {/* The wire connecting the three steps. */}
        <div
          aria-hidden
          className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent/25 to-transparent lg:block"
        />
        {STEPS.map((step, index) => {
          const Mock = step.mock;
          const reversed = index % 2 === 1;
          return (
            <div key={step.label} className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 hidden size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_16px_var(--color-accent)] lg:block"
              />
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.6, ease: EASE }}
                className={cn(reversed && "lg:order-2")}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">{step.label}</p>
                <h3 className="mt-3 font-display text-[26px] font-medium leading-tight tracking-[-0.03em] text-ink sm:text-[30px]">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">{step.body}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.7, ease: EASE }}
                className={cn("mx-auto w-full max-w-[440px]", reversed && "lg:order-1")}
              >
                <Mock />
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
