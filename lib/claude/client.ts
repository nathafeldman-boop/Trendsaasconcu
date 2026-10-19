import Anthropic from "@anthropic-ai/sdk";

// Everything runs on Haiku by default: SaaSFounder directs (ideas, build
// prompts, coaching) while the user's own coding tool does the building, so
// the cheapest model is enough and keeps every user far under budget.
// - GENERATION: the few one-off deliverables (3 ideas, the build prompt).
// - CHAT: the coach and the onboarding idea, called far more often.
// Either can be switched from Vercel without a code change.
export const GENERATION_MODEL = process.env.CLAUDE_GENERATION_MODEL || "claude-haiku-5-5";
export const CHAT_MODEL = process.env.CLAUDE_CHAT_MODEL || "claude-haiku-5-5";

// USD per million tokens (platform.claude.com/docs/en/about-claude/pricing,
// checked 2026-10-18). Haiku 5.5 is the ≤100K-token rate, which every
// request here stays under. Unknown models are billed at the Opus rate so
// the budget errs on the safe side.
const PRICES: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
};

let client: Anthropic | null = null;

/** `null` when ANTHROPIC_API_KEY isn't set — callers fall back to static content. */
export function getClaude(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic();
  return client;
}

type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

/** Cost of one response in USD. Thinking tokens are already part of output_tokens. */
export function costOf(model: string, usage: Usage) {
  const price = PRICES[model] ?? PRICES["claude-opus-5-5"];
  return (
    (usage.input_tokens * price.input +
      usage.output_tokens * price.output +
      (usage.cache_creation_input_tokens ?? 0) * price.cacheWrite +
      (usage.cache_read_input_tokens ?? 0) * price.cacheRead) /
    1_000_000
  );
}

/** First text block of a response, or null. */
export function textOf(content: Array<{ type: string }>) {
  for (const block of content) {
    if (block.type === "text" && "text" in block && typeof block.text === "string") return block.text;
  }
  return null;
}

// Turns a `data:image/...;base64,...` URL (what the browser's FileReader
// produces) into the image block Claude's vision input expects.
export function imageBlockFromDataUrl(dataUrl: string): Anthropic.ImageBlockParam | null {
  const match = /^data:(image\/(?:png|jpeg|gif|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return {
    type: "image",
    source: { type: "base64", media_type: match[1] as "image/png" | "image/jpeg" | "image/gif" | "image/webp", data: match[2] },
  };
}
