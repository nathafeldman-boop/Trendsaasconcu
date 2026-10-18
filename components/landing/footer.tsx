import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const LINKS = [
  {
    title: "Produit",
    items: [
      { label: "La méthode", href: "/#methode" },
      { label: "Marketing", href: "/#marketing" },
      { label: "Tarifs", href: "/tarifs" },
      { label: "J'ai un code d'accès", href: "/acces" },
    ],
  },
  {
    title: "Compte",
    items: [
      { label: "Créer mon compte", href: "/commencer" },
      { label: "Se connecter", href: "/connexion" },
    ],
  },
  {
    title: "Légal",
    items: [
      { label: "Conditions d'utilisation", href: "/conditions" },
      { label: "Confidentialité", href: "/confidentialite" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-[28ch] font-body text-[13px] leading-relaxed text-ink-faint">
            Idée, build et marketing de ton premier SaaS, au même endroit.
          </p>
        </div>
        {LINKS.map((group) => (
          <div key={group.title}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">{group.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-body text-[13px] text-ink-faint transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink/8">
        <p className="mx-auto max-w-6xl px-5 py-6 font-mono text-[11px] uppercase tracking-wider text-ink-faint sm:px-8">
          © {new Date().getFullYear()} SaaSFounder · Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
