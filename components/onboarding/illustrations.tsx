"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Line illustrations for the onboarding, drawn stroke by stroke on entry
// (pathLength) and then left gently alive. Kept as inline SVG on purpose:
// no image files to load, and they inherit the accent color.

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export type IllustrationId = "star" | "bulb" | "phone" | "podium" | "target" | "rocket";

function draw(delay: number, duration = 0.9) {
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { duration, delay, ease: EASE }, opacity: { duration: 0.2, delay } },
  };
}

function Star() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.g
      animate={reduceMotion ? undefined : { rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      style={{ originX: "48px", originY: "48px" }}
    >
      {Array.from({ length: 8 }, (_, n) => {
        const a = (n * Math.PI) / 4;
        return (
          <motion.line
            key={n}
            x1={48 + 13 * Math.cos(a)}
            y1={48 + 13 * Math.sin(a)}
            x2={48 + 38 * Math.cos(a)}
            y2={48 + 38 * Math.sin(a)}
            {...draw(0.1 + n * 0.06, 0.5)}
          />
        );
      })}
      <motion.circle
        cx="48"
        cy="48"
        r="6"
        fill="currentColor"
        stroke="none"
        animate={reduceMotion ? undefined : { scale: [1, 1.35, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "48px", originY: "48px" }}
      />
    </motion.g>
  );
}

function Bulb() {
  return (
    <>
      <motion.path d="M48 14c-14 0-24 10-24 23 0 9 5 14 9 19 3 4 4 7 4 11h22c0-4 1-7 4-11 4-5 9-10 9-19 0-13-10-23-24-23Z" {...draw(0.1, 1.2)} />
      <motion.path d="M38 74h20M41 82h14" {...draw(0.9, 0.5)} />
      <motion.path
        d="M43 58c0-8 2-11 5-14 3 3 5 6 5 14"
        {...draw(1.1, 0.6)}
        style={{ filter: "drop-shadow(0 0 6px var(--color-accent))" }}
      />
    </>
  );
}

function Phone() {
  return (
    <>
      <motion.rect x="28" y="10" width="40" height="76" rx="9" {...draw(0.1, 1)} />
      <motion.path d="M42 16h12" {...draw(0.7, 0.3)} />
      {[34, 45, 56].map((y, n) => (
        <motion.path key={y} d={`M37 ${y}h${n === 2 ? 14 : 22}`} strokeWidth={n === 1 ? 5 : 3.5} {...draw(0.9 + n * 0.25, 0.5)} />
      ))}
    </>
  );
}

function Podium() {
  return (
    <>
      <motion.rect x="36" y="40" width="24" height="42" {...draw(0.1, 0.8)} />
      <motion.rect x="12" y="56" width="24" height="26" {...draw(0.35, 0.7)} />
      <motion.rect x="60" y="64" width="24" height="18" {...draw(0.55, 0.6)} />
      <motion.circle cx="48" cy="20" r="8" {...draw(0.9, 0.6)} />
      <motion.path d="M40 34c2-4 5-6 8-6s6 2 8 6" {...draw(1.2, 0.5)} />
    </>
  );
}

function Target() {
  return (
    <>
      {[34, 22, 10].map((r, n) => (
        <motion.circle key={r} cx="48" cy="48" r={r} {...draw(0.1 + n * 0.25, 0.9)} />
      ))}
      <motion.path d="M48 48 80 16M70 16h10v10" {...draw(1, 0.6)} style={{ filter: "drop-shadow(0 0 6px var(--color-accent))" }} />
    </>
  );
}

function Rocket() {
  return (
    <>
      <motion.path d="M48 10c12 10 16 26 12 46H36c-4-20 0-36 12-46Z" {...draw(0.1, 1.1)} />
      <motion.circle cx="48" cy="34" r="6" {...draw(0.8, 0.5)} />
      <motion.path d="M36 46 26 58v10l12-6M60 46l10 12v10l-12-6" {...draw(0.9, 0.7)} />
      <motion.path d="M42 64c0 8 6 16 6 16s6-8 6-16" {...draw(1.3, 0.5)} style={{ filter: "drop-shadow(0 0 6px var(--color-accent))" }} />
    </>
  );
}

const SHAPES: Record<IllustrationId, () => React.ReactElement> = {
  star: Star,
  bulb: Bulb,
  phone: Phone,
  podium: Podium,
  target: Target,
  rocket: Rocket,
};

export function Illustration({ id, className }: { id: IllustrationId; className?: string }) {
  const reduceMotion = useReducedMotion();
  const Shape = SHAPES[id];
  return (
    <motion.div
      animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={cn("relative size-28 text-accent", className)}
    >
      <div aria-hidden className="absolute inset-2 rounded-full bg-accent/15 blur-2xl" />
      <svg
        viewBox="0 0 96 96"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative size-full"
        aria-hidden
      >
        <Shape />
      </svg>
    </motion.div>
  );
}

/** Drawn face from clear disagreement (0) to clear agreement (4). */
export function Face({ level, className }: { level: number; className?: string }) {
  const curve = [-7, -3.5, 0, 3.5, 7][level];
  const eyeY = [22, 21.5, 21, 20.5, 20][level];
  const mouth =
    curve === 0
      ? "M17 31 H31"
      : `M17 ${(31 - curve / 3).toFixed(1)} Q24 ${(31 + curve * 1.6).toFixed(1)} 31 ${(31 - curve / 3).toFixed(1)}`;
  return (
    <svg viewBox="0 0 48 48" className={cn("size-10", className)} aria-hidden>
      <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".45" />
      <circle cx="18" cy={eyeY} r="2.1" fill="currentColor" />
      <circle cx="30" cy={eyeY} r="2.1" fill="currentColor" />
      <path d={mouth} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** "Le revenu se répète" — the same payment landing month after month. */
export function RecurringRevenue() {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
  return (
    <div className="glass-panel rounded-[22px] p-5">
      <div className="flex items-end justify-between gap-2">
        {months.map((month, index) => (
          <div key={month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-28 w-full flex-col-reverse gap-1">
              {Array.from({ length: index + 1 }, (_, block) => (
                <motion.div
                  key={block}
                  initial={{ opacity: 0, y: -12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.3 + index * 0.25 + block * 0.05, ease: EASE }}
                  className={`h-3.5 w-full rounded-[4px] ${
                    block === index ? "bg-accent shadow-[0_0_10px_var(--color-accent)]" : "bg-accent/30"
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{month}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 font-body text-[13px] leading-relaxed text-ink-muted">
        Chaque nouveau client s&apos;ajoute à ceux du mois d&apos;avant. C&apos;est ça, un abonnement.
      </p>
    </div>
  );
}
