import { publishedPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = publishedPosts()
    .slice(0, 50)
    .map(
      (p) => `<item><title>${escape(p.title)}</title><link>${SITE_URL}/blog/${p.slug}</link><guid>${SITE_URL}/blog/${p.slug}</guid><pubDate>${new Date(`${p.date}T08:00:00+01:00`).toUTCString()}</pubDate><description>${escape(p.description)}</description></item>`
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Blog SaaSFounder</title><link>${SITE_URL}/blog</link><description>Créer ton SaaS avec l'IA, de l'idée au premier client.</description><language>fr-FR</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
