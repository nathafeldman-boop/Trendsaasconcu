"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Lock, Play } from "lucide-react";
import { StepShell } from "@/components/onboarding/step-shell";
import { Button } from "@/components/ui/button";
import type { Answers } from "@/components/onboarding/funnel";
import type { ShellProps } from "@/components/onboarding/funnel-screens";
import { readFoundIdea } from "@/lib/onboarding/found-idea";
import { cn } from "@/lib/utils";

const STEP_MS = 1100;

function slug(text: string) {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 28) || "ton-saas"
  );
}

/**
 * Right before the plans: their business and its content are generated
 * from their answers, part by part (site, videos, marketing plan), in a
 * browser preview of the found idea's name, pitch and price. What's shown
 * is a preview of what they build with the prompt and the launch autopilot
 * after paying; the lower half stays locked.
 */
export function BuildScreen({ shell, answers, onNext }: { shell: ShellProps; answers: Answers; onNext: () => void }) {
  const idea = readFoundIdea(answers);
  const name = idea?.title ?? "Ton SaaS";
  const price = idea?.price_per_month ?? 29;
  const payments: Record<string, string> = { stripe: "Stripe", paypal: "PayPal", revolut: "Revolut", banque: "Ton compte bancaire" };
  const parts = [
    { label: "Ton idée", detail: name },
    { label: "Ton site", detail: "Accueil · inscription · paiement" },
    { label: "Tes offres et tarifs", detail: "3 formules, tes prix" },
    { label: "Tes vidéos", detail: "Des scripts adaptés à ton SaaS" },
    { label: "Ton plan marketing", detail: "Tes canaux, ton rythme" },
    { label: "Tes paiements", detail: payments[String(answers.payments)] ?? "Stripe" },
    { label: "Prêt à lancer", detail: null },
  ];
  const [done, setDone] = useState(1);
  useEffect(() => {
    if (done >= parts.length) return;
    const id = window.setTimeout(() => setDone((n) => n + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [done, parts.length]);
  const ready = done >= parts.length;
  const percent = Math.round((done / parts.length) * 100);
  // What's being done, part by part (the last one once everything is).
  const lines = [
    "Analyse de ton idée…",
    "Écriture de ton site…",
    "Préparation de tes offres…",
    "Écriture de tes vidéos…",
    "Génération de ton plan marketing…",
    "Branchement de tes paiements…",
    "Ton business est prêt à être lancé.",
  ];

  return (
    <StepShell
      {...shell}
      eyebrow={ready ? "Prêt à lancer" : `Génération · ${String(done).padStart(2, "0")} / ${String(parts.length).padStart(2, "0")}`}
      title={
        ready ? (
          <>
            Ton business <span className="font-serif italic tracking-normal text-accent">est prêt.</span>
          </>
        ) : (
          <>
            Génération de ton business <span className="font-serif italic tracking-normal text-accent">et de ton contenu.</span>
          </>
        )
      }
      subtitle={
        ready
          ? "Site, vidéos, plan marketing : préparés à partir de tes réponses. Ils passent en ligne dès que tu les lances."
          : "Ton site, tes vidéos et ton plan marketing partent de tes réponses."
      }
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_1.15fr]">
        <div className="glass-panel rounded-[18px] p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Progression</p>
            <p className="font-mono text-[13px] text-accent">{percent}%</p>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10">
            <motion.div className="h-full bg-accent" animate={{ width: `${percent}%` }} transition={{ duration: 0.6 }} />
          </div>
          <ol className="mt-4 flex flex-col gap-2.5">
            {parts.map((part, i) => {
              const state = ready || i < done - 1 ? "fait" : i === done - 1 ? "en cours" : "à venir";
              return (
                <li key={part.label} className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                      state === "fait" ? "bg-success/20 text-success" : state === "en cours" ? "text-accent" : "border border-ink/20"
                    )}
                  >
                    {state === "fait" ? <Check className="size-3" strokeWidth={3} /> : state === "en cours" ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block font-body text-[13px]", state === "à venir" ? "text-ink-faint" : "text-ink")}>{part.label}</span>
                    {part.detail && state !== "à venir" && <span className="block truncate font-body text-[11.5px] text-ink-faint">{part.detail}</span>}
                  </span>
                  <span className="font-mono text-[10.5px] text-ink-faint">{state}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 font-mono text-[11.5px] text-ink-muted">› {lines[done - 1]}</p>
        </div>

        <div className="relative overflow-hidden rounded-[18px] border border-ink/12 bg-canvas-raised">
          <div className="flex items-center gap-1.5 border-b border-ink/10 px-3 py-2">
            <span className="size-2 rounded-full bg-ink/20" />
            <span className="size-2 rounded-full bg-ink/20" />
            <span className="size-2 rounded-full bg-ink/20" />
            <span className="ml-2 truncate rounded-md bg-ink/[0.06] px-2 py-0.5 font-mono text-[10.5px] text-ink-faint">
              {slug(name)}.netlify.app
            </span>
            <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">Aperçu</span>
          </div>
          <div className="flex flex-col gap-4 p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: done >= 1 ? 1 : 0.25 }}>
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-accent font-display text-[12px] font-bold text-canvas">
                  {name.charAt(0).toUpperCase()}
                </span>
                <span className="font-display text-[14px] font-semibold text-ink">{name}</span>
              </div>
            </motion.div>
            <motion.div animate={{ opacity: done >= 2 ? 1 : 0.2 }}>
              <p className="font-display text-[17px] font-semibold leading-snug text-ink">{idea?.pitch ?? "Ton produit, présenté en une phrase."}</p>
              {idea?.target && <p className="mt-1 font-body text-[12px] text-ink-muted">Pour {idea.target.charAt(0).toLowerCase() + idea.target.slice(1)}</p>}
              <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1 font-body text-[11.5px] font-semibold text-canvas">Essayer gratuitement</span>
            </motion.div>
            <motion.div animate={{ opacity: done >= 3 ? 1 : 0.2 }}>
              <p className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">Offres et tarifs</p>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {[
                  { n: "Essai", p: "0 €" },
                  { n: "Pro", p: `${price} €` },
                  { n: "Équipe", p: `${Math.round((price * 2.5) / 5) * 5} €` },
                ].map((tier) => (
                  <div key={tier.n} className="rounded-md border border-ink/10 px-2 py-1.5 text-center">
                    <p className="font-body text-[10.5px] text-ink-faint">{tier.n}</p>
                    <p className="font-display text-[13px] font-semibold text-ink">
                      {tier.p}
                      <span className="font-body text-[9.5px] font-normal text-ink-faint">/mois</span>
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className={cn("flex flex-col gap-4 transition-[filter] duration-500", !ready && "blur-[1px]", ready && "blur-[3px]")}>
              <motion.div animate={{ opacity: done >= 4 ? 1 : 0.2 }}>
                <p className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">Tes vidéos</p>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {["Accroche", "Démo", "Preuve"].map((label) => (
                    <div key={label} className="flex aspect-[9/14] flex-col justify-end rounded-md border border-ink/10 bg-gradient-to-b from-ink/[0.03] to-ink/[0.1] p-1.5">
                      <span className="mb-auto mt-1 self-center rounded-full bg-ink/15 p-1">
                        <Play className="size-2.5 text-ink" />
                      </span>
                      <span className="font-body text-[9px] text-ink-muted">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div animate={{ opacity: done >= 5 ? 1 : 0.2 }}>
                <p className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">Plan marketing</p>
                <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] text-ink-faint">
                  J1
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                    <span className="block h-full bg-accent/70" style={{ width: done >= 5 ? "100%" : "0%", transition: "width 1s" }} />
                  </span>
                  J30
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  {["TikTok", "Instagram", "Shorts"].map((channel) => (
                    <span key={channel} className="rounded-md border border-ink/10 px-1.5 py-0.5 font-body text-[9.5px] text-ink-muted">
                      {channel}
                    </span>
                  ))}
                </div>
              </motion.div>
              <motion.div animate={{ opacity: done >= 6 ? 1 : 0.2 }} className="flex gap-2">
                <span className="rounded-md border border-ink/10 px-2 py-1 font-body text-[10.5px] text-ink-muted">
                  Paiements · {done >= 6 ? (payments[String(answers.payments)] ?? "Stripe") : "…"}
                </span>
                <span className="rounded-md border border-ink/10 px-2 py-1 font-body text-[10.5px] text-ink-muted">Visites · suivies</span>
              </motion.div>
            </div>
          </div>
          {ready && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-4 pb-4 pt-14 text-center">
              <Lock className="size-4 text-accent" />
              <p className="font-body text-[12.5px] font-medium text-ink">{name} est prêt.</p>
              <p className="font-body text-[11.5px] text-ink-muted">Débloque-le pour recevoir ton site, tes vidéos et ton plan marketing en entier.</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <Button onClick={onNext} disabled={!ready}>
          {ready ? "Voir mon business" : "Génération…"}
        </Button>
      </div>
    </StepShell>
  );
}
