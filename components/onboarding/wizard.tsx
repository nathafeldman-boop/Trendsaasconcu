"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, Repeat, Sparkles, Check } from "lucide-react";
import { StepShell } from "@/components/onboarding/step-shell";
import { ChoiceOption } from "@/components/onboarding/choice-option";
import { ScaleQuestion } from "@/components/onboarding/scale-question";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { SignupForm } from "@/components/auth/signup-form";

type Answers = {
  age: string | null;
  experience: string | null;
  skills: string | null;
  goals: string[];
  learningStyle: string | null;
  blockers: string[];
  persistence: number | null;
  hours: string | null;
  revenueGoal: number;
  budget: string | null;
  confidence: number | null;
  hasSaas: string | null;
  existingUrl: string;
  marketingHelp: string | null;
};

const EMPTY_ANSWERS: Answers = {
  age: null,
  experience: null,
  skills: null,
  goals: [],
  learningStyle: null,
  blockers: [],
  persistence: null,
  hours: null,
  revenueGoal: 3000,
  budget: null,
  confidence: null,
  hasSaas: null,
  existingUrl: "",
  marketingHelp: null,
};

const STORAGE_KEY = "saasfounder-onboarding";

const HAS_SAAS_EXISTING = "J'ai déjà un SaaS en ligne";
const HAS_SAAS_SCRATCH = "Je pars de zéro";

const BASE_SEQUENCE = [
  "age",
  "notalone",
  "experience",
  "skills",
  "goals",
  "economics",
  "learning",
  "blockers",
  "goalcount",
  "comparison",
  "persistence",
  "hours",
  "revenue",
  "recap",
  "signup",
  "budget",
  "tip",
  "confidence",
  "hassaas",
];

function getSequence(answers: Answers): string[] {
  const tail =
    answers.hasSaas === HAS_SAAS_EXISTING
      ? ["url", "analysis", "marketing-help", "closing"]
      : ["scratch-plan", "closing"];
  return [...BASE_SEQUENCE, ...tail];
}

const AGE_OPTIONS = ["Moins de 25 ans", "25 – 34 ans", "35 – 44 ans", "45 ans et plus"];
const EXPERIENCE_OPTIONS = [
  "Je n'en ai jamais fait",
  "Depuis moins d'un an",
  "Entre 1 et 3 ans",
  "Plus de 3 ans",
];
const SKILLS_OPTIONS = [
  "Aucune pour l'instant",
  "Un métier technique",
  "Un métier créatif",
  "Un métier commercial",
];
const GOAL_OPTIONS = [
  "Faire mes premiers 1 000 €",
  "Être libre financièrement",
  "Quitter mon travail",
  "Me prouver que j'en suis capable",
];
const LEARNING_OPTIONS = ["En vidéo", "En lisant", "En pratiquant directement", "Peu importe"];
const BLOCKER_OPTIONS = [
  "Le manque de méthode",
  "Je ne sais pas par où commencer",
  "J'ai peur de me lancer",
  "Je manque de temps",
];
const HOURS_OPTIONS = ["Moins de 5 h", "5 à 15 h", "Plus de 15 h"];
const BUDGET_OPTIONS = ["0 €, je pars de rien", "Moins de 100 €", "100 € à 500 €", "Plus de 500 €"];
const MARKETING_HELP_OPTIONS = ["Surtout le marketing", "Surtout le produit", "Les deux"];
const ANALYSIS_ITEMS = [
  "Vérification du site",
  "Analyse du positionnement",
  "Détection des opportunités marketing",
];

const COMPARISON_DATA = [
  {
    label: "Seul",
    value: 15,
    description: "Pas d'idée fournie, pas de plan : tu pars de zéro.",
    highlight: false,
  },
  {
    label: "Accompagnement classique",
    value: 45,
    description: "Un cadre général, souvent cher, pas pensé pour construire avec l'IA.",
    highlight: false,
  },
  {
    label: "Avec SaaSFounder",
    value: 95,
    description: "Idée, prompt et plan jour par jour déjà prêts pour toi.",
    highlight: true,
  },
];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function formatEuros(value: number) {
  return `${value.toLocaleString("fr-FR")} €`;
}

function readStoredState(): { step: number; answers: Answers } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { step: number; answers: Answers };
      return { step: saved.step ?? 0, answers: { ...EMPTY_ANSWERS, ...saved.answers } };
    }
  } catch {
    // ignore corrupted local storage
  }
  return { step: 0, answers: EMPTY_ANSWERS };
}

const stepTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.12, ease: "easeIn" as const } },
};

export function OnboardingWizard() {
  const [step, setStep] = useState(() => readStoredState().step);
  const [answers, setAnswers] = useState<Answers>(() => readStoredState().answers);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers }));
    } catch {
      // storage unavailable, continue without persistence
    }
  }, [step, answers]);

  const sequence = getSequence(answers);
  const currentId = sequence[Math.min(step, sequence.length - 1)];

  const goNext = () => setStep((s) => Math.min(sequence.length - 1, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));
  const back = step > 0 ? goBack : undefined;

  const selectAndAdvance = (
    key: "age" | "experience" | "skills" | "learningStyle" | "hours" | "budget" | "hasSaas" | "marketingHelp",
    value: string
  ) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setTimeout(goNext, 220);
  };

  function renderStep() {
    if (currentId === "age") {
      return (
        <StepShell step={step} total={sequence.length} onBack={back} eyebrow="Pour commencer" title="Tu as quel âge ?">
          <div className="flex flex-col gap-3">
            {AGE_OPTIONS.map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                selected={answers.age === option}
                onClick={() => selectAndAdvance("age", option)}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "notalone") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Tu n'es pas seul"
          title={
            <>
              <span className="text-ink">Tu n&apos;es pas seul</span>
              <br />
              <span className="text-ink-muted">à vouloir te lancer.</span>
            </>
          }
          footer={
            <Button showArrow={false} onClick={goNext} className="w-full">
              Continuer
            </Button>
          }
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Users className="size-5" strokeWidth={1.75} />
          </div>
          <p className="mt-5 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
            Chaque semaine, des gens avec les mêmes doutes que toi commencent un
            premier SaaS. Ce qui fait la différence, ce n&apos;est pas le point
            de départ — c&apos;est la méthode qu&apos;on suit.
          </p>
        </StepShell>
      );
    }

    if (currentId === "experience") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton parcours"
          title="Depuis combien de temps tu t'intéresses aux SaaS ?"
        >
          <div className="flex flex-col gap-3">
            {EXPERIENCE_OPTIONS.map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                selected={answers.experience === option}
                onClick={() => selectAndAdvance("experience", option)}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "skills") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton bagage"
          title="As-tu déjà des compétences que tu pourrais utiliser ?"
        >
          <div className="flex flex-col gap-3">
            {SKILLS_OPTIONS.map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                selected={answers.skills === option}
                onClick={() => selectAndAdvance("skills", option)}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "goals") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ce qui te fait avancer"
          title="Quel est ton objectif principal ?"
          subtitle="Plusieurs réponses possibles."
          footer={
            <Button
              showArrow={false}
              disabled={answers.goals.length === 0}
              onClick={goNext}
              className="w-full"
            >
              Continuer
            </Button>
          }
        >
          <div className="flex flex-col gap-3">
            {GOAL_OPTIONS.map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                variant="multi"
                selected={answers.goals.includes(option)}
                onClick={() => setAnswers((a) => ({ ...a, goals: toggle(a.goals, option) }))}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "economics") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="L'économie d'un SaaS"
          title="Le revenu se répète."
          footer={
            <Button showArrow={false} onClick={goNext} className="w-full">
              Continuer
            </Button>
          }
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Repeat className="size-5" strokeWidth={1.75} />
          </div>
          <p className="mt-5 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
            Vendre une fois ne rapporte qu&apos;une fois. Un abonnement, lui,
            continue de rapporter chaque mois — c&apos;est ce qui change tout
            quand on démarre de zéro.
          </p>
          <div className="mt-5 flex gap-4 rounded-lg border border-white/12 bg-white/[0.02] p-5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent/40 font-mono text-sm font-medium text-accent">
              1
            </div>
            <div>
              <p className="font-display text-[15px] font-semibold text-ink">
                Un exemple concret
              </p>
              <p className="mt-1.5 font-body text-[14px] leading-relaxed text-ink-muted">
                À 49 € par mois et par client, 60 clients suffisent pour
                dépasser 3 000 € de revenu récurrent chaque mois.
              </p>
            </div>
          </div>
        </StepShell>
      );
    }

    if (currentId === "learning") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ta méthode d'apprentissage"
          title="Comment tu préfères apprendre ?"
        >
          <div className="flex flex-col gap-3">
            {LEARNING_OPTIONS.map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                selected={answers.learningStyle === option}
                onClick={() => selectAndAdvance("learningStyle", option)}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "blockers") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ce qui bloque"
          title="Qu'est-ce qui t'empêche d'avancer ?"
          subtitle="Plusieurs réponses possibles."
          footer={
            <Button
              showArrow={false}
              disabled={answers.blockers.length === 0}
              onClick={goNext}
              className="w-full"
            >
              Continuer
            </Button>
          }
        >
          <div className="flex flex-col gap-3">
            {BLOCKER_OPTIONS.map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                variant="multi"
                selected={answers.blockers.includes(option)}
                onClick={() => setAnswers((a) => ({ ...a, blockers: toggle(a.blockers, option) }))}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "goalcount") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Notre objectif"
          title={
            <>
              <span className="text-accent">
                + <CountUp value={40000} />
              </span>
              <br />
              <span className="text-ink">personnes qu&apos;on veut aider</span>
              <br />
              <span className="text-ink-muted">à lancer leur premier SaaS.</span>
            </>
          }
          footer={
            <Button showArrow={false} onClick={goNext} className="w-full">
              Continuer
            </Button>
          }
        >
          <p className="max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
            On n&apos;en est qu&apos;au début. Ce n&apos;est pas un chiffre
            qu&apos;on a déjà atteint — c&apos;est celui qu&apos;on vise. Tu
            peux faire partie des premiers à y arriver.
          </p>
        </StepShell>
      );
    }

    if (currentId === "comparison") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="La différence"
          title="Se lancer seul, accompagné, ou avec la bonne méthode."
          subtitle="Ce que chaque approche te donne déjà, avant même que tu commences."
          footer={
            <Button showArrow={false} onClick={goNext} className="w-full">
              Continuer
            </Button>
          }
        >
          <div className="flex flex-col gap-5">
            {COMPARISON_DATA.map((row, index) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span
                    className={`flex items-center gap-1.5 font-display text-[14px] font-semibold ${
                      row.highlight ? "text-ink" : "text-ink-muted"
                    }`}
                  >
                    {row.highlight && <Sparkles className="size-3.5 text-accent" strokeWidth={2} />}
                    {row.label}
                  </span>
                  <span
                    className={`font-mono text-[13px] font-medium ${
                      row.highlight ? "text-accent" : "text-ink-faint"
                    }`}
                  >
                    {row.value}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.value}%` }}
                    transition={{ duration: 0.8, delay: 0.15 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${
                      row.highlight
                        ? "bg-accent shadow-[0_0_16px_0_var(--color-accent)]"
                        : "bg-white/25"
                    }`}
                  />
                </div>
                <p className="mt-2 font-body text-[13px] leading-relaxed text-ink-faint">
                  {row.description}
                </p>
              </div>
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "persistence") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton tempérament"
          title="Je suis du genre à persévérer même quand c'est dur."
        >
          <ScaleQuestion
            value={answers.persistence}
            onSelect={(value) => {
              setAnswers((a) => ({ ...a, persistence: value }));
              setTimeout(goNext, 220);
            }}
          />
        </StepShell>
      );
    }

    if (currentId === "hours") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton carburant"
          title="Tu peux y consacrer combien d'heures par semaine ?"
        >
          <div className="flex flex-col gap-3">
            {HOURS_OPTIONS.map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                selected={answers.hours === option}
                onClick={() => selectAndAdvance("hours", option)}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "revenue") {
      const clients = Math.ceil(answers.revenueGoal / 49);
      const tag =
        answers.revenueGoal <= 5000 ? "Accessible" : answers.revenueGoal <= 20000 ? "Ambitieux" : "Très ambitieux";
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton objectif"
          title="Combien de revenu tu veux atteindre dans 3 mois ?"
          footer={
            <Button showArrow={false} onClick={goNext} className="w-full">
              Continuer
            </Button>
          }
        >
          <div className="rounded-lg border border-white/12 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between">
              <p className="font-display text-3xl font-semibold text-ink">
                {formatEuros(answers.revenueGoal)}
              </p>
              <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                {tag}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={50000}
              step={500}
              value={answers.revenueGoal}
              onChange={(event) =>
                setAnswers((a) => ({ ...a, revenueGoal: Number(event.target.value) }))
              }
              className="accent-accent mt-6 w-full"
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              <span>1 000 € · réaliste</span>
              <span>50 000 € · ambitieux</span>
            </div>
            <div className="mt-5 h-px bg-white/10" />
            <p className="mt-5 font-body text-[14px] leading-relaxed text-ink-muted">
              À titre d&apos;exemple, à 49 € par mois et par client, ça fait{" "}
              <span className="font-medium text-ink">{clients} clients</span> à trouver.
            </p>
          </div>
        </StepShell>
      );
    }

    if (currentId === "recap") {
      const mainBlocker = answers.blockers[0] ?? "le manque de méthode";
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton profil"
          title={
            <>
              <span className="text-ink">Il te manque juste</span>
              <br />
              <span className="text-ink-muted">la méthode, pas la motivation.</span>
            </>
          }
          footer={
            <Button showArrow={false} onClick={goNext} className="w-full">
              Voir mon plan
            </Button>
          }
        >
          <div className="rounded-lg border border-white/12 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                Ton parcours
              </span>
              <span className="font-body text-[14px] font-medium text-ink">
                {answers.experience ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                Ce qui bloque
              </span>
              <span className="font-body text-[14px] font-medium text-ink">{mainBlocker}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                Ton objectif à 3 mois
              </span>
              <span className="font-body text-[14px] font-medium text-accent">
                {formatEuros(answers.revenueGoal)}
              </span>
            </div>
          </div>
        </StepShell>
      );
    }

    if (currentId === "signup") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton espace"
          title="On garde ton profil au chaud."
          subtitle="Crée ton compte pour recevoir ton idée, ton prompt et ton plan — et les retrouver quand tu en as besoin."
        >
          <SignupForm onSuccess={goNext} />
        </StepShell>
      );
    }

    if (currentId === "budget") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton budget"
          title="Combien peux-tu investir pour lancer ton SaaS ?"
        >
          <div className="flex flex-col gap-3">
            {BUDGET_OPTIONS.map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                selected={answers.budget === option}
                onClick={() => selectAndAdvance("budget", option)}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "tip") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Le conseil"
          title="Ton premier client n'a pas besoin de perfection."
          footer={
            <Button showArrow={false} onClick={goNext} className="w-full">
              Continuer
            </Button>
          }
        >
          <p className="max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
            La plupart des SaaS qui percent ont été lancés avec une version
            imparfaite. Le but du premier mois, ce n&apos;est pas d&apos;avoir
            fini — c&apos;est d&apos;avoir quelqu&apos;un qui paie.
          </p>
        </StepShell>
      );
    }

    if (currentId === "confidence") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ta confiance"
          title="Je me sens capable de mener ce projet à terme."
        >
          <ScaleQuestion
            value={answers.confidence}
            onSelect={(value) => {
              setAnswers((a) => ({ ...a, confidence: value }));
              setTimeout(goNext, 220);
            }}
          />
        </StepShell>
      );
    }

    if (currentId === "hassaas") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ta situation"
          title="As-tu déjà un SaaS en ligne, ou tu pars de zéro ?"
        >
          <div className="flex flex-col gap-3">
            {[HAS_SAAS_EXISTING, HAS_SAAS_SCRATCH].map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                selected={answers.hasSaas === option}
                onClick={() => selectAndAdvance("hasSaas", option)}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "url") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton site"
          title="Quelle est l'URL de ton SaaS ?"
          footer={
            <Button
              showArrow={false}
              disabled={!answers.existingUrl.trim()}
              onClick={goNext}
              className="w-full"
            >
              Continuer
            </Button>
          }
        >
          <input
            type="url"
            placeholder="https://tonsaas.com"
            value={answers.existingUrl}
            onChange={(event) => setAnswers((a) => ({ ...a, existingUrl: event.target.value }))}
            className="h-[52px] w-full rounded-lg border border-white/12 bg-white/[0.02] px-4 font-body text-[15px] text-ink outline-none transition-colors duration-150 focus:border-accent/60 focus:bg-white/[0.05]"
          />
        </StepShell>
      );
    }

    if (currentId === "analysis") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Analyse en cours"
          title="On regarde ton SaaS de plus près."
          footer={
            <Button showArrow={false} onClick={goNext} className="w-full">
              Continuer
            </Button>
          }
        >
          <div className="flex flex-col gap-3">
            {ANALYSIS_ITEMS.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.35, duration: 0.4 }}
                className="flex items-center gap-3 rounded-lg border border-white/12 bg-white/[0.02] px-4 py-3"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.35, type: "spring", stiffness: 400, damping: 20 }}
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-canvas"
                >
                  <Check className="size-3" strokeWidth={3} />
                </motion.span>
                <span className="font-body text-[14px] text-ink">{item}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-5 font-body text-[14px] leading-relaxed text-ink-muted">
            Le détail complet arrivera par email — ça prend quelques minutes de notre côté.
          </p>
        </StepShell>
      );
    }

    if (currentId === "marketing-help") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Priorité"
          title="Tu veux qu'on t'aide surtout sur quoi ?"
        >
          <div className="flex flex-col gap-3">
            {MARKETING_HELP_OPTIONS.map((option) => (
              <ChoiceOption
                key={option}
                label={option}
                selected={answers.marketingHelp === option}
                onClick={() => selectAndAdvance("marketingHelp", option)}
              />
            ))}
          </div>
        </StepShell>
      );
    }

    if (currentId === "scratch-plan") {
      return (
        <StepShell
          step={step}
          total={sequence.length}
          onBack={back}
          eyebrow="Ton plan"
          title="On s'occupe du site et du marketing."
          footer={
            <Button showArrow={false} onClick={goNext} className="w-full">
              Continuer
            </Button>
          }
        >
          <p className="max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
            Tu pars de zéro, donc on te fournit l&apos;idée, le prompt pour
            construire le site, et un plan marketing pour trouver tes premiers
            clients.
          </p>
        </StepShell>
      );
    }

    return (
      <StepShell
        step={step}
        total={sequence.length}
        onBack={back}
        eyebrow="C'est parti"
        title="Ton dossier est en préparation."
        footer={
          <Button href="/" showArrow={false} className="w-full">
            Retour à l&apos;accueil
          </Button>
        }
      >
        <p className="max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
          On te recontacte par email avec ton idée, ton prompt et ton plan. En
          attendant, ton compte est prêt.
        </p>
      </StepShell>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={step} {...stepTransition}>
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
