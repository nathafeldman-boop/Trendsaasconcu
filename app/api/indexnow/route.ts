import { NextResponse } from "next/server";
import { publishedPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

// Announces the articles that went live today (and the blog index) to the
// IndexNow search engines (Bing, Yandex…), so scheduled posts get crawled
// the day they appear. Called each morning by pg_cron (migration 0022).
// Safe to call by anyone: it only announces our own public pages.
export const dynamic = "force-dynamic";

const KEY = "7829c7a8a8c6539bb339c52c311c5eb6";

export async function GET() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
  const fresh = publishedPosts().filter((p) => p.date === today);
  if (fresh.length === 0) return NextResponse.json({ submitted: 0 });

  const urlList = [`${SITE_URL}/blog`, ...fresh.map((p) => `${SITE_URL}/blog/${p.slug}`)];
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
  }).catch(() => null);

  return NextResponse.json({ submitted: urlList.length, status: res?.status ?? "failed" });
}
