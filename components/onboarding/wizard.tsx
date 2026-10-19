"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import { STEPS, getSequence, type Answers, type Step } from "@/components/onboarding/funnel";
import {
  AccountScreen,
  AnalysisScreen,
  BarrierScreen,
  CommitmentScreen,
  JourneyScreen,
  LoadingScreen,
  MessageScreen,
  MultiScreen,
  ObjectiveScreen,
  PlansScreen,
  ProjectionScreen,
  Saas101Screen,
  ScaleScreen,
  SingleScreen,
  SliderScreen,
  TextScreen,
  UrlScreen,
} from "@/components/onboarding/funnel-screens";

// v2: the funnel was rebuilt (different questions and order), so answers and
// positions saved by the previous version are deliberately not reused.
const STORAGE_KEY = "saasfounder-onboarding-v2";

function readStoredState(): { stepId: string; answers: Answers } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { stepId?: string; answers?: Answers };
      return { stepId: saved.stepId ?? STEPS[0].id, answers: saved.answers ?? {} };
    }
  } catch {
    // ignore corrupted local storage
  }
  return { stepId: STEPS[0].id, answers: {} };
}

/** Steps actually shown: conditions met, and no signup step once signed in. */
function visibleSteps(answers: Answers, signedIn: boolean | null) {
  return getSequence(answers).filter((s) => !(s.type === "account" && signedIn));
}

/**
 * Where `stepId` sits in the visible sequence. A step that's no longer
 * visible (the signup step after Google brings someone back, or a branch
 * whose condition changed) resolves to the next visible step after it.
 */
function resolveIndex(stepId: string, sequence: Step[]) {
  const index = sequence.findIndex((s) => s.id === stepId);
  if (index !== -1) return index;
  const order = STEPS.findIndex((s) => s.id === stepId);
  const after = sequence.findIndex((s) => STEPS.indexOf(s) > order);
  return after === -1 ? sequence.length - 1 : after;
}

const stepTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.12, ease: "easeIn" as const } },
};

export function OnboardingWizard() {
  const [stepId, setStepId] = useState(() => readStoredState().stepId);
  const [answers, setAnswers] = useState<Answers>(() => readStoredState().answers);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  // Who's here: decides whether the signup step shows, and the name used
  // on the "voilà comment on t'amène..." screen.
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
      const meta = data.user?.user_metadata ?? {};
      const name = String(meta.first_name ?? meta.given_name ?? meta.full_name ?? meta.name ?? "").trim().split(/\s+/)[0];
      setFirstName(name || null);
    });
  }, []);

  const sequence = visibleSteps(answers, signedIn);
  const index = resolveIndex(stepId, sequence);
  const step = sequence[index];

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ stepId: step.id, answers }));
    } catch {
      // storage unavailable, continue without persistence
    }

    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("onboarding_responses")
        .upsert({ user_id: data.user.id, answers }, { onConflict: "user_id" })
        .then(() => {});
      supabase
        .from("profiles")
        .update({ current_path: `/commencer · étape ${index + 1}/${sequence.length} · ${step.id}` })
        .eq("id", data.user.id)
        .then(() => {});
    });
  }, [step.id, answers, index, sequence.length]);

  // One onboarding_step per step reached, for the drop-off chart in /admin.
  const trackedStep = useRef<string | null>(null);
  useEffect(() => {
    if (trackedStep.current === step.id) return;
    trackedStep.current = step.id;
    track("onboarding_step", { step: step.id, index, total: sequence.length });
  }, [step.id, index, sequence.length]);

  /** Merge into the answers and return the merged result, for an immediate goNext. */
  const answer = useCallback(
    (patch: Answers) => {
      setAnswers((current) => ({ ...current, ...patch }));
      return { ...answers, ...patch };
    },
    [answers]
  );

  // Moves on from the step on screen, using the answers just given: a new
  // answer can open (or close) a branch, e.g. "jamais" adds "Un SaaS, c'est quoi ?".
  const goNext = useCallback(
    (fresh?: Answers) => {
      const nextSequence = visibleSteps(fresh ?? answers, signedIn);
      const from = resolveIndex(step.id, nextSequence);
      const atCurrent = nextSequence[from]?.id === step.id;
      const target = atCurrent ? Math.min(from + 1, nextSequence.length - 1) : from;
      setStepId(nextSequence[target].id);
      window.scrollTo({ top: 0 });
    },
    [answers, signedIn, step.id]
  );

  const goBack = () => {
    setStepId(sequence[Math.max(0, index - 1)].id);
    window.scrollTo({ top: 0 });
  };

  const shell = { step: index, total: sequence.length, onBack: index > 0 ? goBack : undefined };
  const next = () => goNext();

  function renderStep() {
    switch (step.type) {
      case "single":
        return <SingleScreen key={step.id} shell={shell} step={step} answers={answers} onAnswer={answer} onNext={goNext} />;
      case "multi":
        return <MultiScreen key={step.id} shell={shell} step={step} answers={answers} onAnswer={answer} onNext={goNext} />;
      case "scale":
        return <ScaleScreen shell={shell} step={step} answers={answers} onAnswer={answer} onNext={goNext} />;
      case "slider":
        return <SliderScreen shell={shell} step={step} answers={answers} onAnswer={answer} onNext={goNext} />;
      case "text":
        return <TextScreen key={step.id} shell={shell} step={step} answers={answers} onAnswer={answer} onNext={goNext} />;
      case "url":
        return <UrlScreen key={step.id} shell={shell} step={step} answers={answers} onAnswer={answer} onNext={goNext} />;
      case "message":
        return <MessageScreen shell={shell} step={step} onNext={next} />;
      case "saas101":
        return <Saas101Screen shell={shell} onNext={next} />;
      case "analysis":
        return <AnalysisScreen shell={shell} answers={answers} onNext={next} />;
      case "loading":
        return <LoadingScreen shell={shell} answers={answers} onAnswer={answer} onNext={goNext} />;
      case "projection":
        return <ProjectionScreen shell={shell} answers={answers} onNext={next} />;
      case "barrier":
        return <BarrierScreen shell={shell} onNext={next} />;
      case "account":
        return (
          <AccountScreen
            shell={shell}
            onDone={() => {
              // Signed in now: the sequence drops this step, and resolveIndex
              // lands on the one right after it.
              setSignedIn(true);
              window.scrollTo({ top: 0 });
            }}
          />
        );
      case "objective":
        return <ObjectiveScreen shell={shell} answers={answers} onNext={next} />;
      case "journey":
        return <JourneyScreen shell={shell} firstName={firstName} onNext={next} />;
      case "commitment":
        return <CommitmentScreen shell={shell} onNext={next} />;
      case "plans":
        return <PlansScreen shell={shell} answers={answers} />;
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={step.id} {...stepTransition}>
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
