import Anthropic from "@anthropic-ai/sdk";
import { GENERATION_MODEL, getClaude } from "@/lib/claude/client";

// One-off generations (GENERATION_MODEL). Server-side fallbacks are on:
// if the model declines a request, the API re-runs it on another model in
// the same call instead of returning nothing. Should the API ever reject the
// fallback parameter, the request is retried once without it.

type CreateParams = Omit<Anthropic.Beta.Messages.MessageCreateParamsNonStreaming, "model" | "betas" | "fallbacks">;
type ParseParams = Omit<Parameters<Anthropic["beta"]["messages"]["parse"]>[0], "model" | "betas" | "fallbacks">;

function withFallbacks() {
  return { betas: ["server-side-fallback-2026-07-01"] as Anthropic.Beta.AnthropicBeta[], fallbacks: "default" as const };
}

export async function generate(params: CreateParams) {
  const claude = getClaude();
  if (!claude) return null;
  try {
    return await claude.beta.messages.create({ ...params, model: GENERATION_MODEL, ...withFallbacks() });
  } catch (error) {
    if (error instanceof Anthropic.BadRequestError) {
      console.error("generate: retrying without server-side fallbacks:", error.message);
      return await claude.beta.messages.create({ ...params, model: GENERATION_MODEL });
    }
    throw error;
  }
}

/** Structured output; callers re-validate parsed_output with their zod schema. */
export async function generateParsed(params: ParseParams) {
  const claude = getClaude();
  if (!claude) return null;
  try {
    return await claude.beta.messages.parse({ ...params, model: GENERATION_MODEL, ...withFallbacks() });
  } catch (error) {
    if (error instanceof Anthropic.BadRequestError) {
      console.error("generateParsed: retrying without server-side fallbacks:", error.message);
      return await claude.beta.messages.parse({ ...params, model: GENERATION_MODEL });
    }
    throw error;
  }
}
