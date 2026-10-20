import { NextResponse } from "next/server";
import { getAuth } from "@/lib/supabase/auth";
import { offerDeadline } from "@/lib/stripe/offer";

// Keeps the pricing cards' countdown in step with the deadline checkout
// enforces: the browser sends what its countdown has left (or asks to start
// one), and gets back the account's deadline, which wins from then on.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { user } = await getAuth();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const deadline = await offerDeadline(user.id, {
    remainingMs: typeof body?.remainingMs === "number" ? body.remainingMs : null,
    start: body?.start === true,
  });
  // Relative to now, so a browser with its clock off still counts right.
  return NextResponse.json({ remainingMs: deadline === null ? null : deadline - Date.now() });
}
