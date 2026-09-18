"use client";

import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";

const PHRASES = [
  {
    tag: "Phrase 1 · Le problème",
    quote: "« Les coachs sportifs perdent 4 h par mois à courir après leurs factures. »",
    note: "Nomme une douleur chiffrée, pas une catégorie. Si ta cible ne se reconnaît pas mot pour mot, recommence.",
  },
  {
    tag: "Phrase 2 · La promesse",
    quote: "« Factures envoyées et relancées automatiquement, en 2 clics. »",
    note: "Un résultat, un délai. Pas de « plateforme tout-en-un », pas d'« optimisation » — le bénéfice tel que le client le raconterait.",
  },
  {
    tag: "Phrase 3 · La preuve",
    quote: "« 312 coachs l'utilisent, 2,1 % arrêtent chaque mois. »",
    note: "Au début tu n'as pas de chiffres : montre l'écran, la démo, le premier client. La preuve visuelle vaut mieux qu'un argument.",
  },
];

const LOOP_DAYS = [
  { day: "Jour 1-2", action: "5 vidéos de 20 s : le problème filmé, pas le produit expliqué." },
  { day: "Jour 3-5", action: "Tu postes une par jour, même heure. Tu changes seulement les 3 premières secondes." },
  { day: "Jour 6", action: "Tu réponds à chaque commentaire par une question — c'est là que se trouvent tes clients." },
  { day: "Jour 7", action: "Tu gardes le format le plus vu, tu jettes les autres, tu recommences." },
];

const CHANNELS = [
  { name: "TikTok · Reels", detail: "Démo brute de 15 s, écran filmé, un seul bénéfice" },
  { name: "X · LinkedIn", detail: "Build in public : ton MRR, tes échecs, tes chiffres réels" },
  { name: "Communautés", detail: "Réponds à 5 questions par jour, sans lien, jusqu'à ce qu'on te le demande" },
  { name: "Messages directs", detail: "20 par jour, personnalisés, une question — jamais un pitch" },
];

export function MarketingSection() {
  return (
    <section id="marketing" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <Eyebrow>Le marketing, sans budget</Eyebrow>
      <h2 className="mt-5 max-w-lg font-display text-[32px] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[38px]">
        Un bon marketing SaaS, c&apos;est trois phrases et une boucle.
      </h2>
      <p className="mt-5 max-w-lg font-body text-[15px] leading-relaxed text-ink-muted">
        La plupart des premiers SaaS ne meurent pas d&apos;un mauvais produit, mais
        d&apos;un message que personne ne comprend en 5 secondes. Voilà ce qu&apos;on te
        fait écrire avant de poster quoi que ce soit.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {PHRASES.map((phrase, index) => (
          <motion.div
            key={phrase.tag}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-lg border border-ink/10 bg-accent/5 p-6"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
              {phrase.tag}
            </p>
            <p className="mt-3 font-display text-base font-semibold leading-snug text-ink">
              {phrase.quote}
            </p>
            <p className="mt-3 font-body text-[13px] leading-relaxed text-ink-muted">
              {phrase.note}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">La boucle de 7 jours</h3>
          <p className="mt-2 font-body text-[14px] leading-relaxed text-ink-muted">
            Tu ne fais pas « du marketing ». Tu répètes une boucle courte jusqu&apos;à ce
            qu&apos;un format prenne.
          </p>
          <div className="mt-6 flex flex-col divide-y divide-ink/10">
            {LOOP_DAYS.map((item) => (
              <div key={item.day} className="grid grid-cols-[100px_1fr] gap-4 py-3.5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                  {item.day}
                </p>
                <p className="font-body text-[14px] leading-relaxed text-ink-muted">
                  {item.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold text-ink">Où poster, et quoi y dire</h3>
          <p className="mt-2 font-body text-[14px] leading-relaxed text-ink-muted">
            Un seul canal à la fois, choisi selon là où ta cible perd déjà son temps.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {CHANNELS.map((channel) => (
              <div
                key={channel.name}
                className="flex items-center justify-between gap-4 rounded-lg border border-ink/10 bg-accent/5 px-5 py-4"
              >
                <p className="font-body text-[15px] font-semibold text-ink">{channel.name}</p>
                <p className="max-w-[55%] text-right font-body text-[13px] leading-snug text-ink-muted">
                  {channel.detail}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 border-l-2 border-accent/40 pl-4 font-body text-[13px] leading-relaxed text-ink-muted">
            Le seul indicateur qui compte la première semaine : combien de personnes
            t&apos;ont répondu. Les vues sont un moyen, pas un résultat.
          </p>
        </div>
      </div>
    </section>
  );
}
