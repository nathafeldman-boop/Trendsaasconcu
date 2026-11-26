"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Fingerprint } from "lucide-react";
import { StepShell } from "@/components/onboarding/step-shell";
import type { ShellProps } from "@/components/onboarding/funnel-screens";
import type { Answers } from "@/components/onboarding/funnel";
import { readFoundIdea } from "@/lib/onboarding/found-idea";

// Right before the plans: they read what they commit to, then hold their
// finger on the print until the ring fills. Letting go early resets it.

const HOLD_MS = 1800;
const RING = 2 * Math.PI * 62;

const DEADLINES: Record<string, string> = {
  aujourdhui: "aujourd'hui",
  semaine: "cette semaine",
  mois: "dans le mois",
  "3mois": "d'ici 3 mois",
};

export function CommitScreen({ shell, answers, onNext }: { shell: ShellProps; answers: Answers; onNext: () => void }) {
  const idea = readFoundIdea(answers);
  const goal = Number(answers.revenueGoal) || null;
  const deadline = DEADLINES[String(answers.deadline ?? "")];

  const promises = [
    `Je lance ${idea ? idea.title : "mon SaaS"}, même si je n'ai jamais codé.`,
    deadline ? `Je vise ma première vente ${deadline}.` : "Je vise ma première vente le plus vite possible.",
    goal ? `Je travaille chaque jour pour atteindre ${goal.toLocaleString("fr-FR")} € par mois.` : "Je travaille un peu chaque jour sur mon business.",
  ];

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const start = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current);
  }, []);

  function tick(now: number) {
    if (start.current === null) return;
    const p = Math.min(1, (now - start.current) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      start.current = null;
      setDone(true);
      navigator.vibrate?.([30, 40, 60]);
      window.setTimeout(onNext, 900);
      return;
    }
    frame.current = requestAnimationFrame(tick);
  }

  function press(e: React.PointerEvent) {
    if (done) return;
    e.preventDefault();
    navigator.vibrate?.(15);
    start.current = performance.now();
    frame.current = requestAnimationFrame(tick);
  }

  function release() {
    if (done || start.current === null) return;
    start.current = null;
    if (frame.current) cancelAnimationFrame(frame.current);
    setProgress(0);
  }

  return (
    <StepShell {...shell} eyebrow="Ton engagement" title="Engage-toi envers toi-même.">
      <ul className="-mt-2 flex flex-col gap-2">
        {promises.map((text, i) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
            className="glass-panel flex items-start gap-3 rounded-[14px] px-4 py-2.5"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-canvas">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span className="font-body text-[15px] leading-snug text-ink">{text}</span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col items-center">
        <p className="mb-3 font-body text-[14px] text-ink-muted">
          {done ? "C'est signé. On y va." : progress > 0 ? "Continue d'appuyer…" : "Maintiens ton doigt sur l'empreinte pour t'engager"}
        </p>
        <button
          type="button"
          aria-label="Maintiens pour t'engager"
          onPointerDown={press}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onContextMenu={(e) => e.preventDefault()}
          className="relative flex size-32 touch-none select-none items-center justify-center rounded-full [-webkit-touch-callout:none]"
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 136 136" aria-hidden>
            <circle cx="68" cy="68" r="62" fill="none" strokeWidth="5" className="stroke-ink/10" />
            <circle
              cx="68"
              cy="68"
              r="62"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              className="stroke-accent"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - progress)}
            />
          </svg>
          <motion.span
            animate={done ? { scale: [1, 1.15, 1] } : progress > 0 ? { scale: 0.94 } : { scale: [1, 1.04, 1] }}
            transition={done || progress > 0 ? { duration: 0.35 } : { duration: 1.8, repeat: Infinity }}
            className={`flex size-[88px] items-center justify-center rounded-full ${done ? "bg-accent text-canvas" : "bg-accent/10 text-accent"}`}
          >
            {done ? <Check className="size-12" strokeWidth={3} /> : <Fingerprint className="size-12" strokeWidth={1.5} />}
          </motion.span>
        </button>
      </div>
    </StepShell>
  );
}
