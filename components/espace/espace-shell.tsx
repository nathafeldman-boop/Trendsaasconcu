"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Hammer, LineChart, Megaphone, Rocket, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/track";

type Tab = { href: string; label: string; hint: string; icon: LucideIcon };

export const TABS: Tab[] = [
  { href: "/espace", label: "Création de SaaS", hint: "Idée, code, hébergement, données", icon: Hammer },
  { href: "/espace/lancement", label: "Pilote auto", hint: "On connecte tes comptes et on crée tout", icon: Rocket },
  { href: "/espace/coach", label: "Coach IA", hint: "Il connaît tout ton projet", icon: Sparkles },
  { href: "/espace/revenus", label: "Revenus", hint: "Stripe, MRR et prix", icon: LineChart },
  { href: "/espace/marketing", label: "Marketing", hint: "Contenu et premiers clients", icon: Megaphone },
];

function isActive(pathname: string, href: string) {
  return href === "/espace" ? pathname === "/espace" : pathname.startsWith(href);
}

export function EspaceShell({
  firstName,
  hasStripeSubscription,
  isAdmin,
  activePath,
  children,
}: {
  firstName: string | null;
  hasStripeSubscription: boolean;
  isAdmin: boolean;
  /** Highlights this tab instead of the current URL's (the VSL screenshot captures). */
  activePath?: string;
  children: React.ReactNode;
}) {
  const currentPath = usePathname();
  const pathname = activePath ?? currentPath;

  return (
    <div className="lg:flex">
      {/* Desktop: big tabs on the left, Stripe-style. */}
      <aside className="sticky top-9 hidden h-[calc(100vh-2.25rem)] w-[288px] shrink-0 flex-col border-r border-ink/8 bg-canvas-raised/40 px-4 py-6 backdrop-blur-xl lg:flex">
        <Link href="/espace" className="px-2">
          <Logo />
        </Link>
        <p className="mt-6 px-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          {firstName ? `Espace de ${firstName}` : "Ton espace"}
        </p>
        <nav className="mt-3 flex flex-col gap-1.5">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "group relative flex items-center gap-3.5 rounded-[16px] px-3 py-3 transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="espace-tab"
                    className="glass-panel absolute inset-0 rounded-[16px]"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                {active && (
                  <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
                )}
                <span
                  className={cn(
                    "relative flex size-10 shrink-0 items-center justify-center rounded-[12px] border transition-colors",
                    active ? "border-accent/40 bg-accent/15 text-accent" : "border-ink/10 bg-ink/[0.03] group-hover:text-accent"
                  )}
                >
                  <tab.icon className="size-[18px]" strokeWidth={1.75} />
                </span>
                <span className="relative min-w-0">
                  <span className="block font-display text-[15px] font-medium">{tab.label}</span>
                  <span className="block truncate font-body text-[12px] text-ink-faint">{tab.hint}</span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 px-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 font-body text-[12px] text-ink-muted transition-colors hover:text-ink"
            >
              <ShieldCheck className="size-3.5 text-accent" /> Dashboard admin
            </Link>
          )}
          {hasStripeSubscription && <ManageSubscriptionLink />}
          <Link href="/acces" className="font-body text-[12px] text-ink-faint transition-colors hover:text-ink-muted">
            J&apos;ai un code d&apos;accès
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 pb-28 lg:pb-16">
        {/* Mobile header: logo only, the tabs live in the bottom bar. */}
        <header className="flex items-center justify-between px-5 py-5 lg:hidden">
          <Link href="/espace">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin" className="rounded-full border border-ink/15 px-3 py-1.5 font-body text-[12px] text-ink-muted">
                Admin
              </Link>
            )}
            {hasStripeSubscription && <ManageSubscriptionLink compact />}
          </div>
        </header>
        {children}
      </main>

      {/* Mobile: app-style bottom tab bar. */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-ink/10 bg-canvas/90 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl lg:hidden">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn("flex flex-col items-center gap-1 rounded-[12px] py-1.5", active ? "text-accent" : "text-ink-faint")}
            >
              <tab.icon className="size-5" strokeWidth={1.75} />
              <span className="font-body text-[10px] leading-tight">{tab.label.replace(" de SaaS", "")}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function ManageSubscriptionLink({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      track("billing_portal_opened");
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.assign(data.url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={loading}
      className={cn(
        "text-left font-body transition-colors hover:text-ink disabled:opacity-50",
        compact ? "rounded-full border border-ink/15 px-3 py-1.5 text-[12px] text-ink-muted" : "text-[12px] text-ink-muted"
      )}
    >
      {loading ? "..." : "Gérer mon abonnement"}
    </button>
  );
}
