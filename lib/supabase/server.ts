import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Component / Server Action client. Returns `null` when Supabase env
 * vars aren't configured yet.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore since the
          // middleware below refreshes the session on every request.
        }
      },
    },
  });
}
