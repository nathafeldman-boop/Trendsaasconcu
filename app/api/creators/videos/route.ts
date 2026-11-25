import { NextResponse } from "next/server";
import { addCreatorPost } from "@/lib/creators/store";

export const maxDuration = 30;

const text = (value: unknown) => (typeof value === "string" ? value.slice(0, 500) : "");

// One video, with its TikTok link, its Instagram link or both. `post` adds
// the missing link to a video already there. A lone `url` (older pages)
// goes to the field that matches its site.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = text(body?.token);
  const url = text(body?.url);
  const links = url
    ? /instagram\.com/i.test(url)
      ? { instagram: url }
      : { tiktok: url }
    : { tiktok: text(body?.tiktok), instagram: text(body?.instagram) };
  const post = text(body?.post) || undefined;
  const result = await addCreatorPost(token, links, post);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
