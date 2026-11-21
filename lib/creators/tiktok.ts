// Reads a public TikTok video's view count from its page, the way a browser
// sees it: TikTok embeds the video's data as JSON in the HTML. No API key,
// but TikTok can change that page at any time; failures are reported, never
// turned into zero views.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export type VideoStats = { videoId: string; author: string; views: number; postedAt: string | null; url: string };

const VIDEO_URL = /^https:\/\/(?:www\.|m\.)?tiktok\.com\/@([\w.]+)\/(?:video|photo)\/(\d+)/;
const SHORT_URL = /^https:\/\/(?:vm\.tiktok\.com|vt\.tiktok\.com|(?:www\.)?tiktok\.com\/t)\/[\w-]+\/?/;

/** A tiktok.com video link (short links included), or null. */
export function parseTikTokUrl(raw: string): string | null {
  let url = raw.trim();
  if (!/^https?:\/\//.test(url)) url = `https://${url}`;
  url = url.replace(/^http:/, "https:");
  if (VIDEO_URL.test(url) || SHORT_URL.test(url)) return url;
  return null;
}

/** Follows short links (vm.tiktok.com/…) to the full video URL. */
async function resolve(url: string) {
  const match = url.match(VIDEO_URL);
  if (match) return { url: `https://www.tiktok.com/@${match[1]}/video/${match[2]}`, videoId: match[2] };
  const res = await fetch(url, { redirect: "follow", headers: { "user-agent": UA }, signal: AbortSignal.timeout(10_000) });
  const full = res.url.match(VIDEO_URL);
  if (!full) throw new Error("Lien TikTok introuvable");
  return { url: `https://www.tiktok.com/@${full[1]}/video/${full[2]}`, videoId: full[2] };
}

export async function fetchVideoStats(rawUrl: string): Promise<VideoStats> {
  const { url, videoId } = await resolve(rawUrl);
  const res = await fetch(url, {
    headers: { "user-agent": UA, "accept-language": "fr-FR,fr;q=0.9,en;q=0.8" },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`TikTok a répondu ${res.status}`);
  const html = await res.text();

  const script = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (!script) throw new Error("Page TikTok illisible (bloquée ou modifiée)");
  const data = JSON.parse(script[1]);
  const detail = data?.__DEFAULT_SCOPE__?.["webapp.video-detail"];
  const item = detail?.itemInfo?.itemStruct;
  if (!item) throw new Error(detail?.statusCode === 10204 ? "Vidéo supprimée ou privée" : "Vidéo introuvable");

  const views = Number(item.statsV2?.playCount ?? item.stats?.playCount);
  if (!Number.isFinite(views)) throw new Error("Nombre de vues introuvable");
  const created = Number(item.createTime);
  return {
    videoId: String(item.id ?? videoId),
    author: String(item.author?.uniqueId ?? "").toLowerCase(),
    views,
    postedAt: Number.isFinite(created) && created > 0 ? new Date(created * 1000).toISOString() : null,
    url,
  };
}
