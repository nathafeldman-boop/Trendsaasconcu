import { useSyncExternalStore } from "react";
import { OFFER_MS } from "@/lib/stripe/plans";

// Browser half of the launch offer (the server half is lib/stripe/offer.ts):
// the countdown on the pricing cards. It starts the first time the cards
// are seen and is kept in localStorage, so a reload or another page doesn't
// restart it. Once signed in, the account's deadline replaces it.

const KEY = "sf_offer_deadline";

let memory: number | null = null;
const listeners = new Set<() => void>();

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readDeadline(): number | null {
  const stored = Number(storage()?.getItem(KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : memory;
}

export function writeDeadline(deadline: number) {
  memory = deadline;
  try {
    storage()?.setItem(KEY, String(deadline));
  } catch {
    // Private mode with storage full: the in-memory copy still counts.
  }
  listeners.forEach((listener) => listener());
}

/** Starts the countdown unless it's already running. True if it just started. */
export function startOffer() {
  if (readDeadline() !== null) return false;
  writeDeadline(Date.now() + OFFER_MS);
  return true;
}

/** What the countdown has left, for the server; null if it never started. */
export function offerRemainingMs() {
  const deadline = readDeadline();
  return deadline === null ? null : deadline - Date.now();
}

/**
 * Hands the browser's countdown to the account (or starts one with `start`)
 * and adopts the account's deadline, which is the one checkout enforces.
 * Signed-in visitors only: the server answers 401 otherwise.
 */
export async function syncOffer(start: boolean) {
  try {
    const res = await fetch("/api/offer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remainingMs: offerRemainingMs(), start }),
    });
    if (!res.ok) return;
    const { remainingMs } = await res.json();
    if (typeof remainingMs === "number") writeDeadline(Date.now() + remainingMs);
  } catch {
    // Offline: the local countdown stands until the next sync.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The deadline (epoch ms), null before it starts and during server render. */
export function useOfferDeadline() {
  return useSyncExternalStore(subscribe, readDeadline, () => null);
}

// One shared clock that ticks every second while something reads it.
let clock = 0;
function subscribeClock(listener: () => void) {
  // Fresh on (re)subscribe: React re-reads the snapshot right after.
  clock = Date.now();
  const id = window.setInterval(() => {
    clock = Date.now();
    listener();
  }, 1000);
  return () => window.clearInterval(id);
}
function clockSnapshot() {
  if (!clock) clock = Date.now();
  return clock;
}

/** The current time, refreshed every second; null during server render. */
export function useNow() {
  return useSyncExternalStore(subscribeClock, clockSnapshot, () => null);
}
