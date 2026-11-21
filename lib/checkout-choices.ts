import { useSyncExternalStore } from "react";
import { offerRemainingMs } from "@/lib/offer";

// Browser half of what the pricing page asks before checkout, carried
// through signup to app/api/checkout/route.ts:
// - "terms": the required box (terms + immediate access, no 14-day
//   withdrawal). Kept for this tab only, so it's ticked anew on each visit.
// - "reminder": one email if the payment isn't finished. Kept on this device.

const KEYS = { terms: "sf_terms_accepted", reminder: "sf_checkout_reminder" } as const;
export type Choice = keyof typeof KEYS;

const listeners = new Set<() => void>();

function store(choice: Choice) {
  try {
    return choice === "terms" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function readChoice(choice: Choice) {
  return store(choice)?.getItem(KEYS[choice]) === "1";
}

export function setChoice(choice: Choice, value: boolean) {
  try {
    store(choice)?.setItem(KEYS[choice], value ? "1" : "0");
  } catch {
    // Storage blocked: the box just won't stay ticked.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Unticked by default, and during server render. */
export function useChoice(choice: Choice) {
  return useSyncExternalStore(subscribe, () => readChoice(choice), () => false);
}

/** What every checkout request carries from this browser. */
export function checkoutExtras() {
  return {
    offerRemainingMs: offerRemainingMs(),
    reminder: readChoice("reminder"),
    termsAccepted: readChoice("terms"),
    returnTo: window.location.pathname,
  };
}
