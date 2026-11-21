import { NextResponse } from "next/server";
import { refreshStaleVideos } from "@/lib/creators/store";

// Called every 10 minutes by pg_cron (migration 0019), and by the admin's
// "Actualiser" button. Safe to call by anyone: it only re-reads videos not
// checked in the last 9 minutes, so calling it more often does nothing.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const result = await refreshStaleVideos();
  return NextResponse.json(result);
}
