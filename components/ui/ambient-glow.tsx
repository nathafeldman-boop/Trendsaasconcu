"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AmbientGlow() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Light pooling in from the top of the page, like a lit control room.
          Absolute, not fixed: it belongs to the top of the document and
          scrolls away with it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-50 h-[900px] bg-[radial-gradient(90%_45%_at_18%_-8%,rgba(43,255,255,0.16),transparent_62%),radial-gradient(80%_40%_at_88%_0%,rgba(43,255,255,0.11),transparent_58%),radial-gradient(100%_40%_at_50%_-12%,rgba(10,102,105,0.5),transparent_64%)]"
      />
      <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-56 top-1/3 size-[560px] rounded-full bg-accent-deep/10 blur-[140px]"
          animate={reduceMotion ? undefined : { x: [0, 70, 0], y: [0, 50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-48 top-2/3 size-[480px] rounded-full bg-accent-deep/10 blur-[140px]"
          animate={reduceMotion ? undefined : { x: [0, -60, 0], y: [0, 40, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>
    </>
  );
}
