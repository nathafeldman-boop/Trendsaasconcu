import { NextResponse } from "next/server";
import { publishedPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { listSeoPages } from "@/lib/seo/store";
import { FAMILIES } from "@/lib/seo/topics";

// Announces the articles that went live today, the generated pages of the
// last 24 hours (and their indexes) to the
// IndexNow search engines (Bing, Yandex…), so scheduled posts get crawled
// the day they appear. Called each morning by pg_cron (migration 0022).
// Safe to call by anyone: it only announces our own public pages.
export const dynamic = "force-dynamic";

const KEY = "7829c7a8a8c6539bb339c52c311c5eb6";

export async function GET() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
  const fresh = publishedPosts().filter((p) => p.date === today);
  // Generated pages published in the last 24 hours (lib/seo).
  const since = Date.now() - 24 * 3600 * 1000;
  const seo = (await listSeoPages()).filter((p) => Date.parse(p.published_at) > since);
  if (fresh.length === 0 && seo.length === 0) return NextResponse.json({ submitted: 0 });

  const urlList = [
    `${SITE_URL}/blog`,
    ...fresh.map((p) => `${SITE_URL}/blog/${p.slug}`),
    ...(seo.length ? Object.values(FAMILIES).map((f) => `${SITE_URL}${f.path}`) : []),
    ...seo.map((p) => `${SITE_URL}${FAMILIES[p.family].path}/${p.slug}`),
  ].slice(0, 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
  }).catch(() => null);

  return NextResponse.json({ submitted: urlList.length, status: res?.status ?? "failed" });
}
