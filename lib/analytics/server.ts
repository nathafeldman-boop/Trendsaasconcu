import { createAdminClient } from "@/lib/supabase/admin";

// Server-side half of the analytics: events the browser can't be trusted
// with or never sees (a confirmed payment, a canceled subscription).

export type EventRow = {
  name: string;
  anon_id?: string | null;
  user_id?: string | null;
  session_id?: string | null;
  path?: string | null;
  props?: Record<string, unknown>;
  source?: string | null;
  device?: "mobile" | "tablet" | "desktop" | null;
  country?: string | null;
};

/** Never throws: analytics must not break the request it describes. */
export async function logEvent(row: EventRow) {
  const admin = createAdminClient();
  if (!admin) return;
  const { error } = await admin.from("events").insert({ props: {}, ...row });
  if (error) console.error(`logEvent ${row.name} failed:`, error.message);
}

export function deviceFromUserAgent(ua: string): EventRow["device"] {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "mobile";
  return "desktop";
}

const IN_APP: [RegExp, string][] = [
  [/musical_ly|BytedanceWebview|TikTok|trill_/i, "tiktok"],
  [/Instagram/i, "instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, "facebook"],
  [/Snapchat/i, "snapchat"],
  [/LinkedInApp/i, "linkedin"],
  [/Twitter/i, "x"],
];

/** The app whose built-in browser this is (TikTok, Instagram...), if any. */
export function inAppBrowser(ua: string) {
  return IN_APP.find(([pattern]) => pattern.test(ua))?.[1] ?? null;
}

export const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless|lighthouse|vercel-screenshot|facebookexternalhit/i;
