"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Landmark, Loader2, RotateCcw } from "lucide-react";
import { Beetle } from "@/components/simulation/beetle";
import { CountUp } from "@/components/ui/count-up";
import { potential } from "@/components/onboarding/funnel";
import { cn } from "@/lib/utils";

// Replay of the creation flow for filming (on a computer or a phone):
// goal → first sale → price → payments → time → done for you → potential
// → generation → the SaaS online. Light mode, large type, the site's
// address always visible. Nothing is saved, tracked or charged.

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Idea = { title: string; pitch: string; target: string; price: number; features: [string, string, string]; color: string };

const IDEAS: Idea[] = [
  {
    title: "RelanceFacture",
    pitch: "Tes factures impayées relancées toutes seules.",
    target: "Pour les freelances qui perdent des heures à courir après leurs clients.",
    price: 29,
    features: ["Relances e-mail et SMS automatiques", "Suivi des paiements en direct", "Rappels polis, puis fermes"],
    color: "#2563eb",
  },
  {
    title: "AvisBoost",
    pitch: "Plus d'avis Google, sans rien demander à la main.",
    target: "Pour les commerces de quartier qui veulent remonter sur Google Maps.",
    price: 39,
    features: ["SMS d'avis après chaque visite", "Réponses aux avis écrites par l'IA", "Tableau de bord de ta note"],
    color: "#16a34a",
  },
  {
    title: "AgendaCoiff",
    pitch: "Les rendez-vous de ton salon, réservés en ligne 24 h/24.",
    target: "Pour les coiffeurs et barbiers qui répondent au téléphone toute la journée.",
    price: 35,
    features: ["Réservation en ligne en 30 secondes", "Rappels SMS anti-lapin", "Acompte à la réservation"],
    color: "#db2777",
  },
  {
    title: "MenuFlash",
    pitch: "Le menu de ton resto en QR code, traduit en 12 langues.",
    target: "Pour les restaurants qui accueillent des touristes.",
    price: 19,
    features: ["Menu modifiable en 1 clic", "Traduction automatique", "Plats du jour mis en avant"],
    color: "#ea580c",
  },
  {
    title: "CoachPlan",
    pitch: "Tes programmes sportifs envoyés et suivis automatiquement.",
    target: "Pour les coachs qui gèrent leurs clients sur WhatsApp et Excel.",
    price: 29,
    features: ["Programmes générés par l'IA", "Suivi des séances de chaque client", "Paiement de l'abonnement intégré"],
    color: "#7c3aed",
  },
  {
    title: "AnnonceImmo",
    pitch: "Une annonce immobilière qui vend, écrite en 10 secondes.",
    target: "Pour les agents immobiliers qui publient des dizaines d'annonces.",
    price: 49,
    features: ["Annonce écrite à partir des photos", "Publiée sur tous les portails", "Version anglaise incluse"],
    color: "#0891b2",
  },
];

const STEPS = ["intro", "goal", "deadline", "price", "payments", "hours", "doneForYou", "potential", "build", "live"] as const;
type StepId = (typeof STEPS)[number];
const COUNTED = 8; // goal … build

type Choice = { id: string; label: string; detail?: string; icon?: React.ReactNode };

const BADGE = (letter: string, bg: string) => (
  <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] text-[22px] font-bold text-white lg:size-16 lg:text-[28px]" style={{ background: bg }}>
    {letter}
  </span>
);

const DEADLINES: Choice[] = [
  { id: "aujourdhui", label: "Aujourd'hui" },
  { id: "semaine", label: "Cette semaine" },
  { id: "mois", label: "Ce mois-ci" },
  { id: "3mois", label: "D'ici 3 mois" },
];
const PRICES: Choice[] = [9, 19, 29, 49, 99].map((p) => ({ id: String(p), label: `${p} €`, detail: "par mois" }));
const PAYMENTS: Choice[] = [
  { id: "paypal", label: "PayPal", icon: BADGE("P", "#003087") },
  { id: "revolut", label: "Revolut", icon: BADGE("R", "#111111") },
  { id: "boursobank", label: "BoursoBank", icon: BADGE("B", "#d1006b") },
  {
    id: "banque",
    label: "Compte bancaire",
    icon: (
      <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-neutral-200 lg:size-16">
        <Landmark className="size-7 text-black lg:size-9" strokeWidth={1.8} />
      </span>
    ),
  },
];
const HOURS: Choice[] = [
  { id: "30min", label: "30 min", detail: "par jour" },
  { id: "1h", label: "1 h", detail: "par jour" },
  { id: "2h", label: "2 h", detail: "par jour" },
  { id: "3h", label: "3 h et +", detail: "par jour" },
];
const YES_NO: Choice[] = [
  { id: "oui", label: "Oui", detail: "automatisé" },
  { id: "non", label: "Non", detail: "je fais tout moi-même" },
];

const LABELS: Record<string, string> = {
  paypal: "PayPal",
  revolut: "Revolut",
  boursobank: "BoursoBank",
  banque: "ton compte bancaire",
  aujourdhui: "aujourd'hui",
  semaine: "cette semaine",
  mois: "ce mois-ci",
  "3mois": "d'ici 3 mois",
  "30min": "30 min par jour",
  "1h": "1 h par jour",
  "2h": "2 h par jour",
  "3h": "3 h et plus par jour",
};

const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

function slug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** When the first sale "can land", from today's real date and their answer. */
function firstSale(deadline: string | undefined) {
  if (deadline === "aujourdhui") return { lead: "Ta première vente peut tomber", when: "dès ce soir" };
  const days = deadline === "mois" ? 4 : deadline === "3mois" ? 18 : 1;
  const date = new Date();
  date.setDate(date.getDate() + days);
  const label = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return { lead: "Ta première vente peut tomber", when: days === 1 ? `dès demain, ${label}` : `dès le ${label}` };
}

/* ───────────────────────── layout ───────────────────────── */

function Frame({
  index,
  onBack,
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  index?: number;
  onBack?: () => void;
  kicker?: string;
  title?: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-5 pb-10 pt-5 lg:max-w-6xl lg:px-10 lg:pt-6">
      <div className="flex items-center justify-between gap-4">
        <span className="font-display text-[30px] font-bold leading-none tracking-[-0.04em] text-black lg:text-[46px]">
          SaaSFounder.fr
        </span>
        {index !== undefined && (
          <span className="font-mono text-[16px] font-semibold text-neutral-500 lg:text-[22px]">
            {index} / {COUNTED}
          </span>
        )}
      </div>
      {index !== undefined && (
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-black/10 lg:mt-4 lg:h-3">
          <motion.div
            className="h-full rounded-full bg-black"
            initial={false}
            animate={{ width: `${(index / COUNTED) * 100}%` }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
      )}
      <div className="mt-4 h-7 lg:mt-3 lg:h-6">
        {onBack && (
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-[16px] font-medium text-neutral-500 lg:text-[18px]">
            <ArrowLeft className="size-4" /> Retour
          </button>
        )}
      </div>
      {kicker && <p className="mt-3 text-[15px] font-bold uppercase tracking-[0.14em] text-neutral-500 lg:mt-2 lg:text-[18px]">{kicker}</p>}
      {title && (
        <h1 className="mt-2 font-display text-[38px] font-bold leading-[1.05] tracking-[-0.035em] text-black lg:text-[54px]">{title}</h1>
      )}
      {subtitle && <p className="mt-3 text-[19px] leading-snug text-neutral-600 lg:text-[26px]">{subtitle}</p>}
      <div className="mt-7 flex-1 lg:mt-8">{children}</div>
      {footer && <div className="mt-8 lg:flex lg:justify-center">{footer}</div>}
    </div>
  );
}

function BigButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-16 w-full items-center justify-center gap-2 rounded-[18px] bg-black text-[20px] font-bold text-white transition-transform active:scale-[0.97] disabled:opacity-30 lg:h-20 lg:w-auto lg:min-w-[480px] lg:px-16 lg:text-[26px]"
    >
      {children}
    </button>
  );
}

const COLS: Record<number, string> = { 2: "lg:grid-cols-2", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" };

/** Stacked on a phone, side by side on a computer. */
function Choices({ options, value, onPick }: { options: Choice[]; value?: string; onPick: (id: string) => void }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 lg:gap-5", COLS[options.length])}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            className={cn(
              "flex items-center gap-4 rounded-[20px] border-2 bg-white px-5 py-5 text-left transition-all active:scale-[0.98] lg:min-h-[200px] lg:flex-col lg:justify-center lg:gap-3 lg:px-6 lg:py-8 lg:text-center",
              active ? "border-black shadow-[0_10px_34px_-12px_rgba(0,0,0,0.45)]" : "border-black/10 hover:border-black/30"
            )}
          >
            {o.icon}
            <span className="flex-1 lg:flex-none">
              <span className="block text-[23px] font-bold leading-tight text-black lg:text-[34px]">{o.label}</span>
              {o.detail && <span className="block text-[16px] text-neutral-500 lg:text-[20px]">{o.detail}</span>}
            </span>
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 lg:size-9",
                active ? "border-black bg-black" : "border-black/20"
              )}
            >
              {active && <Check className="size-5 text-white" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Spinner({ state }: { state: "done" | "running" | "waiting" }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center lg:size-10">
      {state === "done" ? (
        <span className="flex size-8 items-center justify-center rounded-full bg-black lg:size-10">
          <Check className="size-4 text-white lg:size-5" strokeWidth={3} />
        </span>
      ) : state === "running" ? (
        <Loader2 className="size-7 animate-spin text-black lg:size-9" />
      ) : (
        <span className="size-7 rounded-full border-2 border-black/15 lg:size-9" />
      )}
    </span>
  );
}

/* ───────────────────────── screens ───────────────────────── */

function GoalScreen({ goal, setGoal, price, onNext }: { goal: number; setGoal: (n: number) => void; price: number; onNext: () => void }) {
  return (
    <Frame
      index={1}
      kicker="Ton objectif"
      title="Combien tu veux gagner par mois avec ton site ?"
      footer={<BigButton onClick={onNext}>Lancer mon business</BigButton>}
    >
      <Beetle />
      <div className="rounded-[28px] border-2 border-black/10 bg-white p-6 lg:px-12 lg:py-8">
        <p className="font-display text-[64px] font-bold leading-none tracking-[-0.04em] text-black tabular-nums lg:text-[96px]">{eur(goal)}</p>
        <p className="mt-1 text-[18px] text-neutral-500 lg:text-[26px]">par mois</p>
        <input
          type="range"
          min={500}
          max={30000}
          step={500}
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          className="mt-8 h-3 w-full cursor-pointer accent-black lg:h-5"
          aria-label="Objectif mensuel"
        />
        <div className="mt-2 flex justify-between text-[15px] font-medium text-neutral-500 lg:text-[20px]">
          <span>500 €</span>
          <span>30 000 €</span>
        </div>
        <p className="mt-6 border-t border-black/10 pt-5 text-[19px] leading-snug text-neutral-700 lg:mt-6 lg:pt-6 lg:text-[24px]">
          À {price} € par mois et par client, il te faut <strong className="text-black">{Math.ceil(goal / price)} clients</strong>.
        </p>
      </div>
    </Frame>
  );
}

function PotentialScreen({
  goal,
  price,
  idea,
  answers,
  onNext,
}: {
  goal: number;
  price: number;
  idea: Idea;
  answers: Record<string, string>;
  onNext: () => void;
}) {
  const result = potential({ revenueGoal: goal, found_idea: JSON.stringify({ title: idea.title, price_per_month: price }) } as never);
  const sale = firstSale(answers.deadline);
  const checks = [
    `Ton objectif : ${eur(goal)} par mois`,
    `Ta première vente : ${LABELS[answers.deadline] ?? "cette semaine"}`,
    `Ton prix : ${price} € par mois`,
    `Tes paiements : ${LABELS[answers.payments] ?? "PayPal"}`,
    `Ton temps : ${LABELS[answers.hours] ?? "1 h par jour"}`,
    `Automatisé : ${answers.doneForYou === "non" ? "non" : "oui"}`,
  ];
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done > checks.length) return;
    const id = window.setTimeout(() => setDone((n) => n + 1), 600);
    return () => window.clearTimeout(id);
  }, [done, checks.length]);

  if (done <= checks.length) {
    return (
      <Frame index={7} kicker="Analyse en cours" title="On chiffre ton potentiel…">
        <ul className="grid gap-4 rounded-[28px] border-2 border-black/10 bg-white p-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-6 lg:p-12">
          {checks.map((label, i) => (
            <li key={label} className={cn("flex items-center gap-3 text-[19px] lg:text-[28px]", i <= done ? "text-black" : "text-neutral-300")}>
              <Spinner state={i < done ? "done" : i === done ? "running" : "waiting"} />
              {label}
            </li>
          ))}
        </ul>
      </Frame>
    );
  }

  const above = Math.round(((result.amount - goal) / goal) * 100);
  return (
    <Frame index={7} kicker="Ton potentiel" title="Tu peux viser plus haut que ton objectif." footer={<BigButton onClick={onNext}>Lancer mon business</BigButton>}>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="rounded-[28px] bg-black p-7 text-center text-white lg:p-9"
        >
          <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-white/60 lg:text-[20px]">Ton potentiel</p>
          <p className="mt-2 font-display text-[68px] font-bold leading-none tracking-[-0.04em] lg:text-[96px]">
            <CountUp value={result.amount} format={(n) => eur(n)} />
          </p>
          <p className="mt-2 text-[18px] text-white/70 lg:text-[26px]">par mois · +{above} % au-dessus de ton objectif</p>
          <div className="mt-7 flex flex-col gap-3 text-left lg:mt-7 lg:gap-4">
            {[
              { label: "Ton objectif", value: goal, width: (goal / result.amount) * 100, tone: "bg-white/35" },
              { label: "Ton potentiel", value: result.amount, width: 100, tone: "bg-white" },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-[16px] lg:text-[22px]">
                  <span className="text-white/70">{bar.label}</span>
                  <span className="font-bold">{eur(bar.value)}</span>
                </div>
                <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/10 lg:h-4">
                  <motion.div
                    className={cn("h-full rounded-full", bar.tone)}
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.width}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: EASE }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[17px] text-white/80 lg:text-[24px]">
            {result.customers} clients à {price} € par mois
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
          className="flex flex-col justify-center rounded-[28px] border-2 border-black bg-white p-7 text-center lg:p-10"
        >
          <p className="text-[15px] font-bold uppercase tracking-[0.14em] text-neutral-500 lg:text-[20px]">
            Tu as dit {LABELS[answers.deadline] ?? "cette semaine"}
          </p>
          <p className="mt-3 text-[22px] leading-tight text-neutral-700 lg:text-[30px]">{sale.lead}</p>
          <p className="mt-1 font-display text-[36px] font-bold leading-[1.05] tracking-[-0.03em] text-black lg:text-[44px]">{sale.when}</p>
        </motion.div>
      </div>
      <p className="mt-4 text-center text-[14px] text-neutral-500 lg:text-[16px]">Scénario calculé sur tes réponses, pas une promesse de revenus.</p>
    </Frame>
  );
}

const BUILD_STAGES = [
  { label: "Ton idée", detail: "validée" },
  { label: "Ton site", detail: "accueil, inscription, paiement" },
  { label: "Tes offres", detail: "prix et abonnements" },
  { label: "Tes vidéos", detail: "scripts TikTok et Reels" },
  { label: "Ton plan marketing", detail: "30 jours de contenu" },
  { label: "Tes paiements", detail: "branchés à ton compte" },
  { label: "Mise en ligne", detail: "ton site est publié" },
];
const BUILD_LOGS = [
  "Création de la page d'accueil…",
  "Écriture des textes de vente…",
  "Ajout de l'inscription et du paiement…",
  "Écriture de tes scripts vidéo…",
  "Planification de tes 30 jours de contenu…",
  "Connexion des paiements…",
  "Publication du site…",
];
const STAGE_MS = 1500;

function BuildScreen({ idea, onDone }: { idea: Idea; onDone: () => void }) {
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done >= BUILD_STAGES.length) {
      const id = window.setTimeout(onDone, 900);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setDone((n) => n + 1), STAGE_MS);
    return () => window.clearTimeout(id);
  }, [done, onDone]);
  const pct = Math.round((done / BUILD_STAGES.length) * 100);

  return (
    <Frame index={8} kicker="Génération" title={`On crée ${idea.title}…`} subtitle="Ton site, tes vidéos et ton plan marketing.">
      <div className="rounded-[28px] border-2 border-black/10 bg-white p-6 lg:p-12">
        <div className="flex items-end justify-between">
          <span className="text-[16px] font-bold uppercase tracking-[0.12em] text-neutral-500 lg:text-[22px]">Progression</span>
          <span className="font-display text-[34px] font-bold leading-none text-black tabular-nums lg:text-[64px]">{pct}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/10 lg:h-5">
          <motion.div className="h-full rounded-full bg-black" animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: EASE }} />
        </div>
        <ul className="mt-6 grid gap-3.5 lg:mt-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-6">
          {BUILD_STAGES.map((stage, i) => {
            const state = i < done ? "done" : i === done ? "running" : "waiting";
            return (
              <li key={stage.label} className="flex items-center gap-3 lg:gap-4">
                <Spinner state={state} />
                <span className={cn("flex-1", state === "waiting" && "opacity-35")}>
                  <span className="block text-[20px] font-bold leading-tight text-black lg:text-[30px]">{stage.label}</span>
                  <span className="block text-[15px] text-neutral-500 lg:text-[20px]">{stage.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <AnimatePresence mode="wait">
          <motion.p
            key={Math.min(done, BUILD_LOGS.length - 1)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-6 rounded-[14px] bg-neutral-100 px-4 py-3 font-mono text-[15px] text-neutral-700 lg:mt-10 lg:px-6 lg:py-5 lg:text-[22px]"
          >
            {"> "}
            {done >= BUILD_LOGS.length ? "Terminé." : BUILD_LOGS[done]}
          </motion.p>
        </AnimatePresence>
      </div>
    </Frame>
  );
}

function LiveScreen({ idea, price, onReplay }: { idea: Idea; price: number; onReplay: () => void }) {
  const url = `${slug(idea.title)}.vercel.app`;
  return (
    <Frame>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <div className="flex items-center gap-3 lg:gap-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#16a34a] lg:size-20">
            <Check className="size-7 text-white lg:size-11" strokeWidth={3} />
          </span>
          <div>
            <p className="font-display text-[30px] font-bold leading-tight tracking-[-0.03em] text-black lg:text-[56px]">{idea.title} est en ligne</p>
            <p className="text-[16px] text-neutral-500 lg:text-[22px]">Généré en 11 secondes</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
        className="mt-6 overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] lg:mt-10"
      >
        <div className="flex items-center gap-2 border-b border-black/10 bg-neutral-100 px-4 py-3 lg:px-6 lg:py-4">
          <span className="size-3 rounded-full bg-[#ff5f57] lg:size-4" />
          <span className="size-3 rounded-full bg-[#febc2e] lg:size-4" />
          <span className="size-3 rounded-full bg-[#28c840] lg:size-4" />
          <span className="ml-2 flex-1 truncate rounded-[10px] bg-white px-3 py-1.5 text-center text-[14px] text-neutral-600 lg:mx-auto lg:max-w-xl lg:text-[18px]">
            🔒 {url}
          </span>
        </div>

        <div className="px-5 pb-6 pt-4 lg:px-12 lg:pb-12 lg:pt-8">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 lg:gap-3">
              <span
                className="flex size-8 items-center justify-center rounded-[8px] text-[15px] font-bold text-white lg:size-11 lg:text-[20px]"
                style={{ background: idea.color }}
              >
                {idea.title[0]}
              </span>
              <span className="text-[18px] font-bold text-black lg:text-[26px]">{idea.title}</span>
            </span>
            <span className="rounded-[8px] px-3 py-1.5 text-[13px] font-bold text-white lg:px-5 lg:py-2.5 lg:text-[17px]" style={{ background: idea.color }}>
              Essai gratuit
            </span>
          </div>

          <div className="lg:mt-6 lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-12">
            <div>
              <h2 className="mt-7 font-display text-[30px] font-bold leading-[1.08] tracking-[-0.03em] text-black lg:text-[54px]">{idea.pitch}</h2>
              <p className="mt-3 text-[16px] leading-snug text-neutral-600 lg:text-[22px]">{idea.target}</p>
              <div className="mt-5 flex gap-2 lg:gap-3">
                <span
                  className="whitespace-nowrap rounded-[12px] px-4 py-3 text-[14px] font-bold text-white lg:px-6 lg:py-4 lg:text-[19px]"
                  style={{ background: idea.color }}
                >
                  Commencer gratuitement
                </span>
                <span className="whitespace-nowrap rounded-[12px] border border-black/15 px-4 py-3 text-[14px] font-bold text-black lg:px-6 lg:py-4 lg:text-[19px]">
                  Voir la démo
                </span>
              </div>
            </div>
            <div className="mt-6 rounded-[18px] border-2 p-5 text-center lg:mt-7 lg:p-8" style={{ borderColor: idea.color }}>
              <p className="text-[14px] font-bold uppercase tracking-[0.12em] text-neutral-500 lg:text-[17px]">Abonnement</p>
              <p className="mt-1 font-display text-[40px] font-bold leading-none text-black lg:text-[64px]">
                {price} €<span className="text-[18px] font-medium text-neutral-500 lg:text-[24px]"> / mois</span>
              </p>
              <p className="mt-2 text-[14px] text-neutral-500 lg:text-[17px]">Sans engagement · paiement par carte</p>
            </div>
          </div>

          <div className="mt-7 grid gap-2.5 lg:mt-10 lg:grid-cols-3 lg:gap-4">
            {idea.features.map((f) => (
              <div key={f} className="flex items-center gap-3 rounded-[12px] bg-neutral-50 px-4 py-3 lg:px-5 lg:py-5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full lg:size-8" style={{ background: idea.color }}>
                  <Check className="size-3.5 text-white lg:size-4" strokeWidth={3} />
                </span>
                <span className="text-[16px] font-medium text-black lg:text-[20px]">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="mt-8 lg:flex lg:justify-center">
        <button
          type="button"
          onClick={onReplay}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] border-2 border-black/15 text-[18px] font-bold text-black lg:w-auto lg:px-12"
        >
          <RotateCcw className="size-5" /> Rejouer
        </button>
      </div>
    </Frame>
  );
}

/* ───────────────────────── flow ───────────────────────── */

export function Simulation() {
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [step, setStep] = useState<StepId>("intro");
  const [goal, setGoal] = useState(5000);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const idea = IDEAS[ideaIndex];
  const price = Number(answers.price) || idea.price;

  const go = (id: StepId) => {
    setStep(id);
    document.getElementById("simulation-scroll")?.scrollTo({ top: 0 });
  };
  const next = () => go(STEPS[STEPS.indexOf(step) + 1]);
  const back = () => go(STEPS[Math.max(0, STEPS.indexOf(step) - 1)]);
  const pick = (key: string) => (id: string) => {
    setAnswers((a) => ({ ...a, [key]: id }));
    window.setTimeout(next, 350);
  };
  const replay = () => {
    setAnswers({});
    setGoal(5000);
    setIdeaIndex((i) => (i + 1) % IDEAS.length);
    go("intro");
  };

  let screen: React.ReactNode;
  switch (step) {
    case "intro":
      screen = (
        <Frame
          kicker="Simulation (non filmée)"
          title="Choisis le SaaS à générer."
          subtitle="Rien n'est enregistré : aucun compte, aucun paiement. Lance, puis filme."
          footer={<BigButton onClick={next}>Commencer</BigButton>}
        >
          <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
            {IDEAS.map((option, i) => (
              <button
                key={option.title}
                type="button"
                onClick={() => setIdeaIndex(i)}
                className={cn("rounded-[18px] border-2 bg-white px-5 py-4 text-left", i === ideaIndex ? "border-black" : "border-black/10")}
              >
                <span className="block text-[20px] font-bold text-black">{option.title}</span>
                <span className="block text-[16px] text-neutral-600">{option.pitch}</span>
              </button>
            ))}
          </div>
        </Frame>
      );
      break;
    case "goal":
      screen = <GoalScreen goal={goal} setGoal={setGoal} price={price} onNext={next} />;
      break;
    case "deadline":
      screen = (
        <Frame index={2} onBack={back} kicker="Ta première vente" title="En combien de temps tu veux ta première vente ?">
          <Choices options={DEADLINES} value={answers.deadline} onPick={pick("deadline")} />
        </Frame>
      );
      break;
    case "price":
      screen = (
        <Frame index={3} onBack={back} kicker="Ton prix" title="Quel prix tu veux facturer à tes clients ?">
          <Choices options={PRICES} value={answers.price} onPick={pick("price")} />
        </Frame>
      );
      break;
    case "payments":
      screen = (
        <Frame index={4} onBack={back} kicker="Tes paiements" title="Sur quoi tu veux recevoir tes paiements ?">
          <Choices options={PAYMENTS} value={answers.payments} onPick={pick("payments")} />
        </Frame>
      );
      break;
    case "hours":
      screen = (
        <Frame index={5} onBack={back} kicker="Ton temps" title="Combien de temps tu veux y consacrer ?">
          <Choices options={HOURS} value={answers.hours} onPick={pick("hours")} />
        </Frame>
      );
      break;
    case "doneForYou":
      screen = (
        <Frame index={6} onBack={back} kicker="Ton business" title="Tu veux qu'on le fasse à ta place ?">
          <Choices options={YES_NO} value={answers.doneForYou} onPick={pick("doneForYou")} />
        </Frame>
      );
      break;
    case "potential":
      screen = <PotentialScreen goal={goal} price={price} idea={idea} answers={answers} onNext={next} />;
      break;
    case "build":
      screen = <BuildScreen idea={idea} onDone={next} />;
      break;
    case "live":
      screen = <LiveScreen idea={idea} price={price} onReplay={replay} />;
      break;
  }

  return (
    <div id="simulation-scroll" className="fixed inset-0 z-[250] overflow-y-auto bg-[#f2f2ef] font-body text-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="min-h-full"
        >
          {screen}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
