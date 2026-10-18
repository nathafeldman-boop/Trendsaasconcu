const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-5";
const ANTHROPIC_VERSION = "2023-06-01";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };
type ClaudeMessage = { role: "user" | "assistant"; content: string | ContentBlock[] };

/**
 * Returns `null` when ANTHROPIC_API_KEY isn't set, or on any API error —
 * callers fall back to a static template so the feature still works before
 * a key is added. `system` is Claude's dedicated top-level field, not a
 * message in `messages` — the Messages API rejects a system-role message.
 */
export async function claudeComplete(
  system: string,
  messages: ClaudeMessage[],
  maxTokens = 1024
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("claudeComplete: ANTHROPIC_API_KEY is not set");
    return null;
  }
  if (messages.length === 0 || messages[0].role !== "user") {
    console.error("claudeComplete: messages must start with a user turn");
    return null;
  }

  try {
    const res = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        system,
        messages,
      }),
    });
    if (!res.ok) {
      console.error(`claudeComplete: Claude API returned ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const block = (data.content as Array<{ type: string; text?: string }> | undefined)?.find(
      (b) => b.type === "text"
    );
    return typeof block?.text === "string" ? block.text : null;
  } catch (err) {
    console.error("claudeComplete: request failed", err);
    return null;
  }
}

// Turns a `data:image/...;base64,...` URL (what the browser's FileReader
// produces) into the content block Claude's vision input expects.
export function imageBlockFromDataUrl(dataUrl: string): ContentBlock | null {
  const match = /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { type: "image", source: { type: "base64", media_type: match[1], data: match[2] } };
}
