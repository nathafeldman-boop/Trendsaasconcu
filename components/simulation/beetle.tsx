"use client";

import { motion } from "framer-motion";

const LEG = { stroke: "#1a110b", strokeWidth: 1.6, strokeLinecap: "round" as const, fill: "none" };

/** Three legs on one side, twitching like a walking insect's. */
function Legs({ side, phase }: { side: 1 | -1; phase: number }) {
  return (
    <motion.g
      style={{ transformOrigin: "20px 26px" }}
      animate={{ rotate: [-7 * side, 7 * side, -7 * side] }}
      transition={{ duration: 0.28, repeat: Infinity, ease: "linear", delay: phase }}
    >
      <path {...LEG} d={`M${20 - 6 * side} 20 L${20 - 12 * side} 16 L${20 - 17 * side} 12`} />
      <path {...LEG} d={`M${20 - 8 * side} 27 L${20 - 15 * side} 27 L${20 - 19 * side} 31`} />
      <path {...LEG} d={`M${20 - 7 * side} 34 L${20 - 13 * side} 39 L${20 - 16 * side} 46`} />
    </motion.g>
  );
}

/**
 * A small beetle that walks across the screen once, stops for a moment,
 * then leaves: the kind of detail people stop scrolling for (and comment
 * on) when the questionnaire is filmed for TikTok. Purely decorative.
 */
export function Beetle() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[300]"
      initial={{ x: "-12vw", y: "66vh", rotate: 72 }}
      animate={{
        x: ["-12vw", "18vw", "38vw", "38vw", "62vw", "112vw"],
        y: ["66vh", "58vh", "61vh", "61vh", "50vh", "43vh"],
        rotate: [72, 64, 96, 96, 58, 66],
      }}
      transition={{ duration: 11, delay: 1.4, times: [0, 0.22, 0.4, 0.56, 0.76, 1], ease: "linear" }}
    >
      <svg width="34" height="44" viewBox="0 0 40 52" className="drop-shadow-[0_3px_4px_rgba(0,0,0,0.55)]">
        <defs>
          <radialGradient id="beetle-shell" cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#5a3b22" />
            <stop offset="45%" stopColor="#2c1b0f" />
            <stop offset="100%" stopColor="#0d0805" />
          </radialGradient>
        </defs>
        <Legs side={1} phase={0} />
        <Legs side={-1} phase={0.14} />
        <path {...LEG} strokeWidth={1.1} d="M18 7 Q14 3 11 0.5" />
        <path {...LEG} strokeWidth={1.1} d="M22 7 Q26 3 29 0.5" />
        <ellipse cx="20" cy="9.5" rx="4.6" ry="3.8" fill="#1c120b" />
        <ellipse cx="20" cy="16.5" rx="8" ry="5.4" fill="#26180e" />
        <ellipse cx="20" cy="32" rx="10.5" ry="14.5" fill="url(#beetle-shell)" />
        <path d="M20 18.5 L20 46" stroke="rgba(0,0,0,0.55)" strokeWidth="0.9" />
        <ellipse cx="16" cy="27" rx="2.6" ry="6" fill="rgba(255,255,255,0.13)" />
      </svg>
    </motion.div>
  );
}
