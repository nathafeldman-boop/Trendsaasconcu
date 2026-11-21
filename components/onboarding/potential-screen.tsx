"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { StepShell } from "@/components/onboarding/step-shell";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { PaymentsPhone } from "@/components/ui/payments-phone";
import { potential, type Answers } from "@/components/onboarding/funnel";
import type { ShellProps } from "@/components/onboarding/funnel-screens";
import { cn } from "@/lib/utils";

const CHECK_MS = 650;

const PAYMENT_LABEL: Record<string, string> = { stripe: "Stripe", paypal: "PayPal", revolut: "Revolut", banque: "ton compte bancaire" };
const FIRST_SALE_LABEL: Record<string, string> = {
  aujourdhui: "aujourd'hui",
  semaine: "cette semaine",
  mois: "dans le mois",
  "3mois": "d'ici 3 mois",
};

function eur(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} €`;
}

/**
 * Their potential, from everything they've answered: an analysis that ticks
 * off their answers one by one, then a monthly figure always above their
 * goal (lib: potential()), labelled as a scenario.
 */
export function PotentialScreen({ shell, answers, onNext }: { shell: ShellProps; answers: Answers; onNext: () => void }) {
  const { goal, amount, price, customers, ideaTitle } = potential(answers);
  const checks = [
    `Ton idée : ${ideaTitle ?? "ton SaaS"}`,
    `Ton objectif : ${eur(goal)} par mois`,
    `Tes paiements : ${PAYMENT_LABEL[String(answers.payments)] ?? "à choisir"}`,
    `Ta première vente : ${FIRST_SALE_LABEL[String(answers.deadline)] ?? "au plus vite"}`,
    `Clients amenés automatiquement : ${answers.autoClients === "oui" ? "oui" : "non"}`,
    `Business créé pour toi : ${answers.doneForYou === "oui" ? "oui" : "non"}`,
  ];
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done > checks.length) return;
    const id = window.setTimeout(() => setDone((n) => n + 1), CHECK_MS);
    return () => window.clearTimeout(id);
  }, [done, checks.length]);
  const revealed = done > checks.length;
  const above = Math.round(((amount - goal) / goal) * 100);

  if (!revealed) {
    return (
      <StepShell
        {...shell}
        eyebrow="Analyse en cours"
        title={
          <>
            On analyse <span className="font-serif italic tracking-normal text-accent">ton potentiel.</span>
          </>
        }
        subtitle="On croise ton idée, ton objectif et tes choix."
      >
        <ul className="glass-panel flex flex-col gap-3 rounded-[18px] p-5">
          {checks.map((label, i) => {
            const state = i < done ? "done" : i === done ? "running" : "waiting";
            return (
              <li key={label} className={cn("flex items-center gap-3 font-body text-[14px]", state === "waiting" ? "text-ink-faint" : "text-ink")}>
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    state === "done" ? "bg-success/20 text-success" : state === "running" ? "text-accent" : "border border-ink/20"
                  )}
                >
                  {state === "done" ? <Check className="size-3" strokeWidth={3} /> : state === "running" ? <Loader2 className="size-4 animate-spin" /> : null}
                </span>
                {label}
              </li>
            );
          })}
        </ul>
      </StepShell>
    );
  }

  return (
    <StepShell
      {...shell}
      eyebrow="Ton potentiel · calculé sur tes réponses"
      title={
        <>
          Tu peux viser <span className="font-serif italic tracking-normal text-accent">plus haut que ton objectif.</span>
        </>
      }
      footer={
        <Button onClick={onNext} className="w-full">
          Continuer
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-[24px] p-6 text-center shadow-[inset_0_0_0_1px_rgba(51,244,239,0.25),0_0_60px_-30px_var(--color-accent)]"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Ton potentiel</p>
        <p className="mt-2 font-display text-[56px] font-semibold leading-none tracking-[-0.04em] text-accent">
          <CountUp value={amount} format={(n) => eur(n)} />
        </p>
        <p className="mt-2 font-body text-[14px] text-ink-muted">par mois, soit +{above}&nbsp;% au-dessus de ton objectif</p>

        <div className="mt-6 flex flex-col gap-2.5 text-left">
          {[
            { label: "Ton objectif", value: goal, width: (goal / amount) * 100, tone: "bg-ink/40" },
            { label: "Ton potentiel", value: amount, width: 100, tone: "bg-accent" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between font-body text-[12.5px] text-ink-muted">
                <span>{bar.label}</span>
                <span className="text-ink">{eur(bar.value)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/10">
                <motion.div
                  className={cn("h-full rounded-full", bar.tone)}
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.width}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-ink/10 pt-5">
          {[
            { value: String(customers), label: "clients" },
            { value: eur(price), label: "par client et par mois" },
            { value: eur(goal), label: "ton objectif" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-[20px] font-semibold text-ink">{stat.value}</p>
              <p className="font-body text-[11.5px] text-ink-faint">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <p className="mt-4 text-center font-body text-[11.5px] leading-relaxed text-ink-faint">
        Scénario calculé à partir de tes réponses et du prix de ton idée, pas une promesse de revenus.
      </p>
    </StepShell>
  );
}

/** Their phone a few weeks from now: Stripe pushes at their idea's price (an illustration). */
export function PhoneScreen({ shell, answers, onNext }: { shell: ShellProps; answers: Answers; onNext: () => void }) {
  const { price, customers, ideaTitle } = potential(answers);
  const amount = `${price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;
  return (
    <StepShell
      {...shell}
      eyebrow="Dans quelques semaines"
      title={
        <>
          Imagine ton téléphone{" "}
          <span className="font-serif italic tracking-normal text-accent">{ideaTitle ? `avec ${ideaTitle}.` : "avec ton SaaS."}</span>
        </>
      }
      subtitle={`Chaque notification, c'est un client qui paie ${eur(price)} par mois. Il t'en faut ${customers} pour atteindre ton potentiel.`}
      footer={
        <Button onClick={onNext} className="w-full">
          Générer mon business
        </Button>
      }
    >
      <PaymentsPhone
        notifications={[
          { when: "maintenant", amount, email: "xxxxxx@gmail.com" },
          { when: "il y a 8 min", amount, email: "xxxxxxx@outlook.fr" },
          { when: "il y a 34 min", amount, email: "xxxxx@gmail.com" },
        ]}
      />
    </StepShell>
  );
}
