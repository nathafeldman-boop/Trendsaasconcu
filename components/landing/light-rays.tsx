import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Soft beams of cyan light falling from the top edge. Pure CSS, so it costs
// nothing on the main thread and stays still under reduced motion.
const RAYS = [
  { left: "8%", width: 120, height: "62%", alpha: 0.16, delay: "0s", skew: "-16deg", drift: "26px" },
  { left: "24%", width: 60, height: "78%", alpha: 0.22, delay: "-2.5s", skew: "-12deg", drift: "18px" },
  { left: "41%", width: 150, height: "55%", alpha: 0.12, delay: "-5s", skew: "-8deg", drift: "-14px" },
  { left: "58%", width: 70, height: "72%", alpha: 0.2, delay: "-1.2s", skew: "8deg", drift: "-20px" },
  { left: "74%", width: 130, height: "60%", alpha: 0.15, delay: "-3.8s", skew: "12deg", drift: "-24px" },
  { left: "90%", width: 55, height: "70%", alpha: 0.2, delay: "-6s", skew: "16deg", drift: "-16px" },
];

export function LightRays({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none overflow-hidden", className)}>
      {RAYS.map((ray) => (
        <span
          key={ray.left}
          className="absolute top-[-12%] origin-top animate-ray-sway rounded-full"
          style={
            {
              left: ray.left,
              width: ray.width,
              height: ray.height,
              background: `linear-gradient(180deg, rgba(43, 255, 255, ${ray.alpha}) 0%, rgba(43, 255, 255, 0) 100%)`,
              filter: "blur(clamp(22px, 3vw, 56px))",
              animationDelay: ray.delay,
              "--ray-skew": ray.skew,
              "--ray-drift": ray.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
