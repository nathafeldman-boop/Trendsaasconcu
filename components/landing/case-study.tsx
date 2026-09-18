"use client";

import { motion } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";

const PREVIOUS_PERIOD = [4200, 4400, 4100, 4800, 5100, 4900, 5400, 5700, 6420];
const CURRENT_PERIOD = [6800, 8200, 9100, 10400, 12300, 13800, 15600, 17900, 20040];

const PAYMENTS = [
  { amount: "89,00 €", who: "camille@exemple.fr · Plan Studio" },
  { amount: "49,00 €", who: "mehdi@exemple.fr · Plan Solo" },
  { amount: "149,00 €", who: "contact@exemple.fr · Plan Salle" },
  { amount: "49,00 €", who: "julie@exemple.fr · Plan Solo" },
];

const CHART_WIDTH = 760;
const CHART_HEIGHT = 200;

function buildPath(points: number[]) {
  const max = Math.max(...PREVIOUS_PERIOD, ...CURRENT_PERIOD);
  const padding = 10;
  const step = (CHART_WIDTH - padding * 2) / (points.length - 1);
  return points
    .map((value, index) => {
      const x = padding + index * step;
      const y = padding + (1 - value / max) * (CHART_HEIGHT - padding * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function CaseStudy() {
  return (
    <section id="resultats" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow tone="accent">Ton espace paiements</Eyebrow>
        </div>
        <h2 className="mt-5 font-display text-[32px] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[38px]">
          Ton MRR, connecté à ton vrai Stripe.
        </h2>
        <p className="mt-5 font-body text-[15px] leading-relaxed text-ink-muted">
          Une fois lancé, branche ta clé Stripe en lecture seule : ton volume du jour,
          ton MRR et tes derniers paiements s&apos;affichent automatiquement dans ton
          espace — pas de tableur à remplir à la main.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mt-14 max-w-4xl"
      >
        <div className="absolute -inset-8 -z-10 rounded-[40px] bg-accent/10 blur-3xl" />

        <div className="overflow-hidden rounded-lg border border-ink/10 bg-canvas-overlay/95 shadow-[0_30px_80px_-40px_rgba(27,22,48,0.25)] backdrop-blur-xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 border-b border-ink/8 bg-ink/[0.02] px-5 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-ink/15" />
              <span className="size-2.5 rounded-full bg-ink/15" />
              <span className="size-2.5 rounded-full bg-ink/15" />
            </div>
            <div className="ml-2 flex-1 truncate rounded-md border border-ink/10 bg-canvas px-3 py-1 font-mono text-[12px] text-ink-faint">
              dashboard.stripe.com/payments/overview
            </div>
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-success/12 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-success">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              Aperçu
            </span>
          </div>

          <div className="p-5 sm:p-7">
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  Volume brut · aujourd&apos;hui
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                  2 345,00 €
                </p>
                <span className="mt-1.5 inline-flex rounded-full bg-success/12 px-2 py-0.5 font-mono text-[11px] font-medium text-success">
                  +18,4 % vs hier
                </span>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  Ce mois-ci
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-accent sm:text-3xl">
                  20 040 €
                </p>
                <span className="mt-1.5 inline-flex rounded-full bg-success/12 px-2 py-0.5 font-mono text-[11px] font-medium text-success">
                  +212 % vs mois dernier
                </span>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  MRR
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                  17 310 €
                </p>
                <p className="mt-1.5 font-body text-[12px] text-ink-muted">
                  312 abonnés · churn 2,1 %
                </p>
              </div>
            </div>

            <div className="my-6 h-px bg-ink/8" />

            {/* Chart */}
            <div className="flex items-center justify-between">
              <p className="font-body text-[13px] font-medium text-ink">
                Volume brut · 30 derniers jours
              </p>
              <div className="flex items-center gap-4 font-mono text-[11px] text-ink-faint">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-accent" /> Ce mois
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full border border-ink-faint/60" /> Mois précédent
                </span>
              </div>
            </div>
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="mt-4 h-[160px] w-full"
              preserveAspectRatio="none"
            >
              <path
                d={buildPath(PREVIOUS_PERIOD)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                className="text-ink-faint/50"
              />
              <motion.path
                d={buildPath(CURRENT_PERIOD)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>

            <div className="my-6 h-px bg-ink/8" />

            {/* Recent payments */}
            <p className="font-body text-[13px] font-medium text-ink">Paiements récents</p>
            <div className="mt-3 flex flex-col divide-y divide-ink/8">
              {PAYMENTS.map((payment) => (
                <div key={payment.who} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-body text-[14px] font-medium text-ink">{payment.amount}</p>
                    <p className="font-body text-[12px] text-ink-muted">{payment.who}</p>
                  </div>
                  <span className="rounded-full bg-success/12 px-2.5 py-1 font-mono text-[11px] font-medium text-success">
                    Réussi
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center font-body text-[12px] leading-relaxed text-ink-faint">
          Exemple avec des données fictives — une fois ton compte Stripe connecté, ce sont
          tes propres chiffres qui s&apos;affichent ici.
        </p>
      </motion.div>
    </section>
  );
}
