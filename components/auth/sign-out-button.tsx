"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-faint transition-colors hover:text-ink disabled:opacity-50",
        className
      )}
    >
      <LogOut className="size-3.5" strokeWidth={1.75} />
      {loading ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}
