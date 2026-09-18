import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className="sticky top-9 z-50 border-b border-ink/8 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 font-body text-[14px] text-ink-muted sm:flex">
          <a href="#methode" className="transition-colors hover:text-ink">
            Méthode
          </a>
          <a href="#marketing" className="transition-colors hover:text-ink">
            Marketing
          </a>
          <a href="#resultats" className="transition-colors hover:text-ink">
            Résultats
          </a>
          <a href="#tarifs" className="transition-colors hover:text-ink">
            Tarifs
          </a>
        </nav>
        <div className="flex items-center gap-2.5">
          <Button href="/connexion" variant="secondary" size="sm" showArrow={false} className="hidden sm:inline-flex">
            Se connecter
          </Button>
          <Button href="/commencer" size="sm" showArrow={false}>
            Devenir fondateur
          </Button>
        </div>
      </div>
    </header>
  );
}
