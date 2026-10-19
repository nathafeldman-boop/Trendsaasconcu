import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Email + password sign-up without the confirmation email: the account is
// created already confirmed, then the browser signs in with the same
// credentials. Also sidesteps Supabase's built-in mail sender, which only
// allows a few emails an hour and was blocking sign-ups.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Supabase's own sign-up endpoint is rate limited; the admin API isn't, so
// cap account creation per IP (per server instance, enough against a script).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  if (attempts.size > 5000) {
    for (const [key, entry] of attempts) if (entry.resetAt < now) attempts.delete(key);
  }
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const firstName = typeof body?.firstName === "string" ? body.firstName.trim().slice(0, 60) : "";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  // bcrypt only reads the first 72 bytes of a password.
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName },
  });
  if (error) {
    if (error.code === "email_exists" || /already (been )?registered/i.test(error.message)) {
      return NextResponse.json({ error: "exists" }, { status: 409 });
    }
    if (error.code === "weak_password") {
      return NextResponse.json({ error: "weak_password" }, { status: 400 });
    }
    console.error("auth/signup: createUser failed:", error.code, error.message);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
