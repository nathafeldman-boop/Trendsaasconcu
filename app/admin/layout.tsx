import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuth } from "@/lib/supabase/auth";
import { Logo } from "@/components/ui/logo";

// Always re-check the session server-side — never cache an auth decision.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) redirect("/connexion");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  return (
    <>
      <header className="flex items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/admin" className="inline-flex">
          <Logo />
        </Link>
        <Link
          href="/espace"
          className="rounded-full border border-ink/15 px-4 py-2 font-body text-[13px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
        >
          Ouvrir l&apos;application
        </Link>
      </header>
      {children}
    </>
  );
}
