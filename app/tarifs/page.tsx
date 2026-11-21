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
      <div className="mx-auto max-w-4xl px-5 pb-28 sm:px-8">
        <PricingCards />
        <div className="mx-auto max-w-[560px]">
          <AccessCodeInline />
        </div>
      </div>
    </div>
  );
}
