import { NextResponse } from "next/server";
import { addCreatorVideo } from "@/lib/creators/store";

export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const url = typeof body?.url === "string" ? body.url.slice(0, 500) : "";
  const result = await addCreatorVideo(token, url);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ video: result.video });
}
