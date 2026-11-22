import { createAdminClient } from "@/lib/supabase/admin";
import { earnedCents, normalizeHandle, parisDay, streak } from "@/lib/creators/program";
import { fetchVideoStats, parseTikTokUrl } from "@/lib/creators/tiktok";

export type Creator = {
  id: string;
  token: string;
  created_at: string;
  name: string;
  tiktok_handle: string;
  phone: string;
  payout_method: string;
  payout_details: string;
};

export type CreatorVideo = {
  id: string;
  creator_id: string;
  created_at: string;
  url: string;
  video_id: string;
  author: string | null;
  posted_at: string | null;
  views: number;
  views_checked_at: string | null;
  last_error: string | null;
  status: "active" | "rejected";
  rejected_reason: string | null;
};

export type CreatorPayout = { id: string; creator_id: string; created_at: string; amount_cents: number; note: string | null };

export type CreatorAccount = Creator & {
  videos: CreatorVideo[];
  payouts: CreatorPayout[];
  views: number;
  streak: ReturnType<typeof streak>;
  earnedCents: number;
  paidCents: number;
  dueCents: number;
};

/** Views are re-read at most this often, however often the refresh is called. */
const REFRESH_EVERY_MS = 9 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function db() {
  const client = createAdminClient();
  if (!client) throw new Error("Supabase service role not configured");
  return client;
}

function account(creator: Creator, videos: CreatorVideo[], payouts: CreatorPayout[]): CreatorAccount {
  const counted = videos.filter((v) => v.status === "active");
  const views = counted.reduce((sum, v) => sum + Number(v.views), 0);
  // The day each counted video went up on TikTok (until it is read, the day it was added).
  const run = streak(counted.map((v) => parisDay(v.posted_at ?? v.created_at)));
  const earned = counted.reduce((sum, v) => sum + earnedCents(Number(v.views)), 0) + run.bonusCents;
  const paid = payouts.reduce((sum, p) => sum + p.amount_cents, 0);
  return { ...creator, videos, payouts, views, streak: run, earnedCents: earned, paidCents: paid, dueCents: Math.max(0, earned - paid) };
}

export async function getCreatorAccount(token: string): Promise<CreatorAccount | null> {
  if (!UUID.test(token)) return null;
  const supabase = db();
  const { data: creator } = await supabase.from("creators").select("*").eq("token", token).maybeSingle();
  if (!creator) return null;
  const [videos, payouts] = await Promise.all([
    supabase.from("creator_videos").select("*").eq("creator_id", creator.id).order("created_at", { ascending: false }),
    supabase.from("creator_payouts").select("*").eq("creator_id", creator.id).order("created_at", { ascending: false }),
  ]);
  return account(creator as Creator, (videos.data ?? []) as CreatorVideo[], (payouts.data ?? []) as CreatorPayout[]);
}

export async function listCreatorAccounts(): Promise<CreatorAccount[]> {
  const supabase = db();
  const [creators, videos, payouts] = await Promise.all([
    supabase.from("creators").select("*").order("created_at", { ascending: false }),
    supabase.from("creator_videos").select("*").order("views", { ascending: false }),
    supabase.from("creator_payouts").select("*").order("created_at", { ascending: false }),
  ]);
  if (creators.error) throw new Error(creators.error.message);
  const byCreator = <T extends { creator_id: string }>(rows: T[] | null, id: string) => (rows ?? []).filter((r) => r.creator_id === id);
  return ((creators.data ?? []) as Creator[]).map((c) =>
    account(c, byCreator(videos.data as CreatorVideo[] | null, c.id), byCreator(payouts.data as CreatorPayout[] | null, c.id))
  );
}

export async function createCreator(input: Omit<Creator, "id" | "token" | "created_at">) {
  const { data, error } = await db().from("creators").insert(input).select("token").single();
  if (error) return { error: error.code === "23505" ? ("taken" as const) : ("failed" as const) };
  return { token: data.token as string };
}

type AddResult = { ok: true; video: CreatorVideo } | { ok: false; error: string };

/**
 * Adds a video to a creator: it must be a TikTok link, published by the
 * creator's own account, and not already added by anyone. When TikTok can't
 * be read right now, the video is kept and checked at the next refresh.
 */
export async function addCreatorVideo(token: string, rawUrl: string): Promise<AddResult> {
  const creator = await getCreatorAccount(token);
  if (!creator) return { ok: false, error: "Lien créateur invalide." };
  const url = parseTikTokUrl(rawUrl);
  if (!url) return { ok: false, error: "Colle le lien d'une vidéo TikTok (tiktok.com/@…/video/…)." };

  let stats: Awaited<ReturnType<typeof fetchVideoStats>> | null = null;
  let fetchError: string | null = null;
  try {
    stats = await fetchVideoStats(url);
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "TikTok illisible";
  }

  const handle = normalizeHandle(creator.tiktok_handle);
  const fromUrl = url.match(/tiktok\.com\/@([\w.]+)\//)?.[1]?.toLowerCase();
  const author = stats?.author || fromUrl || null;
  if (author && author !== handle) {
    return { ok: false, error: `Cette vidéo est publiée par @${author}, pas par ton compte @${handle}.` };
  }
  const videoId = stats?.videoId ?? url.match(/\/(?:video|photo)\/(\d+)/)?.[1];
  if (!videoId) return { ok: false, error: fetchError ?? "Vidéo introuvable." };

  const { data, error } = await db()
    .from("creator_videos")
    .insert({
      creator_id: creator.id,
      url: stats?.url ?? url,
      video_id: videoId,
      author,
      posted_at: stats?.postedAt ?? null,
      views: stats?.views ?? 0,
      views_checked_at: stats ? new Date().toISOString() : null,
      last_error: fetchError,
    })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.code === "23505" ? "Cette vidéo est déjà enregistrée." : "Enregistrement impossible, réessaie." };
  return { ok: true, video: data as CreatorVideo };
}

/** Re-reads the views of the videos not checked in the last 9 minutes. */
export async function refreshStaleVideos({ limit = 40, concurrency = 5 } = {}) {
  const supabase = db();
  const before = new Date(Date.now() - REFRESH_EVERY_MS).toISOString();
  const { data } = await supabase
    .from("creator_videos")
    .select("id, url, views, author, creator_id, creators(tiktok_handle)")
    .eq("status", "active")
    .or(`views_checked_at.is.null,views_checked_at.lt.${before}`)
    .order("views_checked_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  const queue = [...(data ?? [])];
  let updated = 0;
  let failed = 0;

  async function worker() {
    for (let video = queue.shift(); video; video = queue.shift()) {
      const now = new Date().toISOString();
      try {
        const stats = await fetchVideoStats(video.url);
        const owner = (video.creators as unknown as { tiktok_handle: string } | null)?.tiktok_handle;
        const wrongAuthor = owner && stats.author && stats.author !== normalizeHandle(owner);
        await supabase
          .from("creator_videos")
          .update({
            // TikTok's counts can wobble down a little: never take views back.
            views: Math.max(Number(video.views), stats.views),
            author: stats.author || video.author,
            posted_at: stats.postedAt,
            views_checked_at: now,
            last_error: null,
            ...(wrongAuthor ? { status: "rejected", rejected_reason: `Publiée par @${stats.author}` } : {}),
          })
          .eq("id", video.id);
        updated++;
      } catch (error) {
        await supabase
          .from("creator_videos")
          .update({ views_checked_at: now, last_error: error instanceof Error ? error.message : "Erreur" })
          .eq("id", video.id);
        failed++;
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return { checked: (data ?? []).length, updated, failed };
}

/** Where to pay a creator: set by the creator (by token) or by an admin (by id). */
export async function setPayoutDetails(by: { token: string } | { id: string }, method: string, details: string) {
  if ("token" in by && !UUID.test(by.token)) return false;
  const query = db().from("creators").update({ payout_method: method, payout_details: details });
  const { data, error } = await ("token" in by ? query.eq("token", by.token) : query.eq("id", by.id)).select("id");
  return !error && (data?.length ?? 0) > 0;
}

export async function recordPayout(creatorId: string, amountCents: number, note: string | null) {
  const { error } = await db().from("creator_payouts").insert({ creator_id: creatorId, amount_cents: amountCents, note });
  return !error;
}

export async function setVideoStatus(videoId: string, status: "active" | "rejected", reason: string | null) {
  const { error } = await db()
    .from("creator_videos")
    .update({ status, rejected_reason: status === "rejected" ? reason : null })
    .eq("id", videoId);
  return !error;
}
