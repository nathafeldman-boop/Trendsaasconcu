import { SeoArticle, seoPageMetadata } from "@/components/seo/seo-views";

// Rendered on first visit, then cached and refreshed every hour.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return seoPageMetadata("glossaire", (await params).slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <SeoArticle family="glossaire" slug={(await params).slug} />;
}
