import Link from "next/link";
import { TwoTone } from "@/components/landing/cta-button";

const FAQ = [
  {
    q: "Les idées ne sont pas « prises » si tout le monde les voit ?",
    a: "Très peu de gens passent à l'action, et personne ne l'exécute pareil. Ton idée part de tes réponses : ton temps, ton niveau, ta cible et ton objectif de revenus.",
  },
  {
    q: "Je ne sais pas coder. Le prompt me sert à quoi ?",
    a: "Pas besoin de savoir coder. Le prompt demande à Claude de tout construire et de t'expliquer chaque étape : tu suis, et tu lui poses tes questions quand tu bloques.",
  },
  {
    q: "Pourquoi autant de questions ? C'est long.",
    a: "Ton temps, ton niveau et ce que tu refuses de faire écartent les idées qui ne te vont pas. Avec trois questions, on ne pourrait rien te dire de neuf.",
  },
  {
    q: "Combien ça coûte ?",
    a: "Le questionnaire et ton idée sont gratuits. Les formules (1 mois, 3 mois ou à vie) s'affichent à la fin, avec un prix de bienvenue pendant 10 minutes. Résiliable à tout moment.",
  },
  {
    q: "Et si je ne fais aucune vente ?",
    a: "Garantie 48 h : publie au moins 3 vidéos par jour pendant les deux jours qui suivent ton achat pour faire connaître ton SaaS. Aucune vente ? On te rembourse ton premier paiement en entier.",
    link: { href: "/remboursement", label: "Voir les conditions" },
  },
  {
    q: "Pourquoi me demander de créer un compte ?",
    a: "Pour retrouver ton idée, ton prompt et ton plan quand tu reviens. Prénom, email et mot de passe (ou Google), rien d'autre. Aucune donnée revendue.",
  },
];

export function FaqSection() {
  return (
    <section id="questions" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-20 sm:px-8 sm:py-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted">Questions fréquentes</p>
      <h2 className="mt-4 max-w-2xl font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[48px]">
        <TwoTone strong="Les questions qu'on nous pose" soft="souvent." />
      </h2>
      <div className="mt-12 flex flex-col gap-3">
        {FAQ.map((item) => (
          <div key={item.q} className="rounded-[14px] border border-ink/10 bg-ink/[0.025] px-5 py-4">
            <h3 className="font-body text-[15px] font-semibold text-ink">{item.q}</h3>
            <p className="mt-2 font-body text-[14.5px] leading-relaxed text-ink-muted">
              {item.a}
              {item.link && (
                <>
                  {" "}
                  <Link href={item.link.href} className="underline underline-offset-2 hover:text-ink">
                    {item.link.label}
                  </Link>
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
