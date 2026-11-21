"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Landmark, Loader2, RotateCcw } from "lucide-react";
import { Beetle } from "@/components/simulation/beetle";
import { PaymentsPhone } from "@/components/ui/payments-phone";
import { CountUp } from "@/components/ui/count-up";
import { potential } from "@/components/onboarding/funnel";
import { cn } from "@/lib/utils";

// Internal replay of the "viral" part of the questionnaire (goal → choices →
// potential → phone → generation → the SaaS online), in light mode and large
// type so it films well on a phone. Nothing is saved, tracked or charged:
// no account, no API call, the idea comes from the list below.

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

const STEPS = ["intro", "goal", "payments", "deadline", "autoClients", "doneForYou", "potential", "phone", "build", "live"] as const;
type StepId = (typeof STEPS)[number];
const COUNTED = STEPS.length - 2; // intro and live aren't numbered

type Choice = { id: string; label: string; detail?: string; icon?: React.ReactNode };

const BRAND = (letter: string, bg: string) => (
  <span className="flex size-10 items-center justify-center rounded-xl text-[18px] font-bold text-white" style={{ background: bg }}>
    {letter}
  </span>
);

const PAYMENTS: Choice[] = [
  { id: "stripe", label: "Stripe", detail: "cartes et abonnements", icon: BRAND("S", "#635bff") },
  { id: "paypal", label: "PayPal", detail: "le plus connu des acheteurs", icon: BRAND("P", "#003087") },
  { id: "revolut", label: "Revolut", detail: "encaissement rapide", icon: BRAND("R", "#111") },
  { id: "banque", label: "Mon compte bancaire", detail: "par virement", icon: <Landmark className="size-9 text-black" strokeWidth={1.6} /> },
];
const DEADLINES: Choice[] = [
  { id: "aujourdhui", label: "Aujourd'hui", detail: "je suis prêt" },
  { id: "semaine", label: "Cette semaine" },
  { id: "mois", label: "Dans le mois" },
  { id: "3mois", label: "D'ici 3 mois" },
];
const YES_NO: Choice[] = [
  { id: "oui", label: "Oui" },
  { id: "non", label: "Non" },
];

const LABELS: Record<string, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  revolut: "Revolut",
  banque: "ton compte bancaire",
  aujourdhui: "aujourd'hui",
  semaine: "cette semaine",
  mois: "dans le mois",
  "3mois": "d'ici 3 mois",
};

const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

function slug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
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
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-5 pb-10 pt-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-[22px] font-bold tracking-[-0.03em] text-black">SaaSFounder</span>
        {index !== undefined && (
          <span className="font-mono text-[15px] font-semibold text-neutral-500">
            {index} / {COUNTED}
          </span>
        )}
      </div>
      {index !== undefined && (
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-black/10">
          <motion.div
            className="h-full rounded-full bg-black"
            initial={false}
            animate={{ width: `${(index / COUNTED) * 100}%` }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
      )}
      <div className="mt-4 h-7">
        {onBack && (
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-[16px] font-medium text-neutral-500">
            <ArrowLeft className="size-4" /> Retour
          </button>
        )}
      </div>
      {kicker && <p className="mt-4 text-[15px] font-bold uppercase tracking-[0.14em] text-neutral-500">{kicker}</p>}
      {title && <h1 className="mt-2 font-display text-[38px] font-bold leading-[1.06] tracking-[-0.035em] text-black">{title}</h1>}
      {subtitle && <p className="mt-3 text-[19px] leading-snug text-neutral-600">{subtitle}</p>}
      <div className="mt-7 flex-1">{children}</div>
      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
}

function BigButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-black text-[20px] font-bold text-white transition-transform active:scale-[0.97] disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function Choices({ options, value, onPick }: { options: Choice[]; value?: string; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 bg-white px-5 py-5 text-left transition-all active:scale-[0.98]",
              active ? "border-black shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)]" : "border-black/10"
            )}
          >
            {o.icon}
            <span className="flex-1">
              <span className="block text-[22px] font-bold text-black">{o.label}</span>
              {o.detail && <span className="block text-[16px] text-neutral-500">{o.detail}</span>}
            </span>
            <span className={cn("flex size-8 items-center justify-center rounded-full border-2", active ? "border-black bg-black" : "border-black/20")}>
              {active && <Check className="size-5 text-white" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── screens ───────────────────────── */

function GoalScreen({ goal, setGoal, idea, onNext, onBack }: { goal: number; setGoal: (n: number) => void; idea: Idea; onNext: () => void; onBack: () => void }) {
  const customers = Math.ceil(goal / idea.price);
  return (
    <Frame
      index={1}
      onBack={onBack}
      kicker="Ton objectif"
      title="Combien tu veux gagner par mois ?"
      subtitle="Glisse le curseur."
      footer={<BigButton onClick={onNext}>Continuer</BigButton>}
    >
      <Beetle />
      <div className="rounded-3xl border-2 border-black/10 bg-white p-6">
        <p className="font-display text-[64px] font-bold leading-none tracking-[-0.04em] text-black tabular-nums">{eur(goal)}</p>
        <p className="mt-1 text-[18px] text-neutral-500">par mois</p>
        <input
          type="range"
          min={1000}
          max={50000}
          step={500}
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          className="mt-8 h-3 w-full cursor-pointer accent-black"
          aria-label="Objectif mensuel"
        />
        <div className="mt-2 flex justify-between text-[15px] font-medium text-neutral-500">
          <span>1 000 €</span>
          <span>50 000 €</span>
        </div>
        <p className="mt-6 border-t border-black/10 pt-5 text-[19px] leading-snug text-neutral-700">
          Avec {idea.title} à {idea.price} € par mois, il te faut <strong className="text-black">{customers} clients</strong>.
        </p>
      </div>
    </Frame>
  );
}

function PotentialScreen({ goal, idea, answers, onNext }: { goal: number; idea: Idea; answers: Record<string, string>; onNext: () => void }) {
  const result = potential({
    revenueGoal: goal,
    found_idea: JSON.stringify({ title: idea.title, price_per_month: idea.price }),
  } as never);
  const checks = [
    `Ton idée : ${idea.title}`,
    `Ton objectif : ${eur(goal)} par mois`,
    `Tes paiements : ${LABELS[answers.payments] ?? "Stripe"}`,
    `Ta première vente : ${LABELS[answers.deadline] ?? "cette semaine"}`,
    `Clients automatiques : ${answers.autoClients === "non" ? "non" : "oui"}`,
    `Business créé pour toi : ${answers.doneForYou === "non" ? "non" : "oui"}`,
  ];
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done > checks.length) return;
    const id = window.setTimeout(() => setDone((n) => n + 1), 600);
    return () => window.clearTimeout(id);
  }, [done, checks.length]);

  if (done <= checks.length) {
    return (
      <Frame index={6} kicker="Analyse en cours" title="On analyse ton potentiel…">
        <ul className="flex flex-col gap-4 rounded-3xl border-2 border-black/10 bg-white p-6">
          {checks.map((label, i) => (
            <li key={label} className={cn("flex items-center gap-3 text-[19px]", i <= done ? "text-black" : "text-neutral-300")}>
              <span className="flex size-7 shrink-0 items-center justify-center">
                {i < done ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-black">
                    <Check className="size-4 text-white" strokeWidth={3} />
                  </span>
                ) : i === done ? (
                  <Loader2 className="size-6 animate-spin text-black" />
                ) : (
                  <span className="size-6 rounded-full border-2 border-black/15" />
                )}
              </span>
              {label}
            </li>
          ))}
        </ul>
      </Frame>
    );
  }

  const above = Math.round(((result.amount - goal) / goal) * 100);
  return (
    <Frame index={6} kicker="Ton potentiel" title="Tu peux viser plus haut que ton objectif." footer={<BigButton onClick={onNext}>Continuer</BigButton>}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="rounded-3xl bg-black p-7 text-center text-white"
      >
        <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-white/60">Ton potentiel</p>
        <p className="mt-2 font-display text-[68px] font-bold leading-none tracking-[-0.04em]">
          <CountUp value={result.amount} format={(n) => eur(n)} />
        </p>
        <p className="mt-2 text-[18px] text-white/70">par mois · +{above} % au-dessus de ton objectif</p>
        <div className="mt-7 flex flex-col gap-3 text-left">
          {[
            { label: "Ton objectif", value: goal, width: (goal / result.amount) * 100, tone: "bg-white/35" },
            { label: "Ton potentiel", value: result.amount, width: 100, tone: "bg-white" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-[16px]">
                <span className="text-white/70">{bar.label}</span>
                <span className="font-bold">{eur(bar.value)}</span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/10">
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
        <p className="mt-6 text-[17px] text-white/80">
          {result.customers} clients à {idea.price} € par mois
        </p>
      </motion.div>
      <p className="mt-4 text-center text-[14px] text-neutral-500">Scénario calculé sur tes réponses, pas une promesse de revenus.</p>
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
      <div className="rounded-3xl border-2 border-black/10 bg-white p-6">
        <div className="flex items-end justify-between">
          <span className="text-[16px] font-bold uppercase tracking-[0.12em] text-neutral-500">Progression</span>
          <span className="font-display text-[34px] font-bold leading-none text-black tabular-nums">{pct}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/10">
          <motion.div className="h-full rounded-full bg-black" animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: EASE }} />
        </div>
        <ul className="mt-6 flex flex-col gap-3.5">
          {BUILD_STAGES.map((stage, i) => {
            const state = i < done ? "done" : i === done ? "running" : "waiting";
            return (
              <li key={stage.label} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center">
                  {state === "done" ? (
                    <span className="flex size-7 items-center justify-center rounded-full bg-black">
                      <Check className="size-4 text-white" strokeWidth={3} />
                    </span>
                  ) : state === "running" ? (
                    <Loader2 className="size-6 animate-spin text-black" />
                  ) : (
                    <span className="size-6 rounded-full border-2 border-black/15" />
                  )}
                </span>
                <span className={cn("flex-1", state === "waiting" && "opacity-35")}>
                  <span className="block text-[20px] font-bold leading-tight text-black">{stage.label}</span>
                  <span className="block text-[15px] text-neutral-500">{stage.detail}</span>
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
            className="mt-6 rounded-xl bg-neutral-100 px-4 py-3 font-mono text-[15px] text-neutral-700"
          >
            {"> "}
            {done >= BUILD_LOGS.length ? "Terminé." : BUILD_LOGS[done]}
          </motion.p>
        </AnimatePresence>
      </div>
    </Frame>
  );
}

function LiveScreen({ idea, onReplay }: { idea: Idea; onReplay: () => void }) {
  const url = `${slug(idea.title)}.vercel.app`;
  return (
    <Frame>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#16a34a]">
            <Check className="size-7 text-white" strokeWidth={3} />
          </span>
          <div>
            <p className="font-display text-[30px] font-bold leading-tight tracking-[-0.03em] text-black">{idea.title} est en ligne</p>
            <p className="text-[16px] text-neutral-500">Généré en 11 secondes</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
        className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center gap-2 border-b border-black/10 bg-neutral-100 px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex-1 truncate rounded-lg bg-white px-3 py-1.5 text-center text-[14px] text-neutral-600">🔒 {url}</span>
        </div>

        <div className="px-5 pb-6 pt-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg text-[15px] font-bold text-white" style={{ background: idea.color }}>
                {idea.title[0]}
              </span>
              <span className="text-[18px] font-bold text-black">{idea.title}</span>
            </span>
            <span className="rounded-lg px-3 py-1.5 text-[13px] font-bold text-white" style={{ background: idea.color }}>
              Essai gratuit
            </span>
          </div>

          <h2 className="mt-7 font-display text-[30px] font-bold leading-[1.08] tracking-[-0.03em] text-black">{idea.pitch}</h2>
          <p className="mt-3 text-[16px] leading-snug text-neutral-600">{idea.target}</p>
          <div className="mt-5 flex gap-2">
            <span className="whitespace-nowrap rounded-[12px] px-4 py-3 text-[14px] font-bold text-white" style={{ background: idea.color }}>
              Commencer gratuitement
            </span>
            <span className="whitespace-nowrap rounded-[12px] border border-black/15 px-4 py-3 text-[14px] font-bold text-black">Voir la démo</span>
          </div>

          <div className="mt-7 grid gap-2.5">
            {idea.features.map((f) => (
              <div key={f} className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3">
                <span className="flex size-6 items-center justify-center rounded-full" style={{ background: idea.color }}>
                  <Check className="size-3.5 text-white" strokeWidth={3} />
                </span>
                <span className="text-[16px] font-medium text-black">{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border-2 p-5 text-center" style={{ borderColor: idea.color }}>
            <p className="text-[14px] font-bold uppercase tracking-[0.12em] text-neutral-500">Abonnement</p>
            <p className="mt-1 font-display text-[40px] font-bold leading-none text-black">
              {idea.price} €<span className="text-[18px] font-medium text-neutral-500"> / mois</span>
            </p>
            <p className="mt-2 text-[14px] text-neutral-500">Sans engagement · paiement par carte</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onReplay}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-black/15 text-[18px] font-bold text-black"
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
          kicker="Simulation interne"
          title="La création d'un SaaS, de A à Z."
          subtitle="Rien n'est enregistré : aucun compte, aucun paiement. Choisis l'idée, puis filme."
          footer={<BigButton onClick={next}>Lancer la simulation</BigButton>}
        >
          <div className="flex flex-col gap-3">
            {IDEAS.map((option, i) => (
              <button
                key={option.title}
                type="button"
                onClick={() => setIdeaIndex(i)}
                className={cn(
                  "rounded-2xl border-2 bg-white px-5 py-4 text-left",
                  i === ideaIndex ? "border-black" : "border-black/10"
                )}
              >
                <span className="block text-[20px] font-bold text-black">
                  {option.title} <span className="font-medium text-neutral-500">· {option.price} €/mois</span>
                </span>
                <span className="block text-[16px] text-neutral-600">{option.pitch}</span>
              </button>
            ))}
          </div>
        </Frame>
      );
      break;
    case "goal":
      screen = <GoalScreen goal={goal} setGoal={setGoal} idea={idea} onNext={next} onBack={back} />;
      break;
    case "payments":
      screen = (
        <Frame index={2} onBack={back} kicker="Tes paiements" title="Sur quoi tu veux recevoir tes paiements ?">
          <Choices options={PAYMENTS} value={answers.payments} onPick={pick("payments")} />
        </Frame>
      );
      break;
    case "deadline":
      screen = (
        <Frame index={3} onBack={back} kicker="Ta première vente" title="Quand veux-tu faire ta première vente ?">
          <Choices options={DEADLINES} value={answers.deadline} onPick={pick("deadline")} />
        </Frame>
      );
      break;
    case "autoClients":
      screen = (
        <Frame index={4} onBack={back} kicker="Tes clients" title="Tu veux qu'on ramène des clients automatiquement ?">
          <Choices options={YES_NO} value={answers.autoClients} onPick={pick("autoClients")} />
        </Frame>
      );
      break;
    case "doneForYou":
      screen = (
        <Frame index={5} onBack={back} kicker="Ton business" title="Tu veux qu'on crée ton business à ta place ?">
          <Choices options={YES_NO} value={answers.doneForYou} onPick={pick("doneForYou")} />
        </Frame>
      );
      break;
    case "potential":
      screen = <PotentialScreen goal={goal} idea={idea} answers={answers} onNext={next} />;
      break;
    case "phone": {
      const amount = `${idea.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;
      screen = (
        <Frame
          index={7}
          onBack={back}
          kicker="Dans quelques semaines"
          title={`Imagine ton téléphone avec ${idea.title}.`}
          footer={<BigButton onClick={next}>Générer mon business</BigButton>}
        >
          <PaymentsPhone
            notifications={[
              { when: "maintenant", amount, email: "xxxxxx@gmail.com" },
              { when: "il y a 8 min", amount, email: "xxxxxxx@outlook.fr" },
              { when: "il y a 34 min", amount, email: "xxxxx@gmail.com" },
            ]}
          />
        </Frame>
      );
      break;
    }
    case "build":
      screen = <BuildScreen idea={idea} onDone={next} />;
      break;
    case "live":
      screen = <LiveScreen idea={idea} onReplay={replay} />;
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
