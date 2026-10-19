import type { Answers } from "@/components/onboarding/funnel";
import { ideaInput, isFoundIdea, type FoundIdea } from "@/lib/onboarding/found-idea";

export type IdeaResult = { idea: FoundIdea; source: string };

let pending: { key: string; promise: Promise<IdeaResult | null> } | null = null;

/**
 * Asks /api/onboarding/idea for an idea, or returns the request already in
 * flight for the same answers: the loading screen starts it so the reveal
 * right after doesn't wait. Resolves to null only on a network failure
 * (the API falls back to its own library otherwise).
 */
export function requestIdea(answers: Answers, exclude?: string) {
  const input = ideaInput(answers);
  const key = JSON.stringify([input, exclude ?? null]);
  if (pending?.key === key) return pending.promise;

  const promise = fetch("/api/onboarding/idea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: input, exclude }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => (data && isFoundIdea(data.idea) ? { idea: data.idea as FoundIdea, source: String(data.source) } : null))
    .catch(() => null)
    .then((result) => {
      // A failed request isn't kept, so "Réessayer" asks again.
      if (!result && pending?.key === key) pending = null;
      return result;
    });
  pending = { key, promise };
  return promise;
}
