import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns `null` until NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * are set. Callers fall back to a simulated success so the flow keeps working
 * before those env vars are added on Vercel.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
