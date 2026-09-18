const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: string };
type ChatMessage = { role: "system" | "user" | "assistant"; content: string | ContentPart[] };

function hasImage(messages: ChatMessage[]) {
  return messages.some(
    (m) => Array.isArray(m.content) && m.content.some((p) => p.type === "image_url")
  );
}

/**
 * Returns `null` when MISTRAL_API_KEY isn't set, or on any API error —
 * callers fall back to a static template so the feature still works before
 * a key is added. Switches to Mistral's vision-capable model when a message
 * includes an image_url part; the plain text model doesn't accept those.
 */
export async function mistralComplete(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: hasImage(messages) ? "pixtral-12b-2409" : "mistral-small-latest",
        messages,
        temperature: 0.6,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
