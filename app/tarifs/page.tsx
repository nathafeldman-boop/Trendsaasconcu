import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { AccessCodeInline } from "@/components/access/access-code-inline";

export const metadata: Metadata = {
  title: "Tarifs — SaaSFounder",
};

// Static: the pricing cards check the session in the browser on click.
export default function TarifsPage() {
  return (
    <div className="min-h-screen">
      <header className="px-5 py-6 sm:px-8">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </header>
      <div className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Choisis ton rythme.</h1>
        <p className="mt-3 max-w-lg font-body text-[15px] leading-relaxed text-ink-muted">
          Un seul objectif dans chaque formule : que tu crées ton SaaS et que tu encaisses dès
          maintenant. Même contenu, même accompagnement, résiliable à tout moment.
        </p>
        <div className="mt-10">
          <PricingCards />
          <AccessCodeInline />
        </div>
      </div>
    </div>
  );
}
