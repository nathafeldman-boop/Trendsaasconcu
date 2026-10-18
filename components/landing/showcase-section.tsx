"use client";

import { motion, type Variants } from "framer-motion";
import { Check, CreditCard, TrendingUp, UserPlus } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { CountUp } from "@/components/ui/count-up";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const BARS = [22, 30, 26, 38, 34, 46, 52, 48, 61, 70, 66, 84];

const NOTIFICATIONS = [
  { icon: CreditCard, title: "Paiement reçu", detail: "29,00 € · Plan mensuel", when: "maintenant" },
  { icon: UserPlus, title: "Nouvel abonné", detail: "lea.m••••@gmail.com", when: "il y a 4 min" },
  { icon: CreditCard, title: "Paiement reçu", detail: "249,00 € · Plan annuel", when: "il y a 12 min" },
  { icon: CreditCard, title: "Paiement reçu", detail: "29,00 € · Plan mensuel", when: "il y a 31 min" },
];

const JOURNEY = ["Idée trouvée", "Site en ligne", "Premier post publié", "Premier paiement reçu"];

const stackIn: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.28, delayChildren: 0.4 } },
};

const notifIn: Variants = {
  hidden: { opacity: 0, y: -14, scale: 0.96, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
};

function RevenueCard() {
  return (
    <div className="glass-panel rounded-[22px] p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Revenus · ce mois</p>
        <span className="flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 font-mono text-[11px] text-success">
          <TrendingUp className="size-3" /> +18 %
        </span>
      </div>
      <p className="mt-3 font-display text-[38px] font-medium tracking-[-0.04em] text-ink">
        <CountUp value={2184} format={(n) => `${n.toLocaleString("fr-FR")} €`} />
      </p>
      <p className="font-body text-[12px] text-ink-faint">vs 1 851 € le mois dernier</p>

      <div className="mt-6 flex h-[110px] items-end gap-1.5">
        {BARS.map((height, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            whileInView={{ height: `${height}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 + index * 0.05, ease: EASE }}
            className={`flex-1 rounded-t-[4px] ${
              index === BARS.length - 1
                ? "bg-accent shadow-[0_0_18px_-2px_var(--color-accent)]"
                : "bg-gradient-to-t from-accent-deep/25 to-accent-deep/60"
            }`}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink/8 pt-4">
        <div>
          <p className="font-display text-xl font-medium text-ink">
            +<CountUp value={12} />
          </p>
          <p className="font-body text-[11px] text-ink-faint">abonnés cette semaine</p>
        </div>
        <div>
          <p className="font-display text-xl font-medium text-ink">
            <CountUp value={75} format={(n) => `${n} €`} />
          </p>
          <p className="font-body text-[11px] text-ink-faint">MRR ajouté aujourd&apos;hui</p>
        </div>
      </div>
    </div>
  );
}

function PhoneCard() {
  return (
    <div className="relative mx-auto w-full max-w-[300px] rounded-[44px] border border-ink/12 bg-[#010d10] p-3 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9),0_0_80px_-40px_var(--color-accent)]">
      <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-b from-[#06303a] via-[#031b21] to-[#020f13] px-3.5 pb-6 pt-3">
        <div className="flex items-center justify-between px-2 font-body text-[11px] font-semibold text-ink">
          <span>9:41</span>
          <span className="h-5 w-20 rounded-full bg-black" />
          <span>5G</span>
        </div>
        <p className="mt-6 text-center font-body text-[12px] text-ink-muted">lundi 8 septembre</p>
        <p className="text-center font-display text-[56px] font-light leading-none tracking-[-0.04em] text-ink">
          9:41
        </p>

        <motion.div
          variants={stackIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          className="mt-6 flex flex-col gap-2"
        >
          {NOTIFICATIONS.map((notif, index) => (
            <motion.div
              key={index}
              variants={notifIn}
              className="flex items-center gap-2.5 rounded-[18px] border border-ink/8 bg-ink/[0.07] p-2.5 backdrop-blur-md"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-accent text-canvas">
                <notif.icon className="size-4" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-body text-[12px] font-semibold text-ink">{notif.title}</p>
                  <p className="shrink-0 font-body text-[10px] text-ink-faint">{notif.when}</p>
                </div>
                <p className="truncate font-body text-[11px] text-ink-muted">{notif.detail}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function JourneyCard() {
  return (
    <div className="glass-panel rounded-[22px] p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Ton parcours</p>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          Actif
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {JOURNEY.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0.35 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.45 }}
            className="flex items-center gap-3"
          >
            <motion.span
              initial={{ scale: 0.6, backgroundColor: "rgba(155, 251, 243, 0.08)" }}
              whileInView={{ scale: 1, backgroundColor: "rgba(51, 244, 239, 1)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.5 + index * 0.45, ease: EASE }}
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-canvas"
            >
              <Check className="size-3.5" strokeWidth={3} />
            </motion.span>
            <span className="font-body text-[14px] text-ink">{step}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-ink/8">
        <motion.div
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.9, delay: 0.5, ease: "easeInOut" }}
          className="h-full rounded-full bg-accent shadow-[0_0_14px_var(--color-accent)]"
        />
      </div>

      <div className="mt-5 rounded-[14px] border border-ink/8 bg-ink/[0.03] p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Vidéo TikTok · jour 6</p>
        <p className="mt-1 font-display text-2xl font-medium text-ink">
          <CountUp value={48} format={(n) => `${n},2 k`} /> <span className="text-[14px] text-ink-faint">vues</span>
        </p>
      </div>
    </div>
  );
}

export function ShowcaseSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow tone="accent">Dans 30 jours</Eyebrow>
        </div>
        <h2 className="mt-5 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.045em] text-ink sm:text-[46px]">
          Ça pourrait être{" "}
          <span className="font-serif italic tracking-normal text-accent">toi.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
          Ton site en ligne, tes paiements qui tombent, ton parcours suivi étape par étape.
        </p>
      </div>

      <div className="relative mt-14 grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
        <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="lg:translate-y-8"
        >
          <RevenueCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="lg:w-[300px]"
        >
          <PhoneCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="lg:-translate-y-6"
        >
          <JourneyCard />
        </motion.div>
      </div>

      <p className="mt-10 text-center font-body text-[12px] text-ink-faint">
        Exemple illustratif avec des données fictives, pas un résultat garanti.
      </p>
    </section>
  );
}
