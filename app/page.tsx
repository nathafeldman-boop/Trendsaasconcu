import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { ToolsMarquee } from "@/components/landing/tools-marquee";
import { HowItWorks } from "@/components/landing/how-it-works";
import { VslSection } from "@/components/landing/vsl-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

// Fully static: served from the CDN closest to the visitor. One way in, the
// questionnaire; the plans show at its end.
export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        <ToolsMarquee />
        <HowItWorks />
        <VslSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
