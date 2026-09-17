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
    const res = await fetch(safeUrl.toString(), {
      signal: controller.signal,
      headers: { "User-Agent": "SaaSFounderBot/1.0" },
      redirect: "follow",
    });
    clearTimeout(timeout);

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
