"use client";

import { motion, useReducedMotion } from "framer-motion";

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  top: (i * 23 + 5) % 100,
  size: 3 + (i % 4),
  duration: 9 + (i % 6),
  delay: (i % 5) * 0.7,
}));

export function FloatingParticles() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-accent/50"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -34, 0], opacity: [0.15, 0.6, 0.15] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
