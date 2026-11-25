import { NextResponse } from "next/server";
import { setInstagramHandle } from "@/lib/creators/store";
import { cleanInstagram } from "@/lib/creators/program";

// A creator adds or changes their Instagram account from their personal page.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const handle = cleanInstagram(body?.handle);
  if (!handle) return NextResponse.json({ error: "Ton @ Instagram n'a pas l'air valide." }, { status: 400 });
  if (!(await setInstagramHandle({ token }, handle))) return NextResponse.json({ error: "Lien créateur invalide." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
