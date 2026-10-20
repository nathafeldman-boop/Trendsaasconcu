import { createAdminClient } from "@/lib/supabase/admin";
import { OFFER_MS, type PriceTier } from "@/lib/stripe/plans";

// Server half of the launch offer (the browser half is lib/offer.ts): each
// member's deadline lives in profiles.offer_expires_at, and checkout charges
// the standard prices once it has passed.

// A click that lands just after zero still gets the launch price.
const GRACE_MS = 60_000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The member's offer deadline (epoch ms), or null when it hasn't started.
 * `remainingMs` is what the countdown already running in their browser has
 * left: it can only shorten the offer, never extend it past OFFER_MS. With
 * `start`, a member without a deadline gets one now. Once set, it never moves.
 */
export async function offerDeadline(
  userId: string,
  { remainingMs, start }: { remainingMs?: number | null; start?: boolean }
): Promise<number | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const read = async () => {
    const { data } = await admin.from("profiles").select("offer_expires_at").eq("id", userId).maybeSingle();
    return data?.offer_expires_at ? Date.parse(data.offer_expires_at) : null;
  };

  const existing = await read();
  const hasRemaining = typeof remainingMs === "number" && Number.isFinite(remainingMs);
  if (existing !== null || (!start && !hasRemaining)) return existing;

  const remaining = hasRemaining ? Math.max(-DAY_MS, Math.min(remainingMs, OFFER_MS)) : OFFER_MS;
  // Only while still empty: another tab may have started it in the meantime.
  const { data } = await admin
    .from("profiles")
    .update({ offer_expires_at: new Date(Date.now() + remaining).toISOString() })
    .eq("id", userId)
    .is("offer_expires_at", null)
    .select("offer_expires_at")
    .maybeSingle();
  return data?.offer_expires_at ? Date.parse(data.offer_expires_at) : read();
}

export function priceTier(deadline: number | null): PriceTier {
  return deadline !== null && Date.now() > deadline + GRACE_MS ? "standard" : "launch";
}
