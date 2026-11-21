import { NextResponse } from "next/server";
import { createCreator } from "@/lib/creators/store";
import { normalizeHandle, normalizePhone, PAYOUT_METHODS } from "@/lib/creators/program";

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = text(body?.name, 80);
  const handle = normalizeHandle(text(body?.tiktok, 40));
  const phone = normalizePhone(text(body?.phone, 30));
  const method = text(body?.payoutMethod, 20);
  const details = text(body?.payoutDetails, 120);

  if (!name) return NextResponse.json({ error: "Indique ton nom." }, { status: 400 });
  if (!/^[\w.]{2,24}$/.test(handle)) return NextResponse.json({ error: "Ton @ TikTok n'a pas l'air valide." }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Ton numéro n'a pas l'air valide (ex. 06 12 34 56 78)." }, { status: 400 });
  if (!PAYOUT_METHODS.some((m) => m.id === method) || details.length < 3) {
    return NextResponse.json({ error: "Dis-nous où te payer." }, { status: 400 });
  }
  if (body?.consent !== true || body?.disclosure !== true) {
    return NextResponse.json({ error: "Coche les deux cases pour continuer." }, { status: 400 });
  }

  const result = await createCreator({ name, tiktok_handle: handle, phone, payout_method: method, payout_details: details });
  if ("error" in result) {
    return NextResponse.json(
      {
        error:
          result.error === "taken"
            ? `@${handle} est déjà inscrit. Retrouve ton lien perso dans le message qu'on t'a envoyé, ou écris-nous.`
            : "Inscription impossible pour le moment, réessaie.",
      },
      { status: result.error === "taken" ? 409 : 500 }
    );
  }
  return NextResponse.json({ token: result.token });
}
