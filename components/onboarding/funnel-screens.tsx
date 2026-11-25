"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, PenLine, Sparkles } from "lucide-react";
import { StepShell } from "@/components/onboarding/step-shell";
import { ChoiceOption } from "@/components/onboarding/choice-option";
import { ScaleQuestion } from "@/components/onboarding/scale-question";
import { Illustration, RecurringRevenue } from "@/components/onboarding/illustrations";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  LEVERS,
  LOADING_STEPS,
  REFERENCE_PRICE,
  revenueTier,
  type Answers,
  type Option,
  type Step,
} from "@/components/onboarding/funnel";
import { readFoundIdea } from "@/lib/onboarding/found-idea";
import { requestIdea } from "@/lib/onboarding/idea-request";

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
          // Full width under a grid of tiles, like the other rows elsewhere.
          <div className={step.grid ? "col-span-2" : undefined}>
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
          </div>
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
  // The idea validated before the account sets the price per customer.
  const idea = readFoundIdea(answers);
  const price = idea?.price_per_month ?? REFERENCE_PRICE;
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
          {idea ? `Avec ${idea.title} à ${price} € par mois et par client` : `À ${price} € par mois et par client`}, ça fait{" "}
          <span className="font-medium text-accent">{Math.ceil(value / price)} clients</span> à trouver.
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

  // Start looking for their idea now: it's ready when the ring ends.
  useEffect(() => {
    void requestIdea(latest.current.answers);
  }, []);

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

export function AccountScreen({ shell, answers, onDone }: { shell: ShellProps; answers: Answers; onDone: () => void }) {
  const idea = readFoundIdea(answers);
  return (
    <StepShell
      {...shell}
      eyebrow="Tes résultats sont prêts"
      title={
        <>
          Entre ton email <span className="font-serif italic tracking-normal text-accent">pour débloquer tes résultats.</span>
        </>
      }
      subtitle={
        idea
          ? "Ton idée, ta projection et ton plan t'attendent juste après."
          : "Ton idée, ta projection et ton plan t'attendent juste après, et restent dans ton espace."
      }
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

export function PlansScreen({ shell, answers }: { shell: ShellProps; answers: Answers }) {
  const idea = readFoundIdea(answers);
  const goal = Number(answers.revenueGoal) || null;
  return (
    <StepShell
      {...shell}
      eyebrow="Dernière étape"
      title={
        <>
          Débloque <span className="font-serif italic tracking-normal text-accent">{idea ? idea.title : "ton SaaS"}.</span>
        </>
      }
    >
      <PricingCards goal={goal} />
      <p className="mt-6 text-center font-body text-[13px] text-ink-faint">
        <Link href="/acces" className="underline underline-offset-2 hover:text-ink-muted">
          J&apos;ai un code d&apos;accès
        </Link>
      </p>
    </StepShell>
  );
}
