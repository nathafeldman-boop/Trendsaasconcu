import { useSyncExternalStore } from "react";

// Browser half of the checkout reminder: whether the visitor ticked "send me
// a reminder" on the pricing cards. Kept in localStorage so it follows them
// through signup, and sent with each checkout (app/api/checkout/route.ts).

const KEY = "sf_checkout_reminder";
const listeners = new Set<() => void>();

export function reminderConsent() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setReminderConsent(value: boolean) {
  try {
    window.localStorage.setItem(KEY, value ? "1" : "0");
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
export function useReminderConsent() {
  return useSyncExternalStore(subscribe, reminderConsent, () => false);
}
