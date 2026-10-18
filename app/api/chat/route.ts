import { NextResponse } from "next/server";
import { claudeComplete, imageBlockFromDataUrl } from "@/lib/claude/client";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT =
  "Tu es l'assistant de SaaSFounder, une plateforme qui aide des débutants à lancer leur premier SaaS. Réponds en français, de façon concise, concrète et encourageante. Tu n'inventes jamais de chiffres ou de garanties de résultat. On peut te joindre une capture d'écran : décris ce que tu vois et aide à résoudre le problème visible.";

type IncomingMessage = { role: string; content: string };

// A data URL this size is roughly a 4.5 MB image once base64-decoded —
// plenty for a screenshot, small enough to not blow up the request body.
const MAX_IMAGE_DATA_URL_LENGTH = 6_000_000;

export async function POST(request: Request) {
  // Every call spends Claude credits — only signed-in users may trigger one.
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const history = (body.messages as unknown[])
    .filter((m): m is IncomingMessage => !!m && typeof m === "object" && "role" in m && "content" in m)
    .slice(-10)
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content).slice(0, 2000),
    }));

  // The widget's static opening greeting is an assistant turn with nothing
  // before it — Claude's API requires the conversation to start on "user".
  const firstUserIndex = history.findIndex((m) => m.role === "user");
  const trimmedHistory = firstUserIndex === -1 ? [] : history.slice(firstUserIndex);

  const image =
    typeof body.image === "string" &&
    body.image.startsWith("data:image/") &&
    body.image.length <= MAX_IMAGE_DATA_URL_LENGTH
      ? body.image
      : null;
  const imageBlock = image ? imageBlockFromDataUrl(image) : null;

  const claudeMessages = trimmedHistory.map((m, i) => {
    if (i === trimmedHistory.length - 1 && imageBlock) {
      return { role: m.role, content: [{ type: "text" as const, text: m.content }, imageBlock] };
    }
    return { role: m.role, content: m.content };
  });

  const reply = trimmedHistory.length > 0 ? await claudeComplete(SYSTEM_PROMPT, claudeMessages) : null;

  if (reply) {
    return NextResponse.json({ reply, source: "claude" });
  }
  return NextResponse.json({
    reply:
      "L'assistant IA n'est pas encore branché (il manque une clé Claude côté serveur). En attendant, avance avec le prompt et la checklist fournis.",
    source: "fallback",
  });
}
