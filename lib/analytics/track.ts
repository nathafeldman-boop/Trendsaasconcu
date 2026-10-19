// Browser half of the analytics: who this visitor is (a random id kept in
// localStorage, so their journey before and after signing up connects),
// where they first came from, and a fire-and-forget event sender. The server
// adds the account, country and device (app/api/track/route.ts).

const ANON_KEY = "sf_aid";
const SOURCE_KEY = "sf_src";
const SESSION_KEY = "sf_sid";
const SESSION_IDLE_MS = 30 * 60 * 1000;

function store(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
}

let memoryAnonId: string | null = null;

function anonId() {
  const local = store("local");
  const existing = local?.getItem(ANON_KEY);
  if (existing) return existing;
  memoryAnonId ??= newId();
  local?.setItem(ANON_KEY, memoryAnonId);
  return memoryAnonId;
}

/** A new session after 30 minutes without any event. */
function sessionId() {
  const session = store("session");
  const now = Date.now();
  const [id, last] = (session?.getItem(SESSION_KEY) ?? "").split("|");
  const current = id && now - Number(last) < SESSION_IDLE_MS ? id : newId();
  session?.setItem(SESSION_KEY, `${current}|${now}`);
  return current;
}

const REFERRER_SOURCES: [RegExp, string][] = [
  [/tiktok\./, "tiktok"],
  [/instagram\./, "instagram"],
  [/facebook\.|fb\.me/, "facebook"],
  [/(^|\.)t\.co$|twitter\.|(^|\.)x\.com$/, "x"],
  [/youtube\.|youtu\.be/, "youtube"],
  [/linkedin\./, "linkedin"],
  [/snapchat\./, "snapchat"],
  [/google\./, "google"],
  [/bing\./, "bing"],
];

const IN_APP_SOURCES: [RegExp, string][] = [
  [/musical_ly|BytedanceWebview|TikTok|trill_/i, "tiktok"],
  [/Instagram/i, "instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, "facebook"],
  [/Snapchat/i, "snapchat"],
  [/LinkedInApp/i, "linkedin"],
];

/** First-touch source, decided on the visitor's first page and kept. */
function source() {
  const local = store("local");
  const saved = local?.getItem(SOURCE_KEY);
  if (saved) return saved;

  const params = new URLSearchParams(window.location.search);
  let found = (params.get("utm_source") || params.get("ref") || params.get("source") || "").trim().toLowerCase();
  if (!found) found = IN_APP_SOURCES.find(([pattern]) => pattern.test(navigator.userAgent))?.[1] ?? "";
  if (!found && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host !== window.location.hostname.replace(/^www\./, "")) {
        found = REFERRER_SOURCES.find(([pattern]) => pattern.test(host))?.[1] ?? host;
      }
    } catch {
      // unreadable referrer
    }
  }
  const value = (found || "direct").slice(0, 100);
  local?.setItem(SOURCE_KEY, value);
  return value;
}

export function track(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // The team's own visits to the dashboard aren't part of the funnel.
  if (window.location.pathname.startsWith("/admin")) return;
  try {
    const body = JSON.stringify({
      name,
      props,
      anonId: anonId(),
      sessionId: sessionId(),
      path: window.location.pathname,
      source: source(),
    });
    // keepalive: the event still goes out when the click navigates away.
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
      () => {}
    );
  } catch {
    // analytics never breaks the page
  }
}
