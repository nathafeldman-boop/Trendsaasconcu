"use client";

import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";

const DELIVERABLES = [
  {
    number: "01",
    title: "On choisit ton idée",
    description:
      "20 idées de SaaS déjà validées par la demande. 18 questions sur ton temps, ton budget et tes compétences décident laquelle est la tienne.",
    tag: "Livrable · fiche idée + marché",
  },
  {
    number: "02",
    title: "On écrit le prompt de build",
    description:
      "~650 mots à coller dans ton IA : schéma de données, écrans, paiements, déploiement. Tu pilotes, l'IA code.",
    tag: "Livrable · prompt + checklist",
  },
  {
    number: "03",
    title: "On te donne 30 jours de plan",
    description:
      "Une action par jour, dans l'ordre : parler à 10 prospects, sortir le MVP, poster, relancer, encaisser.",
    tag: "Livrable · plan jour par jour",
  },
  {
    number: "04",
    title: "On suit tes chiffres avec toi",
    description:
      "Connecte ta clé Stripe en lecture seule : ton MRR, tes paiements et ton churn s'affichent dans ton espace, et nos conseils s'ajustent.",
    tag: "Livrable · dashboard revenus",
  },
];

export function HelpSection() {
  return (
    <section id="methode" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <Eyebrow>Comment on va t&apos;aider</Eyebrow>
      <h2 className="mt-5 max-w-lg font-display text-[32px] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[38px]">
        Quatre choses qu&apos;on fait à ta place — le reste, tu l&apos;exécutes.
      </h2>
      <p className="mt-5 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
        Pas un cours théorique de plus : des livrables que tu utilises le jour même.
      </p>

      <div className="mt-12 grid grid-cols-1 border-t border-l border-ink/10 sm:grid-cols-2">
        {DELIVERABLES.map((item, index) => (
          <motion.div
            key={item.number}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="border-r border-b border-ink/10 p-8 sm:p-10"
          >
            <p className="font-mono text-[12px] font-medium text-accent">{item.number}</p>
            <h3 className="mt-3 font-display text-lg font-semibold text-ink">{item.title}</h3>
            <p className="mt-3 max-w-md font-body text-[14px] leading-relaxed text-ink-muted">
              {item.description}
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              {item.tag}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
