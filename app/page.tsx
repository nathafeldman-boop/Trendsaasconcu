import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { ToolsMarquee } from "@/components/landing/tools-marquee";
import { HowItWorks } from "@/components/landing/how-it-works";
import { VslSection } from "@/components/landing/vsl-section";
import { FAQ, FaqSection } from "@/components/landing/faq-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "fr-FR",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

// Fully static: served from the CDN closest to the visitor. One way in, the
// questionnaire; the plans show at its end.
export default function Home() {
  return (
    <>
      <JsonLd data={STRUCTURED_DATA} />
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
