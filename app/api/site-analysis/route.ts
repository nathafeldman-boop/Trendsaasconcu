import { NextResponse } from "next/server";

const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[?::1\]?$/,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^\[?f[cd][0-9a-f]{2}:/i,
  /^\[?fe80:/i,
  /^\[?::ffff:/i,
  /^\d+$/,
  /^0x/i,
  /\.(internal|local|localhost)$/i,
];

function isSafeUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(url.hostname))) return null;
  return url;
}

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const safeUrl = isSafeUrl(target);
  if (!safeUrl) {
    return NextResponse.json({ reachable: false });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    // Redirects are followed by hand, each hop checked like the first, so a
    // public page can't bounce the request to an internal address.
    let url: URL | null = safeUrl;
    let res: Response | null = null;
    for (let hop = 0; hop < 4 && url; hop++) {
      res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { "User-Agent": "SaaSFounderBot/1.0" },
        redirect: "manual",
      });
      const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
      if (!location) break;
      url = isSafeUrl(new URL(location, url).toString());
      res = null;
    }
    clearTimeout(timeout);
    if (!res) {
      return NextResponse.json({ reachable: false });
    }

    if (!res.ok) {
      return NextResponse.json({ reachable: false });
    }

    const html = await res.text();
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null;
    const description =
      html
        .match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
        ?.trim() || null;

    return NextResponse.json({ reachable: true, title, description });
  } catch {
    return NextResponse.json({ reachable: false });
  }
}
