import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { FloatingIcon } from "@/components/ui/floating-icon";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-5 py-6 sm:px-8">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pb-24 text-center sm:px-8">
        <FloatingIcon className="size-14">
          <Compass className="size-6" strokeWidth={1.75} />
        </FloatingIcon>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Erreur 404
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
          Cette page n&apos;existe pas.
        </h1>
        <p className="mt-3 font-body text-[15px] leading-relaxed text-ink-muted">
          Le lien est peut-être cassé, ou la page a été déplacée.
        </p>
        <Button href="/" showArrow={false} className="mt-8">
          Retour à l&apos;accueil
        </Button>
      </div>
    </div>
  );
}
