import { NextResponse } from "next/server";
import { setPayoutDetails } from "@/lib/creators/store";
import { cleanPayout } from "@/lib/creators/program";

// A creator adds or changes where to pay them, from their personal page.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const payout = cleanPayout(body?.method, body?.details);
  if (!payout || !payout.method) return NextResponse.json({ error: "Choisis un moyen de paiement et indique tes coordonnées." }, { status: 400 });
  if (!(await setPayoutDetails({ token }, payout.method, payout.details))) {
    return NextResponse.json({ error: "Lien créateur invalide." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
