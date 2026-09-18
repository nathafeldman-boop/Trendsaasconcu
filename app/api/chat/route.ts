import { NextResponse } from "next/server";
import { mistralComplete } from "@/lib/mistral/client";

const SYSTEM_PROMPT =
  "Tu es l'assistant de SaaSFounder, une plateforme qui aide des débutants à lancer leur premier SaaS. Réponds en français, de façon concise, concrète et encourageante. Tu n'inventes jamais de chiffres ou de garanties de résultat. On peut te joindre une capture d'écran : décris ce que tu vois et aide à résoudre le problème visible.";

type IncomingMessage = { role: string; content: string };

// A data URL this size is roughly a 4.5 MB image once base64-decoded —
// plenty for a screenshot, small enough to not blow up the request body.
const MAX_IMAGE_DATA_URL_LENGTH = 6_000_000;

export async function POST(request: Request) {
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

  const image =
    typeof body.image === "string" &&
    body.image.startsWith("data:image/") &&
    body.image.length <= MAX_IMAGE_DATA_URL_LENGTH
      ? body.image
      : null;

  const mistralMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.slice(0, -1),
    ...(history.length > 0
      ? [
          {
            role: "user" as const,
            content: image
              ? [
                  { type: "text" as const, text: history[history.length - 1].content },
                  { type: "image_url" as const, image_url: image },
                ]
              : history[history.length - 1].content,
          },
        ]
      : []),
  ];

  const reply = await mistralComplete(mistralMessages);

  if (reply) {
    return NextResponse.json({ reply, source: "mistral" });
  }
  return NextResponse.json({
    reply:
      "L'assistant IA n'est pas encore branché (il manque une clé Mistral côté serveur). En attendant, avance avec le prompt et la checklist fournis.",
    source: "fallback",
  });
}
