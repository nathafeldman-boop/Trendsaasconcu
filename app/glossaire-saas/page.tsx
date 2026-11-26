import { SeoHub, seoHubMetadata } from "@/components/seo/seo-views";

// Re-rendered every hour, so the pages published since then are listed.
export const revalidate = 3600;
export const metadata = seoHubMetadata("glossaire");

export default function Page() {
  return <SeoHub family="glossaire" />;
}
