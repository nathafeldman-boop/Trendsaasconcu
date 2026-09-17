"use client";

import { motion, useReducedMotion } from "framer-motion";

const LINES = [
  { y: 60, length: 220, opacity: 0.16, width: 1.5 },
  { y: 120, length: 340, opacity: 0.1, width: 1 },
  { y: 190, length: 160, opacity: 0.22, width: 2 },
  { y: 250, length: 280, opacity: 0.08, width: 1 },
  { y: 40, length: 120, opacity: 0.28, width: 2 },
];

export function VelocityField({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={className}
      aria-hidden
      style={{
        maskImage:
          "radial-gradient(ellipse 70% 70% at 100% 0%, black 40%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 70% at 100% 0%, black 40%, transparent 100%)",
      }}
    >
      <motion.svg
        viewBox="0 0 640 420"
        className="h-full w-full text-accent"
        animate={reduceMotion ? undefined : { x: [0, -14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        {LINES.map((line, i) => (
          <line
            key={i}
            x1={640 - i * 30}
            y1={line.y}
            x2={640 - i * 30 - line.length}
            y2={line.y + line.length * 0.55}
            stroke="currentColor"
            strokeWidth={line.width}
            strokeLinecap="round"
            opacity={line.opacity}
          />
        ))}
      </motion.svg>
    </div>
  );
}
