import { NextResponse } from "next/server";
import { stopCreatorReminders } from "@/lib/creators/store";

// The "stop the reminders" link in every creator reminder.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const ok = await stopCreatorReminders(token);
  const message = ok
    ? "C'est noté : tu ne recevras plus de rappels. Tu peux les réactiver en enregistrant ton email sur ta page créateur."
    : "Lien invalide.";
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Rappels</title><body style="font-family:system-ui;max-width:480px;margin:60px auto;padding:0 20px;line-height:1.5"><p>${message}</p></body>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
