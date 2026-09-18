import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Créer mon compte — SaaSFounder",
  description: "Crée ton compte SaaSFounder pour recevoir ton idée, ton prompt et ton plan des 30 jours.",
  robots: { index: false, follow: false },
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; next?: string }>;
}) {
  const { plan, next } = await searchParams;
  const connexionHref = plan
    ? `/connexion?plan=${plan}`
    : next
      ? `/connexion?next=${next}`
      : "/connexion";

  return (
    <AuthShell
      eyebrow="Ton espace"
      title="On garde ton idée au chaud."
      subtitle="Crée ton compte pour sauvegarder ton idée, ton prompt et ton plan — et les retrouver quand tu en as besoin."
      footer={
        <p className="font-body text-[14px] text-ink-muted">
          Déjà un compte ?{" "}
          <Link href={connexionHref} className="font-medium text-ink underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
