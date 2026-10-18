import { cn } from "@/lib/utils";

// Circuit-board traces running in from the edges, with a bright pulse of
// current travelling along each one — the "live wire" motif of the brand.
const TRACES = [
  { d: "M0 120 H220 Q236 120 236 136 V256 Q236 272 252 272 H410", duration: "5.5s", delay: "0s" },
  { d: "M0 430 H130 Q146 430 146 414 V346 Q146 330 162 330 H350", duration: "6.5s", delay: "-2s" },
  { d: "M1200 92 H1012 Q996 92 996 108 V216 Q996 232 980 232 H790", duration: "6s", delay: "-1s" },
  { d: "M1200 384 H1084 Q1068 384 1068 400 V466 Q1068 482 1052 482 H860", duration: "7s", delay: "-3.5s" },
  { d: "M310 640 V540 Q310 524 326 524 H470", duration: "4.5s", delay: "-1.5s" },
  { d: "M890 640 V556 Q890 540 874 540 H730", duration: "5s", delay: "-4s" },
];

const NODES = [
  [410, 272],
  [350, 330],
  [790, 232],
  [860, 482],
  [470, 524],
  [730, 540],
];

export function CircuitLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none", className)}
    >
      {TRACES.map((trace) => (
        <g key={trace.d}>
          <path d={trace.d} fill="none" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1.2" />
          <path
            d={trace.d}
            pathLength={1000}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="70 930"
            className="animate-wire-pulse"
            style={{
              animationDuration: trace.duration,
              animationDelay: trace.delay,
              filter: "drop-shadow(0 0 6px var(--color-accent))",
            }}
          />
        </g>
      ))}
      {NODES.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="7" fill="rgba(51, 244, 239, 0.12)" />
          <circle cx={cx} cy={cy} r="2.6" fill="var(--color-accent)" />
        </g>
      ))}
    </svg>
  );
}
