import type { MetadataRoute } from "next";
import { publishedPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { listSeoPages } from "@/lib/seo/store";
import { FAMILIES } from "@/lib/seo/topics";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/commencer`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/tarifs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/conditions`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/remboursement`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
  const posts: MetadataRoute.Sitemap = publishedPosts().map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T08:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const hubs: MetadataRoute.Sitemap = Object.values(FAMILIES).map((f) => ({
    url: `${SITE_URL}${f.path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));
  const seo: MetadataRoute.Sitemap = (await listSeoPages()).map((p) => ({
    url: `${SITE_URL}${FAMILIES[p.family].path}/${p.slug}`,
    lastModified: new Date(p.published_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...pages, ...posts, ...hubs, ...seo];
}
