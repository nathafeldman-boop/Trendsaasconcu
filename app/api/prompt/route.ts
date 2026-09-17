import { NextResponse } from "next/server";
import { mistralComplete } from "@/lib/mistral/client";

const TOOL_LABELS: Record<string, string> = {
  claude: "Claude Code",
  replit: "Replit",
  lovable: "Lovable",
  chatgpt: "ChatGPT / Codex",
  grok: "Grok",
};

function fallbackBuildPrompt(idea: string, tool: string) {
  return `Je veux créer un SaaS avec l'idée suivante : "${idea}".

Construis-moi une landing page, un système d'inscription et de connexion, et la page principale de l'application, avec ${tool}.

Contraintes :
- Design moderne et sobre, pas de template générique.
- Mobile-first.
- Un seul appel à l'action clair sur la landing page.
- Un formulaire d'inscription simple (email + mot de passe).

Avant de coder, propose-moi un plan en 5 étapes.`;
}

function fallbackContentIdeas(idea: string) {
  return [
    `Montre en 3 secondes le problème que "${idea}" résout, avant de montrer la solution.`,
    "Filme-toi en train d'utiliser ton propre produit, en story, pas en publicité polie.",
    "Réponds à une critique ou une question fréquente de ton marché, en vidéo courte.",
  ];
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.idea !== "string" || typeof body.kind !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const idea = body.idea.trim().slice(0, 2000);
  const tool = TOOL_LABELS[body.tool as string] ?? "l'outil de ton choix";

  if (body.kind === "content") {
    const completion = await mistralComplete([
      {
        role: "system",
        content:
          "Tu es un coach marketing pour créateurs de SaaS débutants. Réponds en français, en 3 idées de contenu courtes et concrètes pour TikTok/Instagram, une par ligne, sans numérotation ni intro.",
      },
      { role: "user", content: `Mon idée de SaaS : ${idea}` },
    ]);
    if (completion) {
      const ideas = completion
        .split("\n")
        .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
        .filter(Boolean);
      return NextResponse.json({ ideas, source: "mistral" });
    }
    return NextResponse.json({ ideas: fallbackContentIdeas(idea), source: "fallback" });
  }

  const completion = await mistralComplete([
    {
      role: "system",
      content:
        "Tu es un coach technique pour créateurs de SaaS débutants. Écris, en français, un prompt prêt à coller dans un outil de codage IA pour construire une première version du SaaS décrit par l'utilisateur. Sois concret et structuré (contraintes, étapes). Ne réponds qu'avec le prompt, sans commentaire autour.",
    },
    { role: "user", content: `Mon idée : ${idea}\nOutil utilisé : ${tool}` },
  ]);

  if (completion) {
    return NextResponse.json({ prompt: completion.trim(), source: "mistral" });
  }
  return NextResponse.json({ prompt: fallbackBuildPrompt(idea, tool), source: "fallback" });
}
