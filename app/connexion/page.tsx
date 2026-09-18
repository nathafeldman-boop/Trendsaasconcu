import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Se connecter — SaaSFounder",
  description: "Connecte-toi à ton compte SaaSFounder pour retrouver ton idée, ton prompt et ton plan.",
  robots: { index: false, follow: false },
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; next?: string }>;
}) {
  const { plan, next } = await searchParams;
  const inscriptionHref = plan
    ? `/inscription?plan=${plan}`
    : next
      ? `/inscription?next=${next}`
      : "/inscription";

  return (
    <AuthShell
      eyebrow="Bon retour"
      title="Content de te revoir."
      subtitle="Connecte-toi pour retrouver ton idée, ton prompt et ton plan là où tu les as laissés."
      footer={
        <div className="flex flex-col items-center gap-3">
          <p className="font-body text-[14px] text-ink-muted">Pas encore de compte ?</p>
          <Button href={inscriptionHref} variant="secondary" showArrow={false} className="w-full">
            Créer mon compte
          </Button>
        </div>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
