import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { AccessCodeInline } from "@/components/access/access-code-inline";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tarifs — SaaSFounder",
};

// Reads the visitor's own session — never cache a stale auth state.
export const dynamic = "force-dynamic";

export default async function TarifsPage() {
  const supabase = await createClient();
  let isAuthenticated = false;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

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
          Même contenu, même accompagnement — choisis juste la formule qui te convient. Résiliable à
          tout moment.
        </p>
        <div className="mt-10">
          <PricingCards isAuthenticated={isAuthenticated} />
          <AccessCodeInline isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </div>
  );
}
