"use client";

import { useRef, useState } from "react";
import { motion, animate, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { Fingerprint, Check } from "lucide-react";

const HOLD_DURATION = 1.6;
const CIRCUMFERENCE = 2 * Math.PI * 44;

export function CommitmentHold({ onCommit }: { onCommit: () => void }) {
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  function start() {
    if (done) return;
    controlsRef.current = animate(0, 1, {
      duration: HOLD_DURATION,
      ease: "linear",
      onUpdate: setProgress,
      onComplete: () => {
        setDone(true);
        setTimeout(onCommit, 700);
      },
    });
  }

  function cancel() {
    if (done) return;
    controlsRef.current?.stop();
    animate(progress, 0, { duration: 0.3, onUpdate: setProgress });
  }

  if (reduceMotion) {
    return (
      <button type="button" onClick={onCommit} className="flex flex-col items-center gap-3">
        <span className="flex size-24 items-center justify-center rounded-full border-2 border-accent/60 text-accent">
          <Fingerprint className="size-9" strokeWidth={1.5} />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Appuie pour t&apos;engager
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        className="relative flex size-24 items-center justify-center rounded-full text-accent select-none touch-none"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" className="text-ink/10" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={done ? "text-success" : "text-accent"}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <motion.span animate={done ? { scale: [1, 1.15, 1] } : { y: [0, -3, 0] }} transition={done ? { duration: 0.4 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          {done ? <Check className="size-9" strokeWidth={2} /> : <Fingerprint className="size-9" strokeWidth={1.5} />}
        </motion.span>
      </button>
      <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
        {done ? "Engagement pris" : "Maintiens pour t'engager"}
      </span>
    </div>
  );
}
