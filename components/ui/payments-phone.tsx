"use client";

import { useSyncExternalStore } from "react";
import { motion, type Variants } from "framer-motion";
import { BatteryFull, Camera, Flashlight, Signal, Wifi } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

export type PaymentNotification = { when: string; amount: string; email: string };

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stack: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.35, delayChildren: 0.5 } } };
const pop: Variants = {
  hidden: { opacity: 0, y: -14, scale: 0.96, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
};

// Today's date on the lock screen, filled in the browser (the page is static).
const noSubscribe = () => () => {};
function useToday() {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const text = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    () => null
  );
}

/**
 * A phone lock screen with Stripe payment pushes, worded like the Stripe
 * app's. Always an illustration, and labelled so under the phone.
 */
export function PaymentsPhone({ notifications }: { notifications: PaymentNotification[] }) {
  const today = useToday();
  return (
    <div className="relative mx-auto w-[290px] sm:w-[310px]">
      <div aria-hidden className="absolute -inset-x-16 top-1/3 bottom-0 rounded-[48px] border border-ink/10" />
      <div className="relative rounded-[46px] border border-ink/20 bg-[#0d0d10] p-2.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="relative overflow-hidden rounded-[38px] bg-gradient-to-b from-[#1a1a24] via-[#141420] to-[#211a3a] px-3.5 pb-5 pt-3">
          <div className="flex items-center justify-between px-3 font-body text-[11px] font-semibold text-ink">
            <span>9:41</span>
            <span className="h-5 w-20 rounded-full bg-black" />
            <span className="flex items-center gap-1">
              <Signal className="size-3" strokeWidth={2.5} />
              <Wifi className="size-3" strokeWidth={2.5} />
              <BatteryFull className="size-4" strokeWidth={2} />
            </span>
          </div>
          <p className="mt-5 h-4 text-center font-body text-[13px] text-ink/85">{today}</p>
          <p className="text-center font-display text-[64px] font-semibold leading-none tracking-[-0.03em] text-ink">9:41</p>
          <motion.ul variants={stack} initial="hidden" animate="show" className="mt-6 flex flex-col gap-2">
            {notifications.map((n) => (
              <motion.li key={n.when} variants={pop} className="flex gap-2.5 rounded-[18px] bg-white/[0.09] p-2.5 backdrop-blur-md">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#635BFF]">
                  <BrandLogo brand="stripe" monochrome className="size-[18px] text-white" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-body text-[12px] font-semibold text-ink">Stripe</span>
                    <span className="font-body text-[10.5px] text-ink/55">{n.when}</span>
                  </span>
                  <span className="block font-body text-[11.5px] leading-snug text-ink/85">
                    Vous avez reçu un paiement d&apos;un montant de <strong className="text-ink">{n.amount}</strong> émis par {n.email}
                  </span>
                </span>
              </motion.li>
            ))}
          </motion.ul>
          <div className="mt-24 flex items-center justify-between px-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
              <Flashlight className="size-4 text-ink" />
            </span>
            <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
              <Camera className="size-4 text-ink" />
            </span>
          </div>
          <div className="mx-auto mt-4 h-1 w-28 rounded-full bg-ink/80" />
        </div>
      </div>
      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">Illustration</p>
    </div>
  );
}

