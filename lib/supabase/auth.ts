import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AuthUser = { id: string; email: string | null };

/**
 * The signed-in user for the current request.
 *
 * Uses getClaims(), not getUser(): the project signs sessions with an
 * asymmetric key (ES256), so the JWT is verified locally against the cached
 * public key instead of a round trip to Supabase Auth on every page.
 * cache() makes the layout and the page of one request share the result.
 */
export const getAuth = cache(async () => {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const user: AuthUser | null = claims?.sub
    ? { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null }
    : null;
  return { supabase, user };
});
