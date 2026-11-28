// The creator program's terms, shared by the signup page, the creator's own
// page and the admin. Change the rate here: everything is computed from it.

/** The creators' Discord: ideas of videos, examples, questions. */
export const CREATORS_DISCORD_URL = "https://discord.gg/zqjKDH3yU";

/** What a creator earns, in euro cents, per 1 000 views. */
export const RATE_CENTS_PER_1000_VIEWS = 100;

export const PAYOUT_METHODS = [
  { id: "paypal", label: "PayPal", placeholder: "ton e-mail PayPal" },
  { id: "iban", label: "Virement (IBAN)", placeholder: "FR76 …" },
  { id: "revolut", label: "Revolut", placeholder: "@ton-revtag ou numéro" },
  { id: "lydia", label: "Lydia / Wero", placeholder: "ton numéro" },
] as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[number]["id"];

export function payoutLabel(id: string) {
  if (!id) return "à renseigner";
  return PAYOUT_METHODS.find((m) => m.id === id)?.label ?? id;
}

/** Optional at signup: both empty, or a known method with details. Null when invalid. */
export function cleanPayout(method: unknown, details: unknown): { method: string; details: string } | null {
  const m = typeof method === "string" ? method.trim().slice(0, 20) : "";
  const d = typeof details === "string" ? details.trim().slice(0, 120) : "";
  if (!m && !d) return { method: "", details: "" };
  if (!PAYOUT_METHODS.some((x) => x.id === m) || d.length < 3) return null;
  return { method: m, details: d };
}

/** One-off bonuses per video, on top of the per-view pay, when it crosses each threshold. */
export const BONUSES = [
  { views: 100_000, cents: 2000 },
  { views: 500_000, cents: 2000 },
  { views: 1_000_000, cents: 5000 },
] as const;

export function viewCents(views: number) {
  return Math.floor((Math.max(0, views) * RATE_CENTS_PER_1000_VIEWS) / 1000);
}

export function bonusCents(views: number) {
  return BONUSES.reduce((sum, b) => (views >= b.views ? sum + b.cents : sum), 0);
}

/** What one video earns: its views plus the bonuses it has reached. */
export function earnedCents(views: number) {
  return viewCents(views) + bonusCents(views);
}

/** Paid once for every calendar month with at least one video posted each day. */
export const STREAK_BONUS_CENTS = 3000;

/** A date as YYYY-MM-DD in Paris time. */
export function parisDay(date: Date | string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date(date));
}

function daysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Days a creator may miss each month (sick, busy) without losing the streak or the month's bonus. */
export const STREAK_JOKERS_PER_MONTH = 2;

/**
 * The posting streak, from the days (Paris time) the creator's videos were
 * published. Each month, up to STREAK_JOKERS_PER_MONTH missed days are
 * forgiven automatically: the run goes on, and the month still counts as
 * complete (one bonus each).
 */
export function streak(postedDays: string[], today = parisDay(new Date())) {
  const days = new Set(postedDays);
  const byMonth = new Map<string, number>();
  for (const d of days) byMonth.set(d.slice(0, 7), (byMonth.get(d.slice(0, 7)) ?? 0) + 1);
  const thisMonthKey = today.slice(0, 7);
  const completedMonths = [...byMonth]
    .filter(([month, count]) => month < thisMonthKey && count >= daysInMonth(month) - STREAK_JOKERS_PER_MONTH)
    .map(([month]) => month);

  // Consecutive days up to today (or yesterday, if nothing is posted yet
  // today), a missed day using one of that month's jokers.
  const first = [...days].sort()[0];
  const jokersUsed = new Map<string, number>();
  let current = 0;
  const cursor = new Date(`${today}T12:00:00Z`);
  if (!days.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (first) {
    const day = cursor.toISOString().slice(0, 10);
    if (day < first) break;
    if (days.has(day)) current++;
    else {
      const month = day.slice(0, 7);
      const used = jokersUsed.get(month) ?? 0;
      if (used >= STREAK_JOKERS_PER_MONTH) break;
      jokersUsed.set(month, used + 1);
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  // Missed days this month, counted from their first video only.
  const dayOfMonth = Number(today.slice(8, 10));
  const startDay = !first || first.slice(0, 7) > thisMonthKey ? dayOfMonth : first.slice(0, 7) === thisMonthKey ? Number(first.slice(8, 10)) : 1;
  let missedThisMonth = 0;
  for (let d = startDay; d < dayOfMonth; d++) if (!days.has(`${thisMonthKey}-${String(d).padStart(2, "0")}`)) missedThisMonth++;
  return {
    completedMonths,
    bonusCents: completedMonths.length * STREAK_BONUS_CENTS,
    current,
    thisMonth: byMonth.get(thisMonthKey) ?? 0,
    daysInThisMonth: daysInMonth(thisMonthKey),
    postedToday: days.has(today),
    jokersLeft: Math.max(0, STREAK_JOKERS_PER_MONTH - missedThisMonth),
    // Still possible this month: no more past days missed than the jokers cover.
    stillPossible: missedThisMonth <= STREAK_JOKERS_PER_MONTH,
  };
}

export function bonusLabel() {
  const short = (v: number) => (v >= 1_000_000 ? `${v / 1_000_000} M` : `${v / 1000} k`);
  return BONUSES.map((b) => `+${formatEuros(b.cents)} à ${short(b.views)} vues`).join(", ");
}

export function formatEuros(cents: number) {
  const digits = cents % 100 === 0 ? 0 : 2;
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatViews(views: number) {
  return Math.max(0, views).toLocaleString("fr-FR");
}

export function rateLabel() {
  return `${formatEuros(RATE_CENTS_PER_1000_VIEWS)} pour 1 000 vues`;
}

/** An optional Instagram handle: "" or null when left empty, false when invalid. */
export function cleanInstagram(raw: unknown): string | null | false {
  const handle = typeof raw === "string" ? normalizeHandle(raw.slice(0, 40)) : "";
  if (!handle) return null;
  return /^[\w.]{1,30}$/.test(handle) ? handle : false;
}

/** A plausible email address, lowercased; null otherwise. */
export function cleanEmail(raw: unknown) {
  const email = typeof raw === "string" ? raw.trim().toLowerCase().slice(0, 200) : "";
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(email) ? email : null;
}

/** "@Name.Here " → "name.here": TikTok handles are case-insensitive. */
export function normalizeHandle(raw: string) {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

/** French numbers to +33…, anything else kept as typed digits with its +. Null if not a phone number. */
export function normalizePhone(raw: string) {
  const compact = raw.replace(/[\s.\-()]/g, "");
  let phone = compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
  if (/^0[1-9]\d{8}$/.test(phone)) phone = `+33${phone.slice(1)}`;
  return /^\+\d{8,15}$/.test(phone) ? phone : null;
}

export function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/^\+/, "")}`;
}

/** A view rate above this is flagged for a human look. */
const SUSPICIOUS_VIEWS_PER_HOUR = 10_000;

/**
 * Why an admin should look at a video before paying it: posted by another
 * account than the creator's, or views coming in suspiciously fast (bought
 * views). Never blocks anything on its own.
 */
export function videoWarnings(
  video: { platform: string; author: string | null; views: number | string; posted_at: string | null; created_at: string },
  creatorHandle: string, now = Date.now()) {
  const warnings: string[] = [];
  if (video.platform !== "instagram" && video.author && video.author !== normalizeHandle(creatorHandle)) {
    warnings.push(`Publiée par @${video.author}, pas par son compte @${normalizeHandle(creatorHandle)}`);
  }
  const since = Date.parse(video.posted_at ?? video.created_at);
  const hours = Math.max((now - since) / 3_600_000, 0.25);
  const views = Number(video.views);
  if (views >= 5_000 && views / hours >= SUSPICIOUS_VIEWS_PER_HOUR) {
    warnings.push(`${Math.round(views / hours).toLocaleString("fr-FR")} vues/heure depuis la publication : possibles vues achetées`);
  }
  return warnings;
}
