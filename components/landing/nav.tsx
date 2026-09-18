"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/client";

export function Nav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setIsAuthenticated(!!data.user));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <SignOutButton />
          ) : (
            <>
              <Button href="/connexion" variant="secondary" size="sm" showArrow={false} className="hidden sm:inline-flex">
                Se connecter
              </Button>
              <Button href="/commencer" size="sm" showArrow={false}>
                Devenir fondateur
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
