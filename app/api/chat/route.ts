import { NextResponse } from "next/server";
import { mistralComplete } from "@/lib/mistral/client";

const SYSTEM_PROMPT =
  "Tu es l'assistant de SaaSFounder, une plateforme qui aide des débutants à lancer leur premier SaaS. Réponds en français, de façon concise, concrète et encourageante. Tu n'inventes jamais de chiffres ou de garanties de résultat.";

type IncomingMessage = { role: string; content: string };

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

  const reply = await mistralComplete([{ role: "system", content: SYSTEM_PROMPT }, ...history]);

  if (reply) {
    return NextResponse.json({ reply, source: "mistral" });
  }
  return NextResponse.json({
    reply:
      "L'assistant IA n'est pas encore branché (il manque une clé Mistral côté serveur). En attendant, avance avec le prompt et la checklist fournis.",
    source: "fallback",
  });
}
