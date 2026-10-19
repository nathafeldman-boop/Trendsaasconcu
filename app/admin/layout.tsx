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
      <header className="px-5 py-6 sm:px-8">
        <Link href="/admin" className="inline-flex">
          <Logo />
        </Link>
      </header>
      {children}
    </>
  );
}
