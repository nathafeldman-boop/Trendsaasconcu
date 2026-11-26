import { createAdminClient } from "@/lib/supabase/admin";
import { earnedCents, normalizeHandle, parisDay, streak } from "@/lib/creators/program";
import { fetchVideoStats, parseTikTokUrl } from "@/lib/creators/tiktok";

export type Creator = {
  id: string;
  token: string;
  created_at: string;
  name: string;
  tiktok_handle: string;
  instagram_handle: string | null;
  phone: string;
  payout_method: string;
  payout_details: string;
};

export type CreatorVideo = {
  id: string;
  creator_id: string;
  created_at: string;
  url: string;
  platform: "tiktok" | "instagram";
  video_id: string;
  author: string | null;
  posted_at: string | null;
  views: number;
  views_checked_at: string | null;
  last_error: string | null;
  status: "active" | "rejected";
  rejected_reason: string | null;
  /** The other platform's row for the same video (TikTok ↔ Instagram). */
  pair_id: string | null;
};

/**
 * One video, posted on TikTok, Instagram or both. Only the platform with
 * the most views is paid: the two counts are never added.
 */
export type CreatorPost = {
  key: string;
  tiktok: CreatorVideo | null;
  instagram: CreatorVideo | null;
  /** The views paid: the best of the active platforms. */
  views: number;
  counted: "tiktok" | "instagram" | null;
  earnedCents: number;
  postedAt: string;
};

export type CreatorPayout = { id: string; creator_id: string; created_at: string; amount_cents: number; note: string | null };

export type CreatorAccount = Creator & {
  videos: CreatorVideo[];
  posts: CreatorPost[];
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

/** Groups a creator's videos into posts: a TikTok and its Instagram twin are one post. */
export function groupPosts(videos: CreatorVideo[]): CreatorPost[] {
  const groups = new Map<string, CreatorVideo[]>();
  for (const v of videos) {
    const key = v.pair_id ?? v.id;
    groups.set(key, [...(groups.get(key) ?? []), v]);
  }
  const posts = [...groups.entries()].map(([key, rows]) => {
    const tiktok = rows.find((r) => r.platform === "tiktok") ?? null;
    const instagram = rows.find((r) => r.platform === "instagram") ?? null;
    const active = rows.filter((r) => r.status === "active");
    const best = active.reduce<CreatorVideo | null>((top, r) => (!top || Number(r.views) > Number(top.views) ? r : top), null);
    const views = best ? Number(best.views) : 0;
    const postedAt = rows.map((r) => r.posted_at ?? r.created_at).sort()[0];
    return { key, tiktok, instagram, views, counted: best?.platform ?? null, earnedCents: best ? earnedCents(views) : 0, postedAt };
  });
  return posts.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

function account(creator: Creator, videos: CreatorVideo[], payouts: CreatorPayout[]): CreatorAccount {
  const posts = groupPosts(videos);
  const counted = posts.filter((p) => p.counted);
  const views = counted.reduce((sum, p) => sum + p.views, 0);
  // The day each counted post went up (until it is read, the day it was added).
  const run = streak(counted.map((p) => parisDay(p.postedAt)));
  const earned = counted.reduce((sum, p) => sum + p.earnedCents, 0) + run.bonusCents;
  const paid = payouts.reduce((sum, p) => sum + p.amount_cents, 0);
  return { ...creator, videos, posts, payouts, views, streak: run, earnedCents: earned, paidCents: paid, dueCents: Math.max(0, earned - paid) };
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

/** A creator's personal link, from their TikTok handle and phone number (both as given at signup). */
export async function findCreatorToken(handle: string, phone: string) {
  const { data } = await db().from("creators").select("token, phone").ilike("tiktok_handle", handle).limit(1);
  const creator = data?.[0];
  return creator && creator.phone === phone ? (creator.token as string) : null;
}

export async function createCreator(input: Omit<Creator, "id" | "token" | "created_at">) {
  const { data, error } = await db().from("creators").insert(input).select("token").single();
  if (error) return { error: error.code === "23505" ? ("taken" as const) : ("failed" as const) };
  return { token: data.token as string };
}

type AddResult = { ok: true; video: CreatorVideo } | { ok: false; error: string };

const INSTAGRAM_URL = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(reels?|p|tv)\/([\w-]+)/i;

/**
 * Adds an Instagram reel or post. Instagram doesn't let a site read view
 * counts without the account owner's authorisation, so its views are
 * entered by an admin from a screenshot the creator sends.
 */
async function addInstagramVideo(creator: CreatorAccount, rawUrl: string, pairId: string | null): Promise<AddResult> {
  const match = rawUrl.trim().match(INSTAGRAM_URL);
  if (!match) return { ok: false, error: "Colle le lien d'un reel Instagram (instagram.com/reel/…)." };
  const code = match[2];
  const { data, error } = await db()
    .from("creator_videos")
    .insert({
      creator_id: creator.id,
      platform: "instagram",
      url: `https://www.instagram.com/reel/${code}/`,
      video_id: `ig:${code}`,
      author: creator.instagram_handle ? normalizeHandle(creator.instagram_handle) : null,
      views: 0,
      last_error: null,
      pair_id: pairId,
    })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.code === "23505" ? "Ce reel Instagram est déjà enregistré." : "Enregistrement impossible, réessaie." };
  return { ok: true, video: data as CreatorVideo };
}

/**
 * Adds a TikTok video, from any account: creators may post on a second
 * account. The admin sees a warning when it isn't theirs or when its views
 * look suspicious (videoWarnings).
 */
async function addTikTokVideo(creator: CreatorAccount, rawUrl: string, pairId: string | null): Promise<AddResult> {
  const url = parseTikTokUrl(rawUrl);
  if (!url) return { ok: false, error: "Colle le lien d'une vidéo TikTok (tiktok.com/@…/video/…)." };

  let stats: Awaited<ReturnType<typeof fetchVideoStats>> | null = null;
  let fetchError: string | null = null;
  try {
    stats = await fetchVideoStats(url);
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "TikTok illisible";
  }

  const fromUrl = url.match(/tiktok\.com\/@([\w.]+)\//)?.[1]?.toLowerCase();
  const author = stats?.author || fromUrl || null;
  const videoId = stats?.videoId ?? url.match(/\/(?:video|photo)\/(\d+)/)?.[1];
  if (!videoId) return { ok: false, error: fetchError ?? "Vidéo TikTok introuvable." };

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
      pair_id: pairId,
    })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.code === "23505" ? "Cette vidéo TikTok est déjà enregistrée." : "Enregistrement impossible, réessaie." };
  return { ok: true, video: data as CreatorVideo };
}

/** Adds one video from a single link, TikTok or Instagram. */
export async function addCreatorVideo(token: string, rawUrl: string): Promise<AddResult> {
  const creator = await getCreatorAccount(token);
  if (!creator) return { ok: false, error: "Lien créateur invalide." };
  return /instagram\.com/i.test(rawUrl) ? addInstagramVideo(creator, rawUrl, null) : addTikTokVideo(creator, rawUrl, null);
}

type PostResult = { ok: true } | { ok: false; error: string };

/**
 * Adds one video posted on TikTok and/or Instagram (at least one link).
 * With `toPost`, adds the missing platform to a post already there.
 */
export async function addCreatorPost(
  token: string,
  links: { tiktok?: string; instagram?: string },
  toPost?: string
): Promise<PostResult> {
  const creator = await getCreatorAccount(token);
  if (!creator) return { ok: false, error: "Lien créateur invalide." };
  const tiktok = links.tiktok?.trim() ?? "";
  const instagram = links.instagram?.trim() ?? "";
  if (!tiktok && !instagram) return { ok: false, error: "Colle au moins un lien : TikTok ou Instagram." };
  if (tiktok && /instagram\.com/i.test(tiktok)) return { ok: false, error: "Le premier champ attend un lien TikTok." };
  if (instagram && !/instagram\.com/i.test(instagram)) return { ok: false, error: "Le second champ attend un lien Instagram." };

  let pairId: string | null = null;
  if (toPost) {
    const post = creator.posts.find((p) => p.key === toPost);
    if (!post) return { ok: false, error: "Vidéo introuvable." };
    if ((tiktok && post.tiktok) || (instagram && post.instagram)) return { ok: false, error: "Cette vidéo a déjà ce lien." };
    pairId = post.key;
  }

  if (tiktok) {
    const added = await addTikTokVideo(creator, tiktok, pairId);
    if (!added.ok) return added;
    pairId ??= added.video.id;
  }
  if (instagram) {
    const added = await addInstagramVideo(creator, instagram, pairId);
    if (!added.ok) return { ok: false, error: tiktok ? `TikTok ajouté, mais pas l'Instagram : ${added.error}` : added.error };
  }
  return { ok: true };
}

/** Re-reads the views of the videos not checked in the last 9 minutes. */
export async function refreshStaleVideos({ limit = 40, concurrency = 5 } = {}) {
  const supabase = db();
  const before = new Date(Date.now() - REFRESH_EVERY_MS).toISOString();
  const { data } = await supabase
    .from("creator_videos")
    .select("id, url, views, author, creator_id")
    .eq("status", "active")
    .eq("platform", "tiktok")
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
        await supabase
          .from("creator_videos")
          .update({
            // TikTok's counts can wobble down a little: never take views back.
            views: Math.max(Number(video.views), stats.views),
            author: stats.author || video.author,
            posted_at: stats.postedAt,
            views_checked_at: now,
            last_error: null,
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

/** A creator's Instagram account, set by the creator (by token) or an admin (by id). */
export async function setInstagramHandle(by: { token: string } | { id: string }, handle: string | null) {
  if ("token" in by && !UUID.test(by.token)) return false;
  const query = db().from("creators").update({ instagram_handle: handle });
  const { data, error } = await ("token" in by ? query.eq("token", by.token) : query.eq("id", by.id)).select("id");
  return !error && (data?.length ?? 0) > 0;
}

/** Instagram views, entered by an admin. Never lowered by mistake: the new count must be a whole number. */
export async function setManualViews(videoId: string, views: number) {
  const { error } = await db()
    .from("creator_videos")
    .update({ views: Math.max(0, Math.round(views)), views_checked_at: new Date().toISOString(), last_error: null })
    .eq("id", videoId)
    .eq("platform", "instagram");
  return !error;
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

