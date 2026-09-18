"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Safety net for Google OAuth: Supabase is supposed to send the browser to
// /auth/callback, but if its redirect_to allow-list ever rejects that URL it
// silently falls back to the bare Site URL instead — still carrying `?code=`,
// just with nowhere to process it. This catches that code on ANY page and
// finishes the exchange client-side instead of leaving the user logged out.
export function OAuthCodeListener() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;
    ran.current = true;

    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.toString());
      if (!error) router.replace("/espace");
    });
  }, [router]);

  return null;
}
