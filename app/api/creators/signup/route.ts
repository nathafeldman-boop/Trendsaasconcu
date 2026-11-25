import { NextResponse } from "next/server";
import { createCreator } from "@/lib/creators/store";
import { cleanInstagram, cleanPayout, normalizeHandle, normalizePhone } from "@/lib/creators/program";

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = text(body?.name, 80);
  const handle = normalizeHandle(text(body?.tiktok, 40));
  const phone = normalizePhone(text(body?.phone, 30));
  // Where to pay them is optional: it can be added later, by them or by us.
  const payout = cleanPayout(body?.payoutMethod, body?.payoutDetails);

  if (!name) return NextResponse.json({ error: "Indique ton nom." }, { status: 400 });
  if (!/^[\w.]{2,24}$/.test(handle)) return NextResponse.json({ error: "Ton @ TikTok n'a pas l'air valide." }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Ton numéro n'a pas l'air valide (ex. 06 12 34 56 78)." }, { status: 400 });
  const instagram = cleanInstagram(body?.instagram);
  if (instagram === false) return NextResponse.json({ error: "Ton @ Instagram n'a pas l'air valide." }, { status: 400 });
  if (!payout) {
    return NextResponse.json({ error: "Complète tes coordonnées de paiement, ou laisse-les vides pour l'instant." }, { status: 400 });
  }
  if (body?.consent !== true || body?.disclosure !== true) {
    return NextResponse.json({ error: "Coche les deux cases pour continuer." }, { status: 400 });
  }

  const result = await createCreator({ name, tiktok_handle: handle, instagram_handle: instagram, phone, payout_method: payout.method, payout_details: payout.details });
  if ("error" in result) {
    return NextResponse.json(
      {
        error:
          result.error === "taken"
            ? `@${handle} est déjà inscrit. Utilise « Déjà inscrit ? » plus haut pour retrouver ton espace avec ton numéro.`
            : "Inscription impossible pour le moment, réessaie.",
      },
      { status: result.error === "taken" ? 409 : 500 }
    );
  }
  return NextResponse.json({ token: result.token });
}
