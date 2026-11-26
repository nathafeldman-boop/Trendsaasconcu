import { createAdminClient } from "@/lib/supabase/admin";
import type { SeoContent } from "@/lib/seo/generate";
import { allTopics, type SeoFamily } from "@/lib/seo/topics";

export type SeoPage = {
  family: SeoFamily;
  slug: string;
  topic: string;
  title: string;
  description: string;
  content: SeoContent;
  published_at: string;
};

export type SeoLink = { family: SeoFamily; slug: string; title: string };

function db() {
  return createAdminClient();
}

/** A page that is generated and whose publication time has come, or null. */
export async function getSeoPage(family: SeoFamily, slug: string): Promise<SeoPage | null> {
  const client = db();
  if (!client || !/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const { data } = await client
    .from("seo_pages")
    .select("family, slug, topic, title, description, content, published_at")
    .eq("family", family)
    .eq("slug", slug)
    .eq("status", "ready")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  return (data as SeoPage | null) ?? null;
}

/** Published pages (links only), newest first; all families when none given. */
export async function listSeoPages(family?: SeoFamily): Promise<(SeoLink & { published_at: string })[]> {
  const client = db();
  if (!client) return [];
  const now = new Date().toISOString();
  const out: (SeoLink & { published_at: string })[] = [];
  // The API returns at most 1 000 rows per request.
  for (let from = 0; ; from += 1000) {
    let query = client
      .from("seo_pages")
      .select("family, slug, title, published_at")
      .eq("status", "ready")
      .lte("published_at", now)
      .order("published_at", { ascending: false })
      .range(from, from + 999);
    if (family) query = query.eq("family", family);
    const { data } = await query;
    out.push(...((data ?? []) as (SeoLink & { published_at: string })[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

/** A few other published pages of the same family, picked around this one. */
export async function relatedSeoPages(family: SeoFamily, slug: string, count = 6): Promise<SeoLink[]> {
  const pages = await listSeoPages(family);
  const others = pages.filter((p) => p.slug !== slug);
  if (others.length <= count) return others;
  // Stable per page, so the links don't change on every render.
  let seed = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const picked: SeoLink[] = [];
  const pool = [...others];
  while (picked.length < count && pool.length) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    picked.push(pool.splice(seed % pool.length, 1)[0]);
  }
  return picked;
}

/** Adds the subjects that have no row yet (new entries in lib/seo/topics.ts). */
export async function seedSeoTopics() {
  const client = db();
  if (!client) return 0;
  const { count } = await client.from("seo_pages").select("id", { count: "exact", head: true });
  const topics = allTopics();
  if ((count ?? 0) >= topics.length) return 0;
  for (let i = 0; i < topics.length; i += 500) {
    await client.from("seo_pages").upsert(topics.slice(i, i + 500), { onConflict: "family,slug", ignoreDuplicates: true });
  }
  return topics.length - (count ?? 0);
}
