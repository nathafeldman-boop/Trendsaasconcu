import { z } from "zod";

// The shape of one AI-proposed SaaS idea: the /api/ideas structured output,
// what builder_progress.ai_ideas stores, and what the Création tab renders.

export const IdeaSchema = z.object({
  title: z.string(),
  pitch: z.string(),
  target: z.string(),
  problem: z.string(),
  price_per_month: z.number(),
  mvp: z.array(z.string()),
  why_you: z.string(),
  build_time: z.string(),
  first_customers: z.string(),
});

export const IdeasSchema = z.object({ ideas: z.array(IdeaSchema) });

export type SaasIdea = z.infer<typeof IdeaSchema>;

// Shared with the onboarding, which reveals a first idea before signup.
export { ideaToText } from "@/lib/onboarding/found-idea";
