"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AmbientGlow() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-56 -top-40 size-[560px] rounded-full bg-accent/20 blur-[130px]"
        animate={reduceMotion ? undefined : { x: [0, 70, 0], y: [0, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-48 top-1/3 size-[480px] rounded-full bg-accent-deep/14 blur-[130px]"
        animate={reduceMotion ? undefined : { x: [0, -60, 0], y: [0, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute bottom-[-200px] left-1/3 size-[520px] rounded-full bg-accent/12 blur-[140px]"
        animate={reduceMotion ? undefined : { x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}
