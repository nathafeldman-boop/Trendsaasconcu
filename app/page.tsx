import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { ToolsMarquee } from "@/components/landing/tools-marquee";
import { StatsSection } from "@/components/landing/stats-section";
import { CaseStudy } from "@/components/landing/case-study";
import { HelpSection } from "@/components/landing/help-section";
import { MarketingSection } from "@/components/landing/marketing-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { FloatingParticles } from "@/components/landing/floating-particles";
import { createClient } from "@/lib/supabase/server";

// Reads the visitor's own session for the pricing section — never cache a
// stale auth state.
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  let isAuthenticated = false;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

  return (
    <>
      <Nav />
      <main className="relative">
        <FloatingParticles />
        <Hero />
        <ToolsMarquee />
        <StatsSection />
        <CaseStudy />
        <HelpSection />
        <MarketingSection />
        <PricingSection isAuthenticated={isAuthenticated} />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
