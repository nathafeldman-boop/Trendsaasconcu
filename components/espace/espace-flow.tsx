"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Lightbulb, Compass, Wrench, ListChecks, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ChoiceOption } from "@/components/onboarding/choice-option";
import { createClient } from "@/lib/supabase/client";
import { StripeDashboard } from "@/components/espace/stripe-dashboard";
import { MarketingPanel } from "@/components/espace/marketing-panel";
import { SiteAnalysis } from "@/components/espace/site-analysis";
import { FloatingIcon } from "@/components/ui/floating-icon";

const TOOLS = [
  {
    id: "claude",
    name: "Claude Code",
    desc: "L'assistant de codage d'Anthropic. Très bon pour construire une app complète étape par étape avec toi.",
  },
  {
    id: "replit",
    name: "Replit",
    desc: "Éditeur en ligne avec IA intégrée (Replit Agent). Pratique pour coder et héberger sans rien installer.",
  },
  {
    id: "lovable",
    name: "Lovable",
    desc: "Génère une application web à partir d'une description, avec un aperçu visuel immédiat.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT / Codex",
    desc: "L'assistant d'OpenAI, avec un mode Codex pour écrire et exécuter du code. Beaucoup de tutoriels disponibles.",
  },
  {
    id: "grok",
    name: "Grok",
    desc: "L'assistant de xAI, avec des capacités de code. Une alternative si tu es déjà dans l'écosystème X.",
  },
];

const CHECKLIST_ITEMS = [
  { id: "site", label: "Génère ton site avec l'outil choisi et le prompt fourni" },
  { id: "auth", label: "Vérifie que l'inscription et la connexion fonctionnent" },
  { id: "payment", label: "Ajoute un moyen de paiement (Stripe Checkout, par exemple)" },
  { id: "deploy", label: "Déploie ton site (Vercel, Netlify...)" },
  { id: "test", label: "Teste le parcours complet toi-même, de bout en bout" },
  { id: "share", label: "Partage le lien à 5 personnes pour un premier retour" },
];

const IDEA_SUGGESTIONS = [
  "Un outil qui automatise une tâche répétitive dans un métier que tu connais bien (facturation, planning, suivi client...).",
  "Une version simplifiée d'un logiciel que tu trouves trop cher ou trop compliqué, pour un public précis.",
  "Un tableau de bord qui centralise des informations que les gens de ton secteur vont chercher à plusieurs endroits.",
];

type BuilderState = {
  has_idea: boolean | null;
  idea_text: string;
  chosen_tool: string | null;
  checklist: Record<string, boolean>;
  mvp_launched: boolean;
};

type MarketingState = {
  chosen_channel: string | null;
  tiktok_url: string;
  self_reported_views: number | null;
  submitted_at: string | null;
};

type Phase = "idea-choice" | "idea-text" | "idea-suggestions" | "tool" | "prompt" | "checklist" | "hub";

function initialPhase(b: BuilderState, hasExistingSaas: boolean): Phase {
  if (hasExistingSaas || b.mvp_launched) return "hub";
  if (b.has_idea === null) return "idea-choice";
  if (!b.idea_text) return b.has_idea ? "idea-text" : "idea-suggestions";
  if (!b.chosen_tool) return "tool";
  return "checklist";
}

export function EspaceFlow({
  userId,
  firstName,
  hasExistingSaas,
  existingUrl,
  hasStripeSubscription,
  checkoutSuccess,
  initialBuilder,
  initialMarketing,
}: {
  userId: string;
  firstName: string | null;
  hasExistingSaas: boolean;
  existingUrl: string | null;
  hasStripeSubscription: boolean;
  checkoutSuccess: boolean;
  initialBuilder: BuilderState;
  initialMarketing: MarketingState;
}) {
  const [builder, setBuilder] = useState<BuilderState>(initialBuilder);
  const [phase, setPhase] = useState<Phase>(() => initialPhase(initialBuilder, hasExistingSaas));
  const [ideaDraft, setIdeaDraft] = useState(initialBuilder.idea_text);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [promptSource, setPromptSource] = useState<"mistral" | "fallback" | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  async function persist(patch: Partial<BuilderState>) {
    const next = { ...builder, ...patch };
    setBuilder(next);
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("builder_progress").upsert({ user_id: userId, ...next });
  }

  async function fetchPrompt(idea: string, tool: string) {
    setLoadingPrompt(true);
    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "build", idea, tool }),
      });
      const data = await res.json();
      setPrompt(data.prompt);
      setPromptSource(data.source);
    } finally {
      setLoadingPrompt(false);
    }
  }

  if (phase === "hub") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <FloatingIcon>
          <Rocket className="size-5" strokeWidth={1.75} />
        </FloatingIcon>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">
              {firstName ? `Salut ${firstName}.` : "Ton espace."}
            </h1>
            <p className="mt-2 font-body text-ink-muted">
              La suite : trouver tes premiers clients, puis suivre tes revenus.
            </p>
          </div>
          {hasStripeSubscription && <ManageSubscriptionButton />}
        </div>
        {checkoutSuccess && (
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="font-body text-[14px] text-emerald-300">
              Paiement confirmé, merci ! Ton accès est actif.
            </p>
          </div>
        )}
        {hasExistingSaas && existingUrl && (
          <div className="mt-8">
            <SiteAnalysis url={existingUrl} />
          </div>
        )}
        <div className="mt-8">
          <MarketingPanel userId={userId} ideaText={builder.idea_text} initial={initialMarketing} />
        </div>
        <div className="mt-6">
          <StripeDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12 sm:px-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {phase === "idea-choice" && (
            <div>
              <FloatingIcon>
                <Lightbulb className="size-5" strokeWidth={1.75} />
              </FloatingIcon>
              <div className="mt-4">
                <Eyebrow>Ton idée</Eyebrow>
              </div>
              <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">
                As-tu déjà une idée de SaaS ?
              </h1>
              <div className="mt-8 flex flex-col gap-3">
                <ChoiceOption
                  label="Oui, j'ai déjà une idée"
                  selected={false}
                  onClick={() => {
                    persist({ has_idea: true });
                    setPhase("idea-text");
                  }}
                />
                <ChoiceOption
                  label="Non, aide-moi à en trouver une"
                  selected={false}
                  onClick={() => {
                    persist({ has_idea: false });
                    setPhase("idea-suggestions");
                  }}
                />
              </div>
            </div>
          )}

          {phase === "idea-text" && (
            <div>
              <FloatingIcon>
                <Lightbulb className="size-5" strokeWidth={1.75} />
              </FloatingIcon>
              <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">
                Décris ton idée en quelques phrases.
              </h1>
              <textarea
                value={ideaDraft}
                onChange={(e) => setIdeaDraft(e.target.value)}
                rows={5}
                placeholder="Ex : un outil qui aide les coachs sportifs à programmer leurs séances..."
                className="mt-6 w-full rounded-lg border border-ink/12 bg-ink/[0.02] p-4 font-body text-[15px] text-ink outline-none focus:border-accent/60"
              />
              <Button
                showArrow={false}
                disabled={!ideaDraft.trim()}
                onClick={() => {
                  persist({ idea_text: ideaDraft.trim() });
                  setPhase("tool");
                }}
                className="mt-6 w-full"
              >
                Continuer
              </Button>
            </div>
          )}

          {phase === "idea-suggestions" && (
            <div>
              <FloatingIcon>
                <Compass className="size-5" strokeWidth={1.75} />
              </FloatingIcon>
              <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">
                Quelques pistes pour démarrer.
              </h1>
              <p className="mt-2 font-body text-[14px] text-ink-muted">
                Choisis celle qui te parle le plus — tu pourras l&apos;affiner ensuite.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {IDEA_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setIdeaDraft(s);
                      persist({ idea_text: s });
                      setPhase("tool");
                    }}
                    className="rounded-lg border border-ink/12 bg-ink/[0.02] p-4 text-left font-body text-[14px] text-ink transition-colors hover:border-accent/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "tool" && (
            <div>
              <FloatingIcon>
                <Wrench className="size-5" strokeWidth={1.75} />
              </FloatingIcon>
              <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">
                Avec quel outil veux-tu coder ?
              </h1>
              <p className="mt-2 font-body text-[14px] text-ink-faint">
                Les offres gratuites et les tarifs changent souvent : vérifie l&apos;offre actuelle sur le
                site de l&apos;outil.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      persist({ chosen_tool: tool.id });
                      fetchPrompt(builder.idea_text, tool.id);
                      setPhase("prompt");
                    }}
                    className="flex flex-col gap-1 rounded-lg border border-ink/12 bg-ink/[0.02] p-4 text-left transition-colors hover:border-accent/40"
                  >
                    <span className="font-display text-[15px] font-semibold text-ink">{tool.name}</span>
                    <span className="font-body text-[13px] text-ink-muted">{tool.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "prompt" && (
            <div>
              <FloatingIcon>
                <Sparkles className="size-5" strokeWidth={1.75} />
              </FloatingIcon>
              <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">Ton prompt de démarrage.</h1>
              <p className="mt-2 font-body text-[14px] text-ink-muted">
                Colle-le dans l&apos;outil que tu as choisi pour lancer ta première version.
              </p>
              <div className="relative mt-6 rounded-lg border border-ink/12 bg-ink/[0.02] p-4">
                {loadingPrompt ? (
                  <p className="font-body text-[14px] text-ink-faint">Génération en cours...</p>
                ) : (
                  <pre className="whitespace-pre-wrap font-body text-[13px] leading-relaxed text-ink">
                    {prompt}
                  </pre>
                )}
                {!loadingPrompt && prompt && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(prompt);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-ink/15 bg-canvas/80 px-3 py-1.5 font-mono text-[11px] text-ink-muted hover:text-ink"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Copié" : "Copier"}
                  </button>
                )}
              </div>
              {promptSource === "fallback" && (
                <p className="mt-3 font-body text-[12px] text-ink-faint">
                  Prompt générique (l&apos;IA n&apos;est pas encore branchée côté serveur).
                </p>
              )}
              <Button showArrow={false} onClick={() => setPhase("checklist")} className="mt-6 w-full">
                J&apos;ai mon prompt, la suite
              </Button>
            </div>
          )}

          {phase === "checklist" && (
            <div>
              <FloatingIcon>
                <ListChecks className="size-5" strokeWidth={1.75} />
              </FloatingIcon>
              <h1 className="mt-4 font-display text-[28px] font-semibold text-ink">Ta checklist de lancement.</h1>
              <div className="mt-6 flex flex-col gap-3">
                {CHECKLIST_ITEMS.map((item) => {
                  const checked = !!builder.checklist[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        persist({ checklist: { ...builder.checklist, [item.id]: !checked } })
                      }
                      className="flex items-center gap-3 rounded-lg border border-ink/12 bg-ink/[0.02] px-4 py-3 text-left"
                    >
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-[6px] border ${
                          checked ? "border-accent bg-accent" : "border-ink/25"
                        }`}
                      >
                        {checked && <Check className="size-3.5 text-canvas" strokeWidth={3} />}
                      </span>
                      <span
                        className={`font-body text-[14px] ${checked ? "text-ink-faint line-through" : "text-ink"}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button
                showArrow={false}
                onClick={() => {
                  persist({ mvp_launched: true });
                  setPhase("hub");
                }}
                className="mt-6 w-full"
              >
                <Sparkles className="mr-1.5 size-4" />
                J&apos;ai lancé ma MVP
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError("Impossible d'ouvrir la gestion de l'abonnement pour l'instant.");
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={open}
        disabled={loading}
        className="shrink-0 rounded-full border border-ink/15 px-4 py-2 font-body text-[13px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink disabled:opacity-50"
      >
        {loading ? "..." : "Gérer mon abonnement"}
      </button>
      {error && <p className="font-body text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
