"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CreditCard,
  Database,
  Lightbulb,
  Loader2,
  type LucideIcon,
  Code2,
  Rocket,
  Server,
  Sparkles,
  RefreshCw,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { HERO_IDEA_STORAGE_KEY } from "@/components/landing/hero-prompt";
import { createClient } from "@/lib/supabase/client";
import {
  CHECKLIST_HELP,
  CHECKLIST_ITEMS,
  CODE_TOOLS,
  DATA_OPTIONS,
  HOSTS,
  IDEA_SUGGESTIONS,
  PAYMENT_GUIDE,
  type ToolOption,
} from "@/lib/espace/content";
import { ideaToText, type SaasIdea } from "@/lib/espace/ideas";
import { creationRecommendations } from "@/lib/espace/recommendations";
import { WelcomeTour } from "@/components/vsl/welcome-tour";
import { Recommendations } from "@/components/espace/recommendations";
import { PromptBlock, scrollToSection, StatusChip, Steps, TabHeader } from "@/components/espace/kit";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/track";

export type BuilderState = {
  has_idea: boolean | null;
  idea_text: string;
  chosen_tool: string | null;
  checklist: Record<string, boolean>;
  mvp_launched: boolean;
};

/** Must match the cache key /api/prompt computes server-side. */
function promptKey(tool: string | null, idea: string) {
  return `${tool ?? "autre"}::${idea.trim().slice(0, 2000)}`;
}

export function CreationTab({
  userId,
  firstName,
  checkoutSuccess,
  hasExistingSaas,
  autopilotStarted,
  initialBuilder,
  initialIdeas,
  initialPrompt,
}: {
  userId: string;
  firstName: string | null;
  checkoutSuccess: boolean;
  hasExistingSaas: boolean;
  autopilotStarted: boolean;
  initialBuilder: BuilderState;
  initialIdeas: SaasIdea[] | null;
  initialPrompt: { text: string; key: string } | null;
}) {
  const [builder, setBuilder] = useState<BuilderState>(initialBuilder);
  const [saveError, setSaveError] = useState(false);

  async function persist(patch: Partial<BuilderState>) {
    setBuilder((b) => ({ ...b, ...patch }));
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.from("builder_progress").upsert({ user_id: userId, ...patch });
    setSaveError(!!error);
  }

  function toggle(id: string) {
    track("checklist_toggled", { item: id, done: !builder.checklist[id] });
    persist({ checklist: { ...builder.checklist, [id]: !builder.checklist[id] } });
  }

  const recs = useMemo(
    () =>
      creationRecommendations({
        idea: builder.idea_text,
        tool: builder.chosen_tool,
        checklist: builder.checklist,
        mvpLaunched: builder.mvp_launched,
        hasExistingSaas,
        autopilotStarted,
      }),
    [builder, hasExistingSaas, autopilotStarted]
  );

  const stages = [
    { id: "idee", label: "Idée", done: !!builder.idea_text },
    { id: "code", label: "Code", done: !!builder.chosen_tool && !!builder.checklist.site },
    { id: "hebergement", label: "Hébergement", done: !!builder.checklist.deploy },
    { id: "donnees", label: "Données", done: !!builder.checklist.auth },
    { id: "paiements", label: "Paiements", done: !!builder.checklist.payment },
    { id: "lancement", label: "Lancement", done: builder.mvp_launched },
  ];
  const doneCount =
    Number(!!builder.idea_text) +
    Number(!!builder.chosen_tool) +
    CHECKLIST_ITEMS.filter((item) => builder.checklist[item.id]).length +
    Number(builder.mvp_launched);
  const progress = Math.round((doneCount / (CHECKLIST_ITEMS.length + 3)) * 100);

  return (
    <div className="mx-auto flex max-w-[940px] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <TabHeader
        eyebrow="Création de SaaS"
        title={firstName ? `${firstName}, on construit ton SaaS.` : "On construit ton SaaS."}
        sub="De l'idée à la mise en ligne, une étape à la fois. Chaque étape a son guide et son prompt prêt à coller."
      >
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <ProgressRing value={progress} />
          <WelcomeTour openOnArrival={checkoutSuccess} />
        </div>
      </TabHeader>

      {checkoutSuccess && (
        <div className="rounded-[18px] border border-success/30 bg-success/10 p-4 font-body text-[14px] text-success">
          Paiement confirmé, merci ! Ton accès est actif : tout l&apos;espace est à toi.
        </div>
      )}
      {saveError && (
        <p className="font-body text-[13px] text-red-400">
          Ta progression n&apos;a pas pu être enregistrée. Vérifie ta connexion et réessaie.
        </p>
      )}

      <nav aria-label="Étapes" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {stages.map((stage, i) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => scrollToSection(stage.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 font-body text-[13px] transition-colors",
              stage.done
                ? "border-success/30 bg-success/10 text-success"
                : "border-ink/12 text-ink-muted hover:border-accent/40 hover:text-ink"
            )}
          >
            {stage.done ? <Check className="size-3.5" strokeWidth={3} /> : <span className="font-mono text-[11px]">{i + 1}</span>}
            {stage.label}
          </button>
        ))}
      </nav>

      <Recommendations items={recs} />

      <IdeaSection builder={builder} persist={persist} initialIdeas={initialIdeas} />
      <CodeSection builder={builder} persist={persist} toggle={toggle} initialPrompt={initialPrompt} />

      <Section
        id="hebergement"
        num="03"
        icon={Server}
        title="Où héberger"
        sub="Mettre ton site en ligne à une vraie adresse, accessible à tes clients."
        done={!!builder.checklist.deploy}
      >
        <OptionGuide options={HOSTS} />
        <CheckRow checked={!!builder.checklist.deploy} label="Mon site est en ligne" onToggle={() => toggle("deploy")} />
      </Section>

      <Section
        id="donnees"
        num="04"
        icon={Database}
        title="Données et comptes utilisateurs"
        sub="Où vivent les comptes de tes clients et leurs données. Supabase pour démarrer, un VPS si tu veux tout gérer."
        done={!!builder.checklist.auth}
      >
        <OptionGuide options={DATA_OPTIONS} />
        <CheckRow
          checked={!!builder.checklist.auth}
          label="L'inscription et la connexion fonctionnent"
          onToggle={() => toggle("auth")}
        />
      </Section>

      <Section
        id="paiements"
        num="05"
        icon={CreditCard}
        title="Paiements"
        sub="Encaisser des abonnements avec Stripe : en mode test d'abord, en vrai ensuite."
        done={!!builder.checklist.payment}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-[12px] border border-ink/10 bg-ink/[0.04]">
            <BrandLogo brand="stripe" className="size-5" />
          </span>
          <a
            href="https://dashboard.stripe.com/register"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-body text-[14px] font-medium text-ink hover:text-accent"
          >
            Ouvrir Stripe <ArrowUpRight className="size-3.5" />
          </a>
        </div>
        <div className="mt-5">
          <Steps steps={PAYMENT_GUIDE.steps} />
        </div>
        <div className="mt-5">
          <PromptBlock label="Prompt Stripe" text={PAYMENT_GUIDE.prompt} />
        </div>
        <p className="mt-4 font-body text-[13px] text-ink-faint">
          Une fois en ligne, connecte ton Stripe dans{" "}
          <Link href="/espace/revenus" className="text-accent underline underline-offset-2">
            Revenus
          </Link>{" "}
          pour suivre ton MRR et recevoir des conseils sur ton prix.
        </p>
        <CheckRow
          checked={!!builder.checklist.payment}
          label="Un paiement test fonctionne de bout en bout"
          onToggle={() => toggle("payment")}
        />
      </Section>

      <LaunchSection builder={builder} persist={persist} toggle={toggle} />
    </div>
  );
}

// ───────────────────────── Layout pieces

function Section({
  id,
  num,
  icon: Icon,
  title,
  sub,
  done,
  children,
}: {
  id: string;
  num: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel scroll-mt-16 rounded-[26px] p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-accent/25 bg-accent/10 text-accent">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-[11px] tracking-[0.18em] text-ink-faint">ÉTAPE {num}</span>
            <StatusChip done={done} />
          </div>
          <h2 className="mt-1.5 font-display text-[22px] font-semibold leading-tight text-ink">{title}</h2>
          <p className="mt-1 font-body text-[14px] leading-relaxed text-ink-muted">{sub}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px var(--color-accent))" }}
        />
      </svg>
      <div>
        <p className="font-display text-[22px] font-semibold text-ink">{value}%</p>
        <p className="font-body text-[12px] text-ink-faint">de ton lancement</p>
      </div>
    </div>
  );
}

function CheckRow({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "mt-6 flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left transition-colors",
        checked ? "border-success/30 bg-success/[0.07]" : "border-ink/12 hover:border-accent/40"
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-[6px] border",
          checked ? "border-success bg-success" : "border-ink/25"
        )}
      >
        {checked && <Check className="size-3.5 text-canvas" strokeWidth={3} />}
      </span>
      <span className={cn("font-body text-[14px]", checked ? "text-success" : "text-ink")}>{label}</span>
    </button>
  );
}

function ToolMark({ tool }: { tool: ToolOption }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-ink/10 bg-ink/[0.04]">
      {tool.brand ? (
        <BrandLogo brand={tool.brand} className="size-5" />
      ) : (
        <span className="font-display text-[16px] font-semibold text-ink-muted">{tool.name[0]}</span>
      )}
    </span>
  );
}

/** Pick an option, see its steps and its prompt (hosting, data). */
function OptionGuide({ options }: { options: (ToolOption & { steps: string[]; prompt: string })[] }) {
  const [selected, setSelected] = useState(options.find((o) => o.recommended)?.id ?? options[0].id);
  const option = options.find((o) => o.id === selected) ?? options[0];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setSelected(o.id)}
            className={cn(
              "flex items-start gap-3.5 rounded-[18px] border p-4 text-left transition-colors",
              o.id === selected ? "border-accent/50 bg-accent/[0.07]" : "border-ink/10 hover:border-ink/25"
            )}
          >
            <ToolMark tool={o} />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[15px] font-semibold text-ink">{o.name}</span>
                {o.recommended && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-accent">
                    Conseillé
                  </span>
                )}
              </span>
              <span className="mt-1 block font-body text-[13px] leading-relaxed text-ink-muted">{o.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">
              Comment faire avec {option.name}
            </p>
            <a
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-body text-[13px] text-accent hover:underline"
            >
              Ouvrir {option.name} <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          <Steps steps={option.steps} />
          <div className="mt-5">
            <PromptBlock label={`Prompt ${option.name}`} text={option.prompt} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ───────────────────────── 01 · Idée

type Persist = (patch: Partial<BuilderState>) => Promise<void>;

function IdeaSection({
  builder,
  persist,
  initialIdeas,
}: {
  builder: BuilderState;
  persist: Persist;
  initialIdeas: SaasIdea[] | null;
}) {
  const [mode, setMode] = useState<"view" | "mine" | "ai">(builder.idea_text ? "view" : initialIdeas?.length ? "ai" : "mine");
  const [draft, setDraft] = useState(builder.idea_text);
  const [ideas, setIdeas] = useState<SaasIdea[] | null>(initialIdeas);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function openMine() {
    setMode("mine");
    if (!draft.trim()) {
      try {
        // Whatever they typed in the landing page's idea box.
        const fromHero = window.localStorage.getItem(HERO_IDEA_STORAGE_KEY);
        if (fromHero) setDraft(fromHero);
      } catch {
        // storage unavailable: start from an empty field
      }
    }
  }

  async function findIdeas(regenerate = false) {
    setMode("ai");
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate }),
      });
      const data = await res.json();
      track("ideas_generated", { regenerate, source: data.source ?? null, ok: Array.isArray(data.ideas) && data.ideas.length > 0 });
      if (Array.isArray(data.ideas) && data.ideas.length) {
        setIdeas(data.ideas);
      } else {
        setNote(data.message ?? "L'IA n'a pas pu proposer d'idées pour l'instant. Réessaie dans un moment, ou pars d'une de ces pistes :");
      }
    } catch {
      setNote("Erreur réseau. Réessaie dans un moment, ou pars d'une de ces pistes :");
    } finally {
      setLoading(false);
    }
  }

  async function save(text: string, hasIdea: boolean) {
    const idea = text.trim().slice(0, 2000);
    if (!idea) return;
    setDraft(idea);
    track("idea_saved", { source: hasIdea ? "own" : "ai" });
    await persist({ idea_text: idea, has_idea: hasIdea });
    setMode("view");
  }

  return (
    <Section
      id="idee"
      num="01"
      icon={Lightbulb}
      title="Ton idée"
      sub="Pour qui, quel problème, combien ça leur coûte aujourd'hui. Tout le reste en découle."
      done={!!builder.idea_text}
    >
      {mode === "view" && builder.idea_text ? (
        <div>
          <div className="rounded-[18px] border border-accent/25 bg-accent/[0.05] p-5">
            <p className="whitespace-pre-wrap font-body text-[14.5px] leading-relaxed text-ink">{builder.idea_text}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openMine}
              className="rounded-full border border-ink/12 px-4 py-2 font-body text-[13px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
            >
              Modifier mon idée
            </button>
            <button
              type="button"
              onClick={() => (ideas?.length ? setMode("ai") : findIdeas())}
              className="rounded-full border border-ink/12 px-4 py-2 font-body text-[13px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
            >
              {ideas?.length ? "Revoir mes 3 idées IA" : "Voir 3 idées proposées par l'IA"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-2 rounded-full border border-ink/10 bg-ink/[0.03] p-1">
            {(
              [
                ["mine", "J'ai mon idée"],
                ["ai", "Propose-moi 3 idées"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => (id === "mine" ? openMine() : ideas?.length ? setMode("ai") : findIdeas())}
                className={cn(
                  "rounded-full px-4 py-2.5 font-body text-[13.5px] font-medium transition-colors",
                  mode === id ? "bg-ink text-canvas" : "text-ink-muted hover:text-ink"
                )}
              >
                {id === "ai" && <Sparkles className="mr-1.5 inline size-3.5" />}
                {label}
              </button>
            ))}
          </div>

          {mode === "mine" && (
            <div className="mt-5">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                placeholder="Ex : un outil qui aide les coachs sportifs indépendants à programmer les séances de leurs clients et à se faire payer chaque mois..."
                className="w-full rounded-[16px] border border-ink/12 bg-ink/[0.03] p-4 font-body text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-accent/60"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button showArrow={false} size="sm" disabled={!draft.trim()} onClick={() => save(draft, true)}>
                  Enregistrer mon idée
                </Button>
                {builder.idea_text && (
                  <button type="button" onClick={() => setMode("view")} className="font-body text-[13px] text-ink-faint hover:text-ink">
                    Annuler
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === "ai" && (
            <div className="mt-5">
              {loading ? (
                <div className="flex items-center gap-3 rounded-[18px] border border-ink/10 bg-ink/[0.03] p-5">
                  <Loader2 className="size-5 animate-spin text-accent" />
                  <div>
                    <p className="font-body text-[14px] text-ink">Claude analyse ton profil et cherche tes 3 idées...</p>
                    <p className="font-body text-[12.5px] text-ink-faint">Ça prend 20 à 40 secondes. Reste sur la page.</p>
                  </div>
                </div>
              ) : ideas?.length ? (
                <div className="flex flex-col gap-4">
                  {ideas.map((idea, i) => (
                    <IdeaCard
                      key={`${idea.title}-${i}`}
                      idea={idea}
                      index={i}
                      chosen={builder.idea_text === ideaToText(idea)}
                      onChoose={() => save(ideaToText(idea), false)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => findIdeas(true)}
                    className="flex items-center gap-1.5 self-start font-body text-[12.5px] text-ink-faint hover:text-ink"
                  >
                    <RefreshCw className="size-3.5" /> Aucune ne me parle, propose-m&apos;en 3 autres
                  </button>
                </div>
              ) : note ? (
                <div>
                  <p className="font-body text-[13.5px] text-ink-muted">{note}</p>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {IDEA_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setDraft(s);
                          setMode("mine");
                        }}
                        className="rounded-[14px] border border-ink/10 bg-ink/[0.02] p-4 text-left font-body text-[14px] text-ink transition-colors hover:border-accent/40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[18px] border border-ink/10 bg-ink/[0.03] p-5">
                  <p className="font-body text-[14px] leading-relaxed text-ink-muted">
                    L&apos;IA part de tes réponses au questionnaire (ton temps, ta cible, ce que tu refuses de faire) et te
                    propose 3 idées de SaaS avec leur prix, leur MVP et où trouver les premiers clients.
                  </p>
                  <Button showArrow={false} size="sm" className="mt-4" onClick={() => findIdeas()}>
                    <Sparkles className="-mt-0.5 mr-1.5 inline size-4" /> Trouver mes 3 idées
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

function IdeaCard({
  idea,
  index,
  chosen,
  onChoose,
}: {
  idea: SaasIdea;
  index: number;
  chosen: boolean;
  onChoose: () => void;
}) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={cn(
        "rounded-[20px] border p-5 transition-colors",
        chosen ? "border-success/40 bg-success/[0.05]" : "border-ink/10 bg-ink/[0.025]"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-accent">Idée {index + 1}</p>
          <h3 className="mt-1.5 font-display text-[18px] font-semibold leading-snug text-ink">{idea.title}</h3>
          <p className="mt-1.5 font-body text-[14px] leading-relaxed text-ink-muted">{idea.pitch}</p>
        </div>
        <span className="shrink-0 rounded-full border border-ink/12 px-3 py-1.5 font-display text-[14px] font-semibold text-ink">
          {idea.price_per_month} €<span className="font-body text-[11px] font-normal text-ink-faint">/mois</span>
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-ink/[0.05] px-3 py-1 font-body text-[12px] text-ink-muted">🎯 {idea.target}</span>
        <span className="rounded-full bg-ink/[0.05] px-3 py-1 font-body text-[12px] text-ink-muted">⏱ {idea.build_time}</span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-4 flex items-center gap-1 font-body text-[12.5px] text-ink-faint hover:text-ink"
      >
        {open ? "Masquer le détail" : "Voir le détail"}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail title="Le problème">{idea.problem}</Detail>
              <Detail title="Pourquoi toi">{idea.why_you}</Detail>
              <Detail title="La MVP">
                <ul className="flex flex-col gap-1">
                  {idea.mvp.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-accent">·</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </Detail>
              <Detail title="Tes 10 premiers clients">{idea.first_customers}</Detail>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5">
        {chosen ? (
          <span className="inline-flex items-center gap-1.5 font-body text-[13.5px] font-medium text-success">
            <Check className="size-4" strokeWidth={3} /> C&apos;est ton idée
          </span>
        ) : (
          <Button showArrow={false} size="sm" variant="secondary" onClick={onChoose}>
            Je prends celle-ci
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">{title}</p>
      <div className="mt-1.5 font-body text-[13.5px] leading-relaxed text-ink-muted">{children}</div>
    </div>
  );
}

// ───────────────────────── 02 · Où coder

function CodeSection({
  builder,
  persist,
  toggle,
  initialPrompt,
}: {
  builder: BuilderState;
  persist: Persist;
  toggle: (id: string) => void;
  initialPrompt: { text: string; key: string } | null;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const tool = CODE_TOOLS.find((t) => t.id === builder.chosen_tool) ?? null;
  const currentKey = promptKey(builder.chosen_tool, builder.idea_text);
  const currentPrompt = prompt?.key === currentKey ? prompt.text : null;

  async function writePrompt(regenerate = false) {
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "build", tool: builder.chosen_tool, regenerate }),
      });
      const data = await res.json();
      if (typeof data.prompt === "string") setPrompt({ text: data.prompt, key: currentKey });
      track("build_prompt_generated", { tool: builder.chosen_tool, regenerate, source: data.source ?? null });
      if (data.message) setNote(data.message);
      else if (data.source === "fallback")
        setNote("Prompt de secours : l'IA n'a pas pu écrire ton prompt sur mesure. Réessaie dans un moment.");
      else if (!data.prompt) setNote("Impossible d'écrire le prompt pour l'instant. Réessaie dans un moment.");
    } catch {
      setNote("Erreur réseau, réessaie dans un moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section
      id="code"
      num="02"
      icon={Code2}
      title="Où coder"
      sub="L'outil de codage IA qui va construire ton SaaS. Ton prompt de build s'écrit pour lui."
      done={!!builder.chosen_tool && !!builder.checklist.site}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {CODE_TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              track("tool_chosen", { tool: t.id });
              persist({ chosen_tool: t.id });
            }}
            className={cn(
              "flex items-start gap-3.5 rounded-[18px] border p-4 text-left transition-colors",
              t.id === builder.chosen_tool ? "border-accent/50 bg-accent/[0.07]" : "border-ink/10 hover:border-ink/25"
            )}
          >
            <ToolMark tool={t} />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[15px] font-semibold text-ink">{t.name}</span>
                {t.recommended && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-accent">
                    Conseillé
                  </span>
                )}
              </span>
              <span className="mt-1 block font-body text-[13px] leading-relaxed text-ink-muted">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 font-body text-[12px] text-ink-faint">
        Les offres gratuites et les tarifs changent souvent : vérifie l&apos;offre du moment sur le site de l&apos;outil.
      </p>

      {tool && (
        <div className="mt-7 border-t border-ink/8 pt-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-[17px] font-semibold text-ink">Ton prompt de build pour {tool.name}</p>
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-body text-[13px] text-accent hover:underline"
            >
              Ouvrir {tool.name} <ArrowUpRight className="size-3.5" />
            </a>
          </div>

          {!builder.idea_text ? (
            <p className="mt-3 font-body text-[14px] text-ink-muted">
              Choisis d&apos;abord ton idée à l&apos;étape 01 : le prompt est écrit à partir d&apos;elle.
            </p>
          ) : loading ? (
            <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-ink/10 bg-ink/[0.03] p-5">
              <Loader2 className="size-5 animate-spin text-accent" />
              <div>
                <p className="font-body text-[14px] text-ink">Claude écrit ton prompt sur mesure...</p>
                <p className="font-body text-[12.5px] text-ink-faint">
                  Ton idée, ton niveau et {tool.name} : 20 à 40 secondes.
                </p>
              </div>
            </div>
          ) : currentPrompt ? (
            <div className="mt-4">
              <PromptBlock label={`Prompt de build · ${tool.name}`} text={currentPrompt} tall />
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <p className="font-body text-[12.5px] text-ink-faint">
                  Colle-le tel quel dans {tool.name}, puis valide le plan qu&apos;il te propose.
                </p>
                <button
                  type="button"
                  onClick={() => writePrompt(true)}
                  className="flex items-center gap-1.5 font-body text-[12.5px] text-ink-faint hover:text-ink"
                >
                  <RefreshCw className="size-3.5" /> Réécrire
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[18px] border border-ink/10 bg-ink/[0.03] p-5">
              <p className="font-body text-[14px] leading-relaxed text-ink-muted">
                Un prompt complet de 600 à 900 mots, écrit pour ton idée et pour {tool.name} : pages, base de données,
                paiements Stripe, mise en ligne, design. Tu n&apos;as qu&apos;à le coller.
              </p>
              <Button showArrow={false} size="sm" className="mt-4" onClick={() => writePrompt()}>
                <Sparkles className="-mt-0.5 mr-1.5 inline size-4" /> Écrire mon prompt de build
              </Button>
            </div>
          )}
          {note && <p className="mt-3 font-body text-[12.5px] text-ink-faint">{note}</p>}

          <CheckRow
            checked={!!builder.checklist.site}
            label={`J'ai généré la première version avec ${tool.name}`}
            onToggle={() => toggle("site")}
          />
        </div>
      )}
    </Section>
  );
}

// ───────────────────────── 06 · Lancement

function LaunchSection({
  builder,
  persist,
  toggle,
}: {
  builder: BuilderState;
  persist: Persist;
  toggle: (id: string) => void;
}) {
  const [helpOpen, setHelpOpen] = useState<string | null>(null);

  return (
    <Section
      id="lancement"
      num="06"
      icon={Rocket}
      title="Checklist de lancement"
      sub="Les 6 points qui séparent un projet d'un SaaS qui encaisse. Coche au fur et à mesure."
      done={builder.mvp_launched}
    >
      <div className="flex flex-col gap-2.5">
        {CHECKLIST_ITEMS.map((item) => {
          const checked = !!builder.checklist[item.id];
          const isOpen = helpOpen === item.id;
          return (
            <div
              key={item.id}
              className={cn(
                "rounded-[16px] border transition-colors",
                checked ? "border-success/25 bg-success/[0.05]" : "border-ink/10 bg-ink/[0.02]"
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <button type="button" onClick={() => toggle(item.id)} className="flex flex-1 items-center gap-3 text-left">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-[6px] border",
                      checked ? "border-success bg-success" : "border-ink/25"
                    )}
                  >
                    {checked && <Check className="size-3.5 text-canvas" strokeWidth={3} />}
                  </span>
                  <span className={cn("font-body text-[14px]", checked ? "text-ink-faint line-through" : "text-ink")}>
                    {item.label}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setHelpOpen(isOpen ? null : item.id)}
                  className="shrink-0 font-body text-[12px] text-ink-faint underline-offset-2 hover:text-accent hover:underline"
                >
                  {isOpen ? "Masquer" : "Comment faire ?"}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-ink/8 px-4 py-4">
                      <Steps steps={CHECKLIST_HELP[item.id] ?? []} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {builder.mvp_launched ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 rounded-[20px] border border-success/30 bg-success/[0.07] p-5"
        >
          <p className="flex items-center gap-2 font-display text-[17px] font-semibold text-success">
            <PartyPopper className="size-5" /> Ta MVP est lancée. Bravo !
          </p>
          <p className="mt-1.5 font-body text-[14px] text-ink-muted">
            Maintenant, place aux premiers clients et au suivi de tes revenus.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/espace/marketing" size="sm">
              Trouver mes premiers clients
            </Button>
            <Button href="/espace/revenus" size="sm" variant="secondary" showArrow={false}>
              Suivre mes revenus
            </Button>
          </div>
          <button
            type="button"
            onClick={() => persist({ mvp_launched: false })}
            className="mt-4 font-body text-[12px] text-ink-faint hover:text-ink"
          >
            Finalement, pas encore lancée
          </button>
        </motion.div>
      ) : (
        <Button showArrow={false} onClick={() => {
            track("mvp_launched");
            persist({ mvp_launched: true });
          }} className="mt-6 w-full">
          <Rocket className="-mt-0.5 mr-1.5 inline size-4" />
          J&apos;ai lancé ma MVP
        </Button>
      )}
    </Section>
  );
}
