"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Lightbulb, Lock, RefreshCw, Sparkles, Target, Users } from "lucide-react";
import { StepShell } from "@/components/onboarding/step-shell";
import { Button } from "@/components/ui/button";
import type { ShellProps } from "@/components/onboarding/funnel-screens";
import type { Answers } from "@/components/onboarding/funnel";
import { customersNeeded, FOUND_IDEA_KEY, ideaInput, readFoundIdea, type FoundIdea } from "@/lib/onboarding/found-idea";
import { requestIdea } from "@/lib/onboarding/idea-request";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Long enough to read as "searching", short enough not to feel padded.
const MIN_SEARCH_MS = 2200;

const SEARCH_LINES = [
  "On croise ton univers et ta cible",
  "On garde les problèmes pour lesquels on paie déjà",
  "On cale le prix sur ton objectif",
];

const FOUND_FOR_KEY = "found_idea_for";
const REGENERATED_KEY = "found_idea_regenerated";

function euros(value: number) {
  // Non-breaking space: "3 000 €" never wraps before the €.
  return `${Math.round(value).toLocaleString("fr-FR")}\u00a0€`;
}

function priceVerdict(customers: number) {
  if (customers <= 40) return "Quelques dizaines de clients : jouable en les contactant toi-même.";
  if (customers <= 150) return "Atteignable avec du contenu régulier et un peu de prospection.";
  return "Beaucoup de clients à trouver : un prix plus haut ou une cible pro rendrait l'objectif plus proche.";
}

type Phase = "searching" | "found" | "error";

export function IdeaRevealScreen({
  shell,
  answers,
  onAnswer,
  onNext,
}: {
  shell: ShellProps;
  answers: Answers;
  onAnswer: (patch: Answers) => Answers;
  onNext: (answers?: Answers) => void;
}) {
  // An idea found for other answers (they went back and changed them) is
  // searched for again.
  const inputKey = JSON.stringify(ideaInput(answers));
  const stored = answers[FOUND_FOR_KEY] === inputKey ? readFoundIdea(answers) : null;
  const [idea, setIdea] = useState<FoundIdea | null>(stored);
  const [phase, setPhase] = useState<Phase>(stored ? "found" : "searching");
  const [price, setPrice] = useState(stored?.price_per_month ?? 0);
  const [attempt, setAttempt] = useState<{ n: number; exclude?: string }>({ n: stored ? 0 : 1 });
  const regenerated = answers[REGENERATED_KEY] === inputKey;
  const goal = Number(answers.revenueGoal ?? 3000);
  // The answers when the search started: the request is keyed on them.
  const latest = useRef({ answers, onAnswer, inputKey });
  useEffect(() => {
    latest.current = { answers, onAnswer, inputKey };
  });

  useEffect(() => {
    if (attempt.n === 0) return;
    let cancelled = false;
    const started = Date.now();
    const { answers: current } = latest.current;
    requestIdea(current, attempt.exclude).then(async (result) => {
      const wait = MIN_SEARCH_MS - (Date.now() - started);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      if (cancelled) return;
      if (!result) {
        setPhase("error");
        return;
      }
      latest.current.onAnswer({ [FOUND_IDEA_KEY]: JSON.stringify(result.idea), [FOUND_FOR_KEY]: latest.current.inputKey });
      setIdea(result.idea);
      setPrice(result.idea.price_per_month);
      setPhase("found");
      track("idea_revealed", {
        source: result.source,
        domain: current.domain,
        market: current.market,
        regenerate: Boolean(attempt.exclude),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function retry(exclude?: string) {
    setPhase("searching");
    setAttempt((a) => ({ n: a.n + 1, exclude }));
  }

  function keep() {
    if (!idea) return;
    const kept = { ...idea, price_per_month: price };
    track("idea_kept", { title: kept.title, price });
    onNext(onAnswer({ [FOUND_IDEA_KEY]: JSON.stringify(kept) }));
  }

  if (phase === "searching" || !idea) {
    return (
      <StepShell
        {...shell}
        center
        eyebrow="Recherche en cours"
        title={phase === "error" ? "La connexion a coupé." : "On cherche ton idée."}
        subtitle={
          phase === "error"
            ? "Ton idée n'a pas pu arriver jusqu'ici. Vérifie ta connexion et relance la recherche."
            : `Une idée de SaaS qui peut te rapporter tes ${euros(goal)} par mois.`
        }
        footer={
          phase === "error" ? (
            <Button showArrow={false} onClick={() => retry()} className="w-full">
              Relancer la recherche
            </Button>
          ) : null
        }
      >
        {phase === "error" ? null : <Searching />}
      </StepShell>
    );
  }

  const customers = customersNeeded(goal, price);
  const sliderMin = Math.max(3, Math.round(idea.price_per_month * 0.3));
  const sliderMax = Math.max(sliderMin + 10, Math.round(idea.price_per_month * 3));

  return (
    <StepShell
      {...shell}
      eyebrow="Idée trouvée"
      title={
        <>
          C&apos;est bon,{" "}
          <span className="font-serif italic tracking-normal text-accent">on a trouvé ton idée.</span>
        </>
      }
      subtitle={`Avec elle, ${customersNeeded(goal, idea.price_per_month)} clients suffisent pour atteindre tes ${euros(goal)} par mois.`}
      footer={
        <div className="flex flex-col gap-3">
          <Button showArrow={false} onClick={keep} className="w-full">
            Je garde cette idée
          </Button>
          {!regenerated ? (
            <button
              type="button"
              onClick={() => {
                onAnswer({ [REGENERATED_KEY]: inputKey });
                retry(idea.title);
              }}
              className="flex items-center justify-center gap-2 py-2 font-body text-[14px] text-ink-muted transition-colors hover:text-ink"
            >
              <RefreshCw className="size-3.5" />
              Me proposer une autre idée
            </button>
          ) : null}
        </div>
      }
    >
      <motion.div
        key={idea.title}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="glass-panel relative overflow-hidden rounded-[24px] p-6 shadow-[inset_0_0_0_1px_rgba(51,244,239,0.25),0_0_60px_-30px_var(--color-accent)]"
      >
        <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-accent/15 blur-[60px]" />
        <p className="relative flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          <Lightbulb className="size-3.5" />
          Ton idée de SaaS
        </p>
        <h2 className="relative mt-3 font-display text-[28px] font-semibold leading-tight tracking-[-0.03em] text-ink">{idea.title}</h2>
        <p className="relative mt-2 font-body text-[15px] leading-relaxed text-ink-muted">{idea.pitch}</p>

        <div className="relative mt-6 grid grid-cols-3 gap-3 border-t border-ink/10 pt-5">
          <Stat value={`${idea.price_per_month} €`} label="par mois et par client" />
          <Stat value={String(customersNeeded(goal, idea.price_per_month))} label={`clients pour ${euros(goal)}`} accent />
          <Stat value={idea.build_time} label="pour la construire" />
        </div>
      </motion.div>

      <div className="mt-4 flex flex-col gap-3">
        <Block icon={Target} label="Le problème" delay={0.15}>
          {idea.problem}
        </Block>
        <Block icon={Users} label="Pour qui" delay={0.25}>
          {idea.target}
        </Block>
        <Block icon={Check} label="Ce que tu construis" delay={0.35}>
          <ul className="flex flex-col gap-2">
            {idea.mvp.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-canvas">
                  <Check className="size-2.5" strokeWidth={3.5} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </Block>
        <Block icon={Sparkles} label="Pourquoi c'est pour toi" delay={0.45} highlight>
          {idea.why_you}
        </Block>
        <Block icon={Users} label="Tes 10 premiers clients" delay={0.55}>
          {idea.first_customers}
        </Block>
      </div>

      {/* Try the numbers: the part that feels like using the product. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.65, ease: EASE }}
        className="mt-6 rounded-[20px] border border-accent/25 bg-accent/[0.05] p-5"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Teste ton prix</p>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <p className="font-display text-[30px] font-semibold tracking-[-0.03em] text-ink tabular-nums">
            {price} €<span className="font-body text-[14px] font-normal text-ink-faint"> / mois</span>
          </p>
          <p className="text-right font-body text-[14px] text-ink-muted">
            <span className="font-display text-[22px] font-semibold text-accent tabular-nums">{customers}</span> clients
          </p>
        </div>
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={1}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          aria-label="Prix de l'abonnement par mois"
          className="mt-4 w-full accent-[var(--color-accent)]"
        />
        <p className="mt-3 font-body text-[13px] leading-relaxed text-ink-muted">
          À {price} € par mois, il te faut {customers} clients pour tes {euros(goal)}. {priceVerdict(customers)}
        </p>
      </motion.div>

      <LockedPreview idea={idea} />
    </StepShell>
  );
}

function Searching() {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setDone((n) => Math.min(SEARCH_LINES.length, n + 1)), MIN_SEARCH_MS / (SEARCH_LINES.length + 1));
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex size-28 items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-accent/40"
          animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-3 rounded-full border border-accent/30"
          animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        />
        <span className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent shadow-[0_0_40px_-6px_var(--color-accent)]">
          <Lightbulb className="size-7" strokeWidth={1.75} />
        </span>
      </div>
      <ol className="mt-8 flex w-full max-w-sm flex-col gap-2.5 text-left">
        {SEARCH_LINES.map((line, index) => {
          const isDone = index < done;
          return (
            <li key={line} className={cn("flex items-center gap-3 font-body text-[14px] transition-colors", isDone ? "text-ink" : "text-ink-faint")}>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  isDone ? "border-accent bg-accent text-canvas shadow-[0_0_10px_var(--color-accent)]" : "border-ink/20"
                )}
              >
                {isDone ? <Check className="size-3" strokeWidth={3} /> : null}
              </span>
              {line}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={cn("font-display text-[17px] font-semibold leading-tight sm:text-xl", accent ? "text-accent" : "text-ink")}>{value}</p>
      <p className="mt-1 font-body text-[11.5px] leading-snug text-ink-faint">{label}</p>
    </div>
  );
}

function Block({
  icon: Icon,
  label,
  delay,
  highlight = false,
  children,
}: {
  icon: typeof Target;
  label: string;
  delay: number;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      className={cn(
        "rounded-[18px] border p-4",
        highlight ? "border-accent/30 bg-accent/[0.06]" : "border-ink/8 bg-ink/[0.02]"
      )}
    >
      <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
        <Icon className={cn("size-3.5", highlight && "text-accent")} />
        {label}
      </p>
      <div className="mt-2 font-body text-[14px] leading-relaxed text-ink/90">{children}</div>
    </motion.div>
  );
}

/** What the account and the plan unlock, shown but out of reach. */
function LockedPreview({ idea }: { idea: FoundIdea }) {
  const promptLines = [
    `Construis « ${idea.title} », une application web pour : ${idea.target.toLowerCase()}.`,
    `Le problème à régler : ${idea.problem}`,
    "Fonctionnalités de la première version :",
    ...idea.mvp.map((feature, i) => `${i + 1}. ${feature}`),
    "Stack : Next.js, Supabase pour les comptes, Stripe pour l'abonnement.",
    "Commence par la page d'accueil, puis l'inscription, puis le paiement.",
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.75, ease: EASE }}
      className="mt-6"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Ce qui t&apos;attend ensuite</p>
      <div className="relative mt-3 overflow-hidden rounded-[18px] border border-ink/10 bg-black/40">
        <div className="flex items-center justify-between border-b border-ink/8 px-4 py-2.5">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">Ton prompt de build</span>
          <Lock className="size-3.5 text-ink-faint" />
        </div>
        <pre className="whitespace-pre-wrap px-4 pb-4 pt-3 font-mono text-[12px] leading-relaxed text-ink/85">
          {promptLines[0]}
          {"\n"}
          <span className="select-none blur-[5px]" aria-hidden>
            {promptLines.slice(1).join("\n")}
          </span>
        </pre>
        <div className="absolute inset-x-0 bottom-0 flex h-24 items-end justify-center bg-gradient-to-t from-canvas via-canvas/80 to-transparent pb-4">
          <span className="flex items-center gap-2 rounded-full border border-ink/12 bg-canvas/90 px-3.5 py-1.5 font-body text-[12.5px] text-ink-muted">
            <Lock className="size-3.5" />
            Prêt à coller dans Claude, Replit ou Lovable
          </span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {["2 autres idées sur mesure", "Ta checklist de lancement et ton plan marketing"].map((label) => (
          <div key={label} className="flex items-start gap-2.5 rounded-[16px] border border-ink/8 bg-ink/[0.02] p-4">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-ink-faint" />
            <span className="font-body text-[13px] leading-snug text-ink-muted">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
