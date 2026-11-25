import { NextResponse } from "next/server";
import { findCreatorToken } from "@/lib/creators/store";
import { normalizeHandle, normalizePhone } from "@/lib/creators/program";

// A creator who lost their personal link gets it back with their TikTok
// handle and phone number. Limited per IP so it can't be used to guess.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  if (attempts.size > 5000) for (const [key, entry] of attempts) if (entry.resetAt < now) attempts.delete(key);
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "Trop d'essais. Réessaie dans 15 minutes." }, { status: 429 });
  const body = await request.json().catch(() => null);
  const handle = normalizeHandle(typeof body?.tiktok === "string" ? body.tiktok.slice(0, 40) : "");
  const phone = normalizePhone(typeof body?.phone === "string" ? body.phone.slice(0, 30) : "");
  if (!handle || !phone) return NextResponse.json({ error: "Indique ton @ TikTok et ton numéro." }, { status: 400 });
  const token = await findCreatorToken(handle, phone);
  if (!token) {
    return NextResponse.json(
      { error: "Aucun espace ne correspond. Vérifie ton @ TikTok et le numéro donné à l'inscription, ou écris-nous." },
      { status: 404 }
    );
  }
  return NextResponse.json({ token });
}
