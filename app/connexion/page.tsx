import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Se connecter — SaaSFounder",
  description: "Connecte-toi à ton compte SaaSFounder pour retrouver ton idée, ton prompt et ton plan.",
  robots: { index: false, follow: false },
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const inscriptionHref = plan ? `/inscription?plan=${plan}` : "/inscription";

  return (
    <AuthShell
      eyebrow="Bon retour"
      title="Content de te revoir."
      subtitle="Connecte-toi pour retrouver ton idée, ton prompt et ton plan là où tu les as laissés."
      footer={
        <p className="font-body text-[14px] text-ink-muted">
          Pas encore de compte ?{" "}
          <Link href={inscriptionHref} className="font-medium text-ink underline underline-offset-2">
            Créer un compte
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
