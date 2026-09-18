import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { AccessCodeInline } from "@/components/access/access-code-inline";

export const metadata: Metadata = {
  title: "Code d'accès — SaaSFounder",
  robots: { index: false, follow: false },
};

// Always re-check the session server-side — never cache an auth decision.
export const dynamic = "force-dynamic";

export default async function AccesPage() {
  const supabase = await createClient();
  let isAuthenticated = false;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

  return (
    <AuthShell
      eyebrow="Accès"
      title="Entre ton code d'accès."
      subtitle="Un code donné par l'équipe débloque l'accès (et parfois le dashboard admin)."
      footer={
        isAuthenticated ? (
          <p className="font-body text-[13px] text-ink-faint">
            Pas de code ? Retourne à ton{" "}
            <Link href="/espace" className="font-medium text-ink underline underline-offset-2">
              espace
            </Link>
            .
          </p>
        ) : (
          <p className="font-body text-[14px] text-ink-muted">
            Connecte-toi d&apos;abord :{" "}
            <Link
              href="/connexion?next=/acces"
              className="font-medium text-ink underline underline-offset-2"
            >
              se connecter
            </Link>{" "}
            ou{" "}
            <Link
              href="/inscription?next=/acces"
              className="font-medium text-ink underline underline-offset-2"
            >
              créer un compte
            </Link>
            .
          </p>
        )
      }
    >
      <AccessCodeInline isAuthenticated={isAuthenticated} alwaysOpen />
    </AuthShell>
  );
}
