const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Returns `null` when MISTRAL_API_KEY isn't set, or on any API error —
 * callers fall back to a static template so the feature still works before
 * a key is added.
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
        model: "mistral-small-latest",
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
