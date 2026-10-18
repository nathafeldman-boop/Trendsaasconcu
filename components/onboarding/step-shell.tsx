"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Logo } from "@/components/ui/logo";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function StepShell({
  step,
  total,
  onBack,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  center = false,
}: {
  step: number;
  total: number;
  onBack?: () => void;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Centered layout for statement screens (messages, barrier, objective). */
  center?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          {Math.min(step + 1, total)} / {total}
        </span>
      </header>

      <div className="mx-auto w-full max-w-xl flex-1 px-5 pb-16 sm:px-8">
        <ProgressBar step={step} total={total} />

        <div className="mt-6 h-5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 font-body text-[13px] text-ink-faint transition-colors hover:text-ink-muted"
            >
              <ArrowLeft className="size-3.5" />
              Question précédente
            </button>
          ) : null}
        </div>

        <div className={cn("mt-8", center && "flex flex-col items-center text-center")}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
            <Eyebrow tone="accent" className={cn(center && "justify-center")}>
              {eyebrow}
            </Eyebrow>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
            className="text-chrome mt-4 font-display text-[30px] font-normal leading-[1.1] tracking-[-0.04em] sm:text-[38px]"
          >
            {title}
          </motion.h1>
          {subtitle ? (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
              className={cn("mt-3 max-w-md font-body text-[15px] leading-relaxed text-ink-muted", center && "mx-auto")}
            >
              {subtitle}
            </motion.p>
          ) : null}
        </div>

        {children ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="mt-8"
          >
            {children}
          </motion.div>
        ) : null}

        {footer ? <div className="mt-10">{footer}</div> : null}

        <p className="mt-10 font-body text-[12px] text-ink-faint">
          Tes réponses sont enregistrées au fur et à mesure.{" "}
          <Link href="/" className="underline underline-offset-2 hover:text-ink-muted">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
