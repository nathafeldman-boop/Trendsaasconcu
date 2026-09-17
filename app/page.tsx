import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { ToolsMarquee } from "@/components/landing/tools-marquee";
import { StatsSection } from "@/components/landing/stats-section";
import { ExplainerSection } from "@/components/landing/explainer-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { FloatingParticles } from "@/components/landing/floating-particles";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <FloatingParticles />
        <Hero />
        <ToolsMarquee />
        <StatsSection />
        <ExplainerSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
