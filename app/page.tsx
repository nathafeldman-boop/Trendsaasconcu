import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { VslSection } from "@/components/landing/vsl-section";
import { ToolsMarquee } from "@/components/landing/tools-marquee";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { StepsSection } from "@/components/landing/steps-section";
import { CaseStudy } from "@/components/landing/case-study";
import { MarketingSection } from "@/components/landing/marketing-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { FloatingParticles } from "@/components/landing/floating-particles";

// Fully static: served from the CDN closest to the visitor. The pricing
// cards check the session in the browser when a plan is picked.
export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <FloatingParticles />
        <Hero />
        <VslSection />
        <ToolsMarquee />
        <ShowcaseSection />
        <ComparisonSection />
        <StepsSection />
        <CaseStudy />
        <MarketingSection />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
