import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { whatsappLink } from "@/lib/legal";

const LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Gagner de l'argent jeune", href: "/argent-en-ligne" },
  { label: "Idées de SaaS", href: "/idees-saas" },
  { label: "Créer une application", href: "/creer-application" },
  { label: "Gagner de l'argent", href: "/gagner-argent" },
  { label: "Glossaire", href: "/glossaire-saas" },
  { label: "Alternatives", href: "/alternatives" },
  { label: "Comparatifs", href: "/comparatifs" },
  { label: "CGV", href: "/conditions" },
  { label: "Conditions de remboursement", href: "/remboursement" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Se connecter", href: "/connexion" },
];

export function Footer() {
  const whatsapp = whatsappLink("Salut, j'ai une question sur SaaSFounder :");
  return (
    <footer className="border-t border-ink/8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:gap-8 sm:px-8">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="font-body text-[13px] text-ink-faint">Lance ton premier SaaS.</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-body text-[13px] text-ink-muted sm:ml-auto">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ink">
              Écris-moi sur WhatsApp
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
