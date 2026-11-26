import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeSeoPage } from "@/lib/seo/generate";
import { seedSeoTopics } from "@/lib/seo/store";
import type { SeoFamily } from "@/lib/seo/topics";

// Called every minute by pg_cron (migrations 0025, 0027). Writes a few pending
// SEO pages and schedules each one's publication (about 40 a day). Safe to
// call by anyone: it only works through the finite list of subjects, a few
// at a time, and skips pages another run is already writing.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PER_RUN = 8;
const MAX_ATTEMPTS = 3;

export async function GET() {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const seeded = await seedSeoTopics();
  const now = new Date();
  const { data: pending } = await admin
    .from("seo_pages")
    .select("id, family, topic, attempts")
    .in("status", ["pending", "failed"])
    .lt("attempts", MAX_ATTEMPTS)
    .or(`locked_until.is.null,locked_until.lt.${now.toISOString()}`)
    .order("attempts", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(PER_RUN);
  const batch = pending ?? [];
  if (batch.length === 0) return NextResponse.json({ seeded, written: 0, left: 0 });

  // Claimed for 2 minutes so an overlapping run doesn't write the same pages.
  const lock = new Date(now.getTime() + 120_000).toISOString();
  await admin.from("seo_pages").update({ locked_until: lock }).in("id", batch.map((p) => p.id));

  const results = await Promise.allSettled(batch.map((p) => writeSeoPage(p.family as SeoFamily, p.topic)));

  let written = 0;
  const errors: string[] = [];
  // One after the other, so each page gets its own publication slot.
  for (const [i, result] of results.entries()) {
    const page = batch[i];
    if (result.status === "fulfilled") {
      const { data: slot } = await admin.rpc("next_seo_slot");
      const { content, model } = result.value;
      await admin
        .from("seo_pages")
        .update({
          status: "ready",
          title: content.title,
          description: content.description,
          content,
          model,
          generated_at: new Date().toISOString(),
          published_at: slot ?? new Date().toISOString(),
          attempts: page.attempts + 1,
          locked_until: null,
        })
        .eq("id", page.id);
      written++;
    } else {
      const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
      errors.push(`${page.topic}: ${message}`);
      await admin.from("seo_pages").update({ status: "failed", attempts: page.attempts + 1, locked_until: null }).eq("id", page.id);
    }
  }

  const { count: left } = await admin
    .from("seo_pages")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "failed"])
    .lt("attempts", MAX_ATTEMPTS);
  if (errors.length) console.error("seo generate:", errors.join(" | "));
  return NextResponse.json({ seeded, written, failed: errors.length, left, errors });
}
