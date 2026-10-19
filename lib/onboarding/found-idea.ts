import type { Answers } from "@/components/onboarding/funnel";

// The idea revealed during the onboarding, kept in the wizard's answers as
// JSON (answers.found_idea) until the account exists, then saved as the
// member's idea. Plain TypeScript on purpose: zod stays out of the
// onboarding bundle (the API validates with lib/espace/ideas.ts).

export type FoundIdea = {
  title: string;
  pitch: string;
  target: string;
  problem: string;
  price_per_month: number;
  mvp: string[];
  why_you: string;
  build_time: string;
  first_customers: string;
};

export const FOUND_IDEA_KEY = "found_idea";

/** Answers the idea is built from: the questions asked before it. Nothing else is sent. */
export const IDEA_INPUT_KEYS = [
  "age",
  "experience",
  "currentIncome",
  "platforms",
  "site",
  "dream",
  "dream_libre",
  "brake",
  "brake_libre",
  "persistence",
  "hours",
  "revenueGoal",
  "domain",
  "domain_libre",
  "market",
] as const;

export function ideaInput(answers: Answers) {
  const input: Answers = {};
  for (const key of IDEA_INPUT_KEYS) {
    const value = answers[key];
    if (value !== undefined && value !== "") input[key] = value;
  }
  return input;
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isFoundIdea(value: unknown): value is FoundIdea {
  if (!value || typeof value !== "object") return false;
  const idea = value as Record<string, unknown>;
  return (
    ["title", "pitch", "target", "problem", "why_you", "build_time", "first_customers"].every((key) => isText(idea[key])) &&
    typeof idea.price_per_month === "number" &&
    idea.price_per_month > 0 &&
    Array.isArray(idea.mvp) &&
    idea.mvp.every(isText)
  );
}

export function readFoundIdea(answers: Answers): FoundIdea | null {
  const raw = answers[FOUND_IDEA_KEY];
  if (typeof raw !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isFoundIdea(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Paying customers needed to reach a monthly goal at this price. */
export function customersNeeded(goal: number, price: number) {
  return Math.max(1, Math.ceil(goal / Math.max(1, price)));
}

/** The idea as saved in idea_text, detailed enough for the build prompt. */
export function ideaToText(idea: FoundIdea) {
  return [
    `${idea.title} : ${idea.pitch}`,
    `Cible : ${idea.target}`,
    `Problème résolu : ${idea.problem}`,
    `Prix : ${idea.price_per_month} € par mois`,
    `MVP : ${idea.mvp.join(" ; ")}`,
  ].join("\n");
}
