import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo />
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          © {new Date().getFullYear()} SaaSFounder · Tous droits réservés
        </p>
        <Link
          href="/acces"
          className="font-mono text-[11px] uppercase tracking-wider text-ink-faint transition-colors hover:text-ink-muted"
        >
          Code d&apos;accès
        </Link>
      </div>
    </footer>
  );
}
