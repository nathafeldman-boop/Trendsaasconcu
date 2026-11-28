import { NextResponse } from "next/server";
import { setCreatorEmail } from "@/lib/creators/store";
import { cleanEmail } from "@/lib/creators/program";

// A creator adds or changes their email from their personal page.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const email = cleanEmail(body?.email);
  if (!email) return NextResponse.json({ error: "Ton email n'a pas l'air valide." }, { status: 400 });
  if (!(await setCreatorEmail(token, email))) return NextResponse.json({ error: "Lien créateur invalide." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
