import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { CtaButton } from "@/components/landing/cta-button";

export function Nav() {
  return (
    <header className="sticky top-9 z-50 border-b border-ink/8 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-5">
          <nav className="hidden items-center gap-5 font-body text-[14px] text-ink-muted sm:flex">
            <Link href="/#comment" className="transition-colors hover:text-ink">
              Comment ça marche
            </Link>
            <Link href="/#questions" className="transition-colors hover:text-ink">
              Questions
            </Link>
            <Link href="/blog" className="transition-colors hover:text-ink">
              Blog
            </Link>
            <Link href="/connexion" className="transition-colors hover:text-ink">
              Se connecter
            </Link>
          </nav>
          <CtaButton from="nav" size="sm" />
        </div>
      </div>
    </header>
  );
}
