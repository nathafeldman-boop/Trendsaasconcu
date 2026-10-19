"use client";

// Writes the demo coach conversation before the chat (client-only) reads
// it on its first render.
export function SeedStorage({ storageKey, value }: { storageKey: string; value: string }) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, value);
  return null;
}
