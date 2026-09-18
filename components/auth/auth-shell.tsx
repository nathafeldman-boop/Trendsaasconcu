"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { Eyebrow } from "@/components/ui/eyebrow";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-5 py-6 sm:px-8">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] rounded-xl border border-ink/10 bg-canvas-raised/60 p-8 sm:p-10"
        >
          <Eyebrow tone="accent">{eyebrow}</Eyebrow>
          <h1 className="mt-5 font-display text-[28px] font-semibold leading-tight tracking-tight text-ink sm:text-[32px]">
            {title}
          </h1>
          <p className="mt-3 font-body text-[15px] leading-relaxed text-ink-muted">
            {subtitle}
          </p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 border-t border-ink/10 pt-6 text-center">
            {footer}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
