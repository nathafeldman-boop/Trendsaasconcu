"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, PenLine, Sparkles } from "lucide-react";
import { StepShell } from "@/components/onboarding/step-shell";
import { ChoiceOption } from "@/components/onboarding/choice-option";
import { ScaleQuestion } from "@/components/onboarding/scale-question";
import { CommitmentHold } from "@/components/onboarding/commitment-hold";
import { Illustration, RecurringRevenue } from "@/components/onboarding/illustrations";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { CountUp } from "@/components/ui/count-up";
import {
  JOURNEY,
  LEVERS,
  LOADING_STEPS,
  REFERENCE_PRICE,
  projection,
  revenueTier,
  type Answers,
  type Option,
  type Step,
} from "@/components/onboarding/funnel";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FREE_ID = "autre";

export type ShellProps = { step: number; total: number; onBack?: () => void };

type ScreenProps<T extends Step["type"]> = {
  shell: ShellProps;
  step: Extract<Step, { type: T }>;
  answers: Answers;
  onAnswer: (patch: Answers) => Answers;
  onNext: (answers?: Answers) => void;
};

function euros(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} €`;
}

function ContinueButton({ onClick, disabled, children = "Continuer" }: { onClick: () => void; disabled?: boolean; children?: React.ReactNode }) {
  return (
    <Button showArrow={false} disabled={disabled} onClick={onClick} className="w-full">
      {children}
    </Button>
  );
}

/** The personalised answer to a choice, sliding in under the options. */
function NoteCallout({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="glass-panel flex gap-3 rounded-[16px] p-4"
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <Sparkles className="size-3.5" strokeWidth={2} />
      </span>
      <p className="font-body text-[14px] leading-relaxed text-ink">{text}</p>
    </motion.div>
  );
}

function optionIcon(option: Option) {
  if (option.brand) return <BrandLogo brand={option.brand} className="size-5" />;
  if (option.icon) return <option.icon className="size-5" strokeWidth={1.75} />;
  return undefined;
}

export function SingleScreen({ shell, step, answers, onAnswer, onNext }: ScreenProps<"single">) {
  const picked = answers[step.id] as string | undefined;
  const [freeDraft, setFreeDraft] = useState(String(answers[`${step.id}_libre`] ?? ""));
  const [waiting, setWaiting] = useState(false);
  const pickedOption = step.options.find((o) => o.id === picked);

  function choose(option: Option) {
    const next = onAnswer({ [step.id]: option.id });
    if (step.notesVisible || option.note || step.afterChoice) {
      setWaiting(true);
      return;
    }
    setTimeout(() => onNext(next), 260);
  }

  const note = pickedOption?.note ?? (picked && picked !== FREE_ID ? step.afterChoice : undefined);
  const showFooter = waiting || step.notesVisible || picked === FREE_ID;

  return (
    <StepShell
      {...shell}
      eyebrow={step.kicker}
      title={step.title}
      subtitle={step.help}
      footer={
        showFooter ? (
          <ContinueButton
            disabled={!picked || (picked === FREE_ID && !freeDraft.trim())}
            onClick={() => onNext(picked === FREE_ID ? onAnswer({ [`${step.id}_libre`]: freeDraft.trim() }) : undefined)}
          />
        ) : null
      }
    >
      <div className={step.grid ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
        {step.options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
          >
            <ChoiceOption
              label={option.label}
              detail={option.detail}
              icon={optionIcon(option)}
              layout={step.grid ? "tile" : "row"}
              selected={picked === option.id}
              onClick={() => choose(option)}
            />
            {step.notesVisible && option.note ? (
              <p className="mt-2 px-1 font-body text-[13px] leading-relaxed text-ink-muted">{option.note}</p>
            ) : null}
          </motion.div>
        ))}
        {step.free ? (
          <ChoiceOption
            label="Autre chose"
            detail="je l'écris avec mes mots"
            icon={<PenLine className="size-5" strokeWidth={1.75} />}
            selected={picked === FREE_ID}
            onClick={() => {
              onAnswer({ [step.id]: FREE_ID });
              setWaiting(true);
            }}
          />
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {picked === FREE_ID && step.free ? (
          <motion.textarea
            key="free"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            value={freeDraft}
            onChange={(e) => setFreeDraft(e.target.value)}
            rows={3}
            autoFocus
            placeholder={step.free.placeholder}
            className="mt-4 w-full rounded-[16px] border border-ink/12 bg-ink/[0.03] p-4 font-body text-[15px] text-ink outline-none transition-colors focus:border-accent/60"
          />
        ) : note && !step.notesVisible ? (
          <div key={note} className="mt-5">
            <NoteCallout text={note} />
          </div>
        ) : null}
      </AnimatePresence>
    </StepShell>
  );
}

export function MultiScreen({ shell, step, answers, onAnswer, onNext }: ScreenProps<"multi">) {
  const selected = (answers[step.id] as string[] | undefined) ?? [];
  const [freeDraft, setFreeDraft] = useState(String(answers[`${step.id}_libre`] ?? ""));
  const freeOn = selected.includes(FREE_ID);

  function toggle(id: string) {
    onAnswer({ [step.id]: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] });
  }

  const notes = step.options.filter((o) => selected.includes(o.id) && o.note);

  return (
    <StepShell
      {...shell}
      eyebrow={step.kicker}
      title={step.title}
      subtitle={step.help}
      footer={
        <ContinueButton
          disabled={selected.length === 0 || (freeOn && selected.length === 1 && !freeDraft.trim())}
          onClick={() => onNext(onAnswer({ [`${step.id}_libre`]: freeOn ? freeDraft.trim() : "" }))}
        />
      }
    >
      <div className="flex flex-col gap-3">
        {step.options.map((option, index) => (
          <motion.div key={option.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}>
            <ChoiceOption
              variant="multi"
              label={option.label}
              detail={option.detail}
              icon={optionIcon(option)}
              selected={selected.includes(option.id)}
              onClick={() => toggle(option.id)}
            />
          </motion.div>
        ))}
        {step.free ? (
          <ChoiceOption
            variant="multi"
            label="Autre chose"
            detail="je l'écris avec mes mots"
            icon={<PenLine className="size-5" strokeWidth={1.75} />}
            selected={freeOn}
            onClick={() => toggle(FREE_ID)}
          />
        ) : null}
      </div>
      {freeOn && step.free ? (
        <motion.textarea
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          value={freeDraft}
          onChange={(e) => setFreeDraft(e.target.value)}
          rows={3}
          placeholder={step.free.placeholder}
          className="mt-4 w-full rounded-[16px] border border-ink/12 bg-ink/[0.03] p-4 font-body text-[15px] text-ink outline-none transition-colors focus:border-accent/60"
        />
      ) : null}
      <div className="mt-5 flex flex-col gap-3">
        <AnimatePresence>
          {notes.map((option) => (
            <NoteCallout key={option.id} text={option.note!} />
          ))}
        </AnimatePresence>
      </div>
    </StepShell>
  );
}

export function ScaleScreen({ shell, step, answers, onAnswer, onNext }: ScreenProps<"scale">) {
  return (
    <StepShell {...shell} eyebrow={step.kicker} title={step.title} subtitle={step.help}>
      <ScaleQuestion
        value={(answers[step.id] as number | undefined) ?? null}
        onSelect={(value) => {
          const next = onAnswer({ [step.id]: value });
          setTimeout(() => onNext(next), 280);
        }}
      />
    </StepShell>
  );
}

export function SliderScreen({ shell, step, answers, onAnswer, onNext }: ScreenProps<"slider">) {
  const value = Number(answers[step.id] ?? step.initial);
  const tier = revenueTier(value);
  const percent = ((value - step.min) / (step.max - step.min)) * 100;
  return (
    <StepShell
      {...shell}
      eyebrow={step.kicker}
      title={step.title}
      subtitle={step.help}
      footer={<ContinueButton onClick={() => onNext(onAnswer({ [step.id]: value }))} />}
    >
      <div className="glass-panel rounded-[22px] p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-[40px] font-medium tracking-[-0.04em] text-ink tabular-nums">{euros(value)}</p>
          <AnimatePresence mode="wait">
            <motion.span
              key={tier.word}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent"
            >
              {tier.word}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="font-body text-[13px] text-ink-faint">par mois</p>

        <div className="relative mt-7">
          <div className="h-2 rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-accent shadow-[0_0_14px_var(--color-accent)]" style={{ width: `${percent}%` }} />
          </div>
          <input
            type="range"
            min={step.min}
            max={step.max}
            step={step.stepBy}
            value={value}
            onChange={(e) => onAnswer({ [step.id]: Number(e.target.value) })}
            aria-label={step.title}
            className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-canvas shadow-[0_0_14px_var(--color-accent)]"
            style={{ left: `${percent}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          <span>{euros(step.min)}</span>
          <span>{euros(step.max)}</span>
        </div>

        <div className="mt-6 h-px bg-ink/10" />
        <p className="mt-5 font-body text-[14px] leading-relaxed text-ink-muted">
          À {REFERENCE_PRICE} € par mois et par client, ça fait{" "}
          <span className="font-medium text-accent">{Math.ceil(value / REFERENCE_PRICE)} clients</span> à trouver.
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={tier.word}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-3 font-body text-[13px] leading-relaxed text-ink-faint"
          >
            {tier.note}
          </motion.p>
        </AnimatePresence>
      </div>
    </StepShell>
  );
}

export function TextScreen({ shell, step, answers, onAnswer, onNext }: ScreenProps<"text">) {
  const [draft, setDraft] = useState(String(answers[step.id] ?? ""));
  return (
    <StepShell
      {...shell}
      eyebrow={step.kicker}
      title={step.title}
      subtitle={step.help}
      footer={
        <div className="flex items-center gap-4">
          <Button showArrow={false} disabled={!step.optional && !draft.trim()} onClick={() => onNext(onAnswer({ [step.id]: draft.trim() }))}>
            Valider
          </Button>
          {step.optional ? (
            <button type="button" onClick={() => onNext()} className="font-body text-[13px] text-ink-faint underline underline-offset-2 hover:text-ink-muted">
              Passer cette étape
            </button>
          ) : null}
        </div>
      }
    >
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        placeholder={step.placeholder}
        className="w-full rounded-[16px] border border-ink/12 bg-ink/[0.03] p-4 font-body text-[15px] text-ink outline-none transition-colors focus:border-accent/60"
      />
    </StepShell>
  );
}

export function UrlScreen({ shell, step, answers, onAnswer, onNext }: ScreenProps<"url">) {
  const [draft, setDraft] = useState(String(answers[step.id] ?? ""));
  return (
    <StepShell
      {...shell}
      eyebrow={step.kicker}
      title={step.title}
      subtitle={step.help}
      footer={<ContinueButton disabled={!draft.trim()} onClick={() => onNext(onAnswer({ [step.id]: draft.trim() }))} />}
    >
      <input
        type="text"
        inputMode="url"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={step.placeholder}
        className="h-[56px] w-full rounded-[16px] border border-ink/12 bg-ink/[0.03] px-4 font-body text-[16px] text-ink outline-none transition-colors focus:border-accent/60"
      />
    </StepShell>
  );
}

export function MessageScreen({ shell, step, onNext }: Pick<ScreenProps<"message">, "shell" | "step" | "onNext">) {
  return (
    <StepShell {...shell} center eyebrow={step.kicker} title={step.title} subtitle={step.sub} footer={<ContinueButton onClick={() => onNext()}>{step.cta}</ContinueButton>}>
      {step.illustration ? (
        <div className="flex justify-center">
          <Illustration id={step.illustration} className="size-32" />
        </div>
      ) : null}
    </StepShell>
  );
}

export function Saas101Screen({ shell, onNext }: { shell: ShellProps; onNext: () => void }) {
  return (
    <StepShell
      {...shell}
      eyebrow="En trente secondes"
      title="Un SaaS, c'est quoi ?"
      subtitle="Un site qui t'appartient, que tu construis avec l'IA, et sur lequel des gens paient un abonnement pour utiliser ton service. Tu le construis une fois, il encaisse chaque mois."
      footer={<ContinueButton onClick={onNext}>Compris</ContinueButton>}
    >
      <RecurringRevenue />
      <div className="glass-panel mt-4 flex gap-4 rounded-[16px] p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent/40 font-mono text-sm text-accent">€</span>
        <p className="font-body text-[14px] leading-relaxed text-ink-muted">
          Un abonnement à {REFERENCE_PRICE} € rapporte {REFERENCE_PRICE} € <span className="text-ink">chaque mois</span>. Avec 60 clients, tu
          dépasses 2 900 € par mois.
        </p>
      </div>
    </StepShell>
  );
}

const ANALYSIS_ITEMS = ["Vérification du site", "Lecture de ta proposition de valeur", "Repérage des pistes marketing"];

export function AnalysisScreen({ shell, answers, onNext }: { shell: ShellProps; answers: Answers; onNext: () => void }) {
  return (
    <StepShell
      {...shell}
      eyebrow="Analyse en cours"
      title="On regarde ton site de plus près."
      subtitle={answers.siteUrl ? String(answers.siteUrl) : undefined}
      footer={<ContinueButton onClick={onNext} />}
    >
      <div className="flex flex-col gap-3">
        {ANALYSIS_ITEMS.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.45, duration: 0.4 }}
            className="glass-panel flex items-center gap-3 rounded-[16px] px-4 py-3"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + index * 0.45, type: "spring", stiffness: 400, damping: 20 }}
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-canvas"
            >
              <Check className="size-3" strokeWidth={3} />
            </motion.span>
            <span className="font-body text-[14px] text-ink">{item}</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-5 font-body text-[14px] leading-relaxed text-ink-muted">L&apos;analyse détaillée t&apos;attend dans ton espace.</p>
    </StepShell>
  );
}

const RING = 2 * Math.PI * 54;

export function LoadingScreen({ shell, answers, onAnswer, onNext }: Omit<ScreenProps<"loading">, "step">) {
  const [progress, setProgress] = useState(0);
  const [lever, setLever] = useState<number | null>(null);
  const progressRef = useRef(0);
  const doneTimer = useRef<number | undefined>(undefined);
  const asked = useRef<Set<number>>(new Set());
  // Read at the end of the ring: the latest answers (lever choices) and
  // callback, without restarting the timers every render.
  const latest = useRef({ answers, onNext });

  useEffect(() => {
    latest.current = { answers, onNext };
  }, [answers, onNext]);

  useEffect(() => {
    if (lever !== null) return;
    const thresholds = [35, 70];
    const id = window.setInterval(() => {
      const current = progressRef.current;
      const next = Math.min(100, current + 0.9);
      // Pause on each lever question as the ring passes its threshold.
      const stop = thresholds.findIndex((t, i) => current < t && next >= t && !asked.current.has(i));
      if (stop !== -1) {
        asked.current.add(stop);
        progressRef.current = thresholds[stop];
        setProgress(thresholds[stop]);
        setLever(stop);
        return;
      }
      progressRef.current = next;
      setProgress(next);
      if (next >= 100) {
        window.clearInterval(id);
        doneTimer.current = window.setTimeout(() => latest.current.onNext(latest.current.answers), 700);
      }
    }, 60);
    return () => window.clearInterval(id);
  }, [lever]);

  // Going back mid-countdown must not fire the jump forward afterwards.
  useEffect(() => () => window.clearTimeout(doneTimer.current), []);

  const doneSteps = Math.floor((progress / 100) * LOADING_STEPS.length);

  return (
    <StepShell {...shell} center eyebrow="Calcul en cours" title="On assemble ta projection." subtitle="Encore deux questions pendant que ça tourne.">
      <div className="flex flex-col items-center">
        <div className="relative size-40">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="5" className="text-ink/8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - progress / 100)}
              style={{ filter: "drop-shadow(0 0 8px var(--color-accent))" }}
            />
          </svg>
          <p className="absolute inset-0 flex items-center justify-center font-display text-[40px] font-medium tracking-[-0.04em] text-ink tabular-nums">
            {Math.round(progress)}
            <span className="text-[20px] text-ink-faint">%</span>
          </p>
        </div>

        <ol className="mt-8 flex w-full max-w-sm flex-col gap-2.5 text-left">
          {LOADING_STEPS.map((label, index) => {
            const done = index < doneSteps;
            return (
              <li key={label} className={`flex items-center gap-3 font-body text-[14px] transition-colors ${done ? "text-ink" : "text-ink-faint"}`}>
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    done ? "border-accent bg-accent text-canvas shadow-[0_0_10px_var(--color-accent)]" : "border-ink/20"
                  }`}
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      </div>

      <AnimatePresence>
        {lever !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-5 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ y: 40, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-sm rounded-[24px] border border-white/10 bg-canvas-raised p-6 text-left shadow-[0_40px_100px_-30px_rgba(0,0,0,1),0_0_60px_-30px_var(--color-accent)]"
            >
              <p className="font-display text-[20px] font-medium leading-snug text-ink">{LEVERS[lever].question}</p>
              <p className="mt-2 font-body text-[14px] leading-relaxed text-ink-muted">{LEVERS[lever].detail}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {(["non", "oui"] as const).map((choice) => (
                  <Button
                    key={choice}
                    showArrow={false}
                    variant={choice === "oui" ? "primary" : "secondary"}
                    onClick={() => {
                      onAnswer({ [`lever_${LEVERS[lever].id}`]: choice });
                      setLever(null);
                    }}
                  >
                    {choice === "oui" ? "Oui" : "Non"}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </StepShell>
  );
}

const SEGMENT_COLORS = ["bg-accent", "bg-white/70", "bg-accent-deep"];

export function ProjectionScreen({ shell, answers, onNext }: { shell: ShellProps; answers: Answers; onNext: () => void }) {
  const { sources, low, high, customers, goal } = projection(answers);
  const total = sources.reduce((n, s) => n + (s.low + s.high) / 2, 0) || 1;
  return (
    <StepShell {...shell} eyebrow="Ta projection" title="Voilà ce que ton SaaS pourrait rapporter." footer={<ContinueButton onClick={onNext} />}>
      <div className="glass-panel relative overflow-hidden rounded-[24px] p-6">
        <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-accent/15 blur-[60px]" />
        <p className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Ton potentiel</p>
        <p className="relative mt-2 font-display text-[36px] font-medium leading-tight tracking-[-0.04em] text-ink sm:text-[42px]">
          <CountUp value={low} format={(n) => euros(n)} /> <span className="font-serif text-[0.8em] italic text-ink-faint">à</span>{" "}
          <span className="text-accent">
            <CountUp value={high} format={(n) => euros(n)} />
          </span>
        </p>
        <p className="relative font-body text-[13px] text-ink-faint">par mois</p>

        <div className="relative mt-6 flex h-2.5 gap-1 overflow-hidden rounded-full">
          {sources.map((source, index) => (
            <motion.span
              key={source.label}
              initial={{ flexGrow: 0 }}
              animate={{ flexGrow: (source.low + source.high) / 2 / total }}
              transition={{ duration: 0.9, delay: 0.3 + index * 0.15, ease: EASE }}
              className={`h-full rounded-full ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`}
              style={{ flexBasis: 0 }}
            />
          ))}
        </div>

        <div className="relative mt-6 grid grid-cols-3 gap-3 border-t border-ink/10 pt-5">
          <div>
            <p className="font-display text-xl font-medium text-ink">{customers}</p>
            <p className="font-body text-[12px] text-ink-faint">clients</p>
          </div>
          <div>
            <p className="font-display text-xl font-medium text-ink">{REFERENCE_PRICE} €</p>
            <p className="font-body text-[12px] text-ink-faint">par mois</p>
          </div>
          <div>
            <p className="font-display text-xl font-medium text-accent">{euros(goal)}</p>
            <p className="font-body text-[12px] text-ink-faint">ton objectif</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {sources.map((source, index) => (
          <div key={source.label} className="flex items-center gap-3 rounded-[14px] border border-ink/8 bg-ink/[0.02] px-4 py-3">
            <span className={`size-2.5 rounded-full ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`} />
            <span className="flex-1 font-body text-[14px] text-ink">{source.label}</span>
            <span className="font-mono text-[12px] text-ink-muted">
              {euros(source.low)} – {euros(source.high)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 font-body text-[12px] leading-relaxed text-ink-faint">
        Scénario, pas une promesse : calculé à partir de tes réponses, pour un abonnement à {REFERENCE_PRICE} € par mois.
      </p>
    </StepShell>
  );
}

export function BarrierScreen({ shell, onNext }: { shell: ShellProps; onNext: () => void }) {
  return (
    <StepShell
      {...shell}
      center
      eyebrow="Ce qui te bloque"
      title={
        <>
          Il te manque la méthode,{" "}
          <span className="font-serif italic tracking-normal text-accent">et les outils clé en main.</span>
        </>
      }
      subtitle="Bonne nouvelle : c'est exactement ce que SaaSFounder te donne."
      footer={<ContinueButton onClick={onNext} />}
    >
      <div className="flex justify-center">
        <Illustration id="rocket" className="size-32" />
      </div>
    </StepShell>
  );
}

export function AccountScreen({ shell, onDone }: { shell: ShellProps; onDone: () => void }) {
  return (
    <StepShell
      {...shell}
      eyebrow="Ton dossier"
      title="Crée ton compte pour garder tout ça."
      subtitle="Tes réponses et ta projection restent liées à ton compte : tu retrouves tout quand tu reviens."
    >
      <SignupForm onSuccess={onDone} />
      <p className="mt-5 text-center font-body text-[13px] text-ink-faint">
        Déjà un compte ?{" "}
        <Link href="/connexion?next=/commencer" className="text-ink-muted underline underline-offset-2 hover:text-ink">
          Se connecter
        </Link>
      </p>
    </StepShell>
  );
}

export function ObjectiveScreen({ shell, answers, onNext }: { shell: ShellProps; answers: Answers; onNext: () => void }) {
  const phrase = String(answers.phrase ?? "").trim();
  return (
    <StepShell
      {...shell}
      center
      eyebrow="Ton cap"
      title={
        <>
          C&apos;est un cap réaliste.{" "}
          <span className="font-serif italic tracking-normal text-accent">Et on va l&apos;atteindre avec toi.</span>
        </>
      }
      footer={<ContinueButton onClick={onNext} />}
    >
      <div className="flex flex-col items-center gap-6">
        <Illustration id="target" className="size-28" />
        {phrase ? (
          <motion.blockquote
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="glass-panel rounded-[20px] px-6 py-5 font-serif text-[20px] italic leading-snug text-ink"
          >
            « {phrase} »
          </motion.blockquote>
        ) : null}
      </div>
    </StepShell>
  );
}

export function JourneyScreen({ shell, firstName, onNext }: { shell: ShellProps; firstName: string | null; onNext: () => void }) {
  return (
    <StepShell
      {...shell}
      eyebrow="Ce qu'on fait maintenant"
      title={
        <>
          {firstName ? `${firstName}, voilà` : "Voilà"} comment on t&apos;amène{" "}
          <span className="font-serif italic tracking-normal text-accent">à tes premiers revenus.</span>
        </>
      }
      footer={<ContinueButton onClick={onNext} />}
    >
      <ol className="relative flex flex-col gap-5">
        <motion.span
          aria-hidden
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          className="absolute bottom-6 left-[19px] top-6 w-px origin-top bg-gradient-to-b from-accent via-accent/40 to-transparent"
        />
        {JOURNEY.map((item, index) => (
          <motion.li
            key={item.num}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.3 + index * 0.25, ease: EASE }}
            className="relative flex gap-4"
          >
            <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-canvas font-mono text-[13px] text-accent shadow-[0_0_16px_-4px_var(--color-accent)]">
              {item.num}
            </span>
            <div className="glass-panel flex-1 rounded-[16px] p-4">
              <p className="font-display text-[16px] font-medium text-ink">{item.title}</p>
              <p className="mt-1 font-body text-[13px] leading-relaxed text-ink-muted">{item.body}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </StepShell>
  );
}

export function CommitmentScreen({ shell, onNext }: { shell: ShellProps; onNext: () => void }) {
  return (
    <StepShell
      {...shell}
      center
      eyebrow="Ta promesse"
      title={
        <>
          Avant d&apos;aller plus loin,{" "}
          <span className="font-serif italic tracking-normal text-accent">fais-toi une promesse.</span>
        </>
      }
    >
      <blockquote className="mx-auto max-w-md font-serif text-[20px] italic leading-relaxed text-ink-muted">
        « Je m&apos;engage à aller au bout de ce projet. À avancer même les jours où j&apos;ai moins envie. Et à me donner une
        vraie chance de réussir. »
      </blockquote>
      <div className="mt-10 flex justify-center">
        <CommitmentHold onCommit={onNext} />
      </div>
    </StepShell>
  );
}

const HOURS_LABEL: Record<string, string> = { low: "moins de 5 h / semaine", mid: "5 à 15 h / semaine", high: "plus de 15 h / semaine" };
const DEADLINE_LABEL: Record<string, string> = { asap: "le plus vite possible", "2sem": "2 semaines", "1mois": "1 mois", "3mois": "3 mois" };

export function PlansScreen({ shell, answers, signedIn }: { shell: ShellProps; answers: Answers; signedIn: boolean }) {
  const recap = [
    { label: "Objectif", value: `${Math.round(Number(answers.revenueGoal ?? 3000)).toLocaleString("fr-FR")} € / mois` },
    { label: "Ton temps", value: HOURS_LABEL[String(answers.hours)] ?? "—" },
    { label: "Échéance", value: DEADLINE_LABEL[String(answers.deadline)] ?? "—" },
  ];
  return (
    <StepShell
      {...shell}
      eyebrow="Ton plan est prêt"
      title={
        <>
          Il ne reste qu&apos;une étape :{" "}
          <span className="font-serif italic tracking-normal text-accent">choisis ta formule.</span>
        </>
      }
      subtitle="Ton idée, ton prompt de build et ton plan marketing se débloquent dès le paiement. Résiliable à tout moment."
    >
      <div className="glass-panel mb-8 grid grid-cols-3 divide-x divide-ink/10 rounded-[18px]">
        {recap.map((item) => (
          <div key={item.label} className="px-3 py-4 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{item.label}</p>
            <p className="mt-1 font-body text-[13px] font-medium text-ink">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="-mx-2 sm:-mx-24">
        <PricingCards isAuthenticated={signedIn} />
      </div>
      <p className="mt-6 text-center font-body text-[13px] text-ink-faint">
        <Link href="/acces" className="underline underline-offset-2 hover:text-ink-muted">
          J&apos;ai un code d&apos;accès
        </Link>
      </p>
    </StepShell>
  );
}
