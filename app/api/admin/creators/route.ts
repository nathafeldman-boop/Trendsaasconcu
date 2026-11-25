import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/creators/admin-guard";
import { recordPayout, setInstagramHandle, setManualViews, setPayoutDetails, setVideoStatus } from "@/lib/creators/store";
import { cleanInstagram, cleanPayout } from "@/lib/creators/program";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => null);

  if (body?.action === "payout") {
    const amount = Math.round(Number(body.amountCents));
    if (typeof body.creatorId !== "string" || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }
    const note = typeof body.note === "string" ? body.note.slice(0, 200) : null;
    return NextResponse.json({ ok: await recordPayout(body.creatorId, amount, note) });
  }

  if (body?.action === "payout-details" && typeof body.creatorId === "string") {
    const payout = cleanPayout(body.method, body.details);
    if (!payout) return NextResponse.json({ error: "Moyen de paiement invalide" }, { status: 400 });
    return NextResponse.json({ ok: await setPayoutDetails({ id: body.creatorId }, payout.method, payout.details) });
  }

  if (body?.action === "instagram-handle" && typeof body.creatorId === "string") {
    const handle = cleanInstagram(body.handle);
    if (handle === false) return NextResponse.json({ error: "@ Instagram invalide" }, { status: 400 });
    return NextResponse.json({ ok: await setInstagramHandle({ id: body.creatorId }, handle) });
  }

  if (body?.action === "manual-views" && typeof body.videoId === "string") {
    const views = Number(body.views);
    if (!Number.isFinite(views) || views < 0) return NextResponse.json({ error: "Nombre de vues invalide" }, { status: 400 });
    return NextResponse.json({ ok: await setManualViews(body.videoId, views) });
  }

  if (body?.action === "video-status" && typeof body.videoId === "string" && ["active", "rejected"].includes(body.status)) {
    const reason = typeof body.reason === "string" ? body.reason.slice(0, 200) : null;
    return NextResponse.json({ ok: await setVideoStatus(body.videoId, body.status, reason) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
