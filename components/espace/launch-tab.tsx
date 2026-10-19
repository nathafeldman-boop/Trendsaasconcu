"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Heart, Loader2, Lock, Rocket } from "lucide-react";
import { BrandLogo, type Brand } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { CopyButton, StatusChip, TabHeader } from "@/components/espace/kit";
import type { ConnectionSummary, Provider } from "@/lib/connections/store";
import type { LaunchState } from "@/lib/launch/state";
import { NETLIFY_IMPORT_URL } from "@/lib/launch/netlify";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

// The launch autopilot: the member connects their accounts once, and
// SaaSFounder creates their repository (with the whole plan in it), their
// Supabase project and points their domain; their coding tool only has to
// be told « construis ».

const ERRORS: Record<string, string> = {
  not_connected: "Connecte d'abord ton compte.",
  reconnect: "La connexion a expiré : reconnecte ton compte.",
  no_idea: "Choisis d'abord ton idée dans l'onglet Création.",
  create_failed: "La création a échoué. Réessaie dans un instant.",
  commit_failed: "Le dépôt est créé, mais le plan n'a pas pu y être ajouté. Clique à nouveau pour réessayer.",
  name_taken: "Ce nom de dépôt est déjà pris sur ton compte GitHub.",
  no_organization: "Ton compte Supabase n'a pas encore d'organisation : crées-en une sur supabase.com, puis réessaie.",
  project_limit: "Ton compte Supabase gratuit a déjà 2 projets actifs : mets-en un en pause ou supprime-le, puis réessaie.",
  invalid_site: "Ça ne ressemble pas à une adresse Netlify (exemple : mon-saas.netlify.app).",
  invalid_token: "Cette clé ne fonctionne pas. Vérifie-la dans hPanel et réessaie.",
  no_site: "Ajoute d'abord l'adresse de ton site Netlify (étape 4).",
  unknown_domain: "Ce domaine n'est pas dans ton compte Hostinger.",
  invalid_records: "Hostinger a refusé la modification. Réessaie, ou fais-la à la main dans hPanel.",
  update_failed: "Hostinger a refusé la modification. Réessaie, ou fais-la à la main dans hPanel.",
  zone_unreadable: "Impossible de lire les réglages de ce domaine chez Hostinger. Réessaie dans un instant.",
  not_configured: "Cette fonction n'est pas encore activée. Reviens bientôt.",
  network: "Connexion impossible. Vérifie ta connexion et réessaie.",
};

const PROVIDER_NAMES: Record<Provider, string> = { github: "GitHub", supabase: "Supabase", hostinger: "Hostinger" };

function errorText(code: string | undefined) {
  return ERRORS[code ?? ""] ?? ERRORS.create_failed;
}

async function call(path: string, init?: { method?: string; body?: unknown }) {
  try {
    const res = await fetch(path, {
      method: init?.method ?? "POST",
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
    const data = (await res.json().catch(() => ({}))) as { state?: LaunchState; error?: string; domains?: string[]; accountName?: string };
    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, error: "network" } as { ok: false; error: string; state?: LaunchState; domains?: string[] };
  }
}

type Props = {
  ideaTitle: string | null;
  ideaText: string | null;
  connections: ConnectionSummary[];
  initialState: LaunchState;
  available: Record<Provider, boolean>;
  notice: { connected: string | null; error: string | null };
};

export function LaunchTab({ ideaTitle, ideaText, connections, initialState, available, notice }: Props) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const connection = (provider: Provider) => connections.find((c) => c.provider === provider) ?? null;

  const databaseReady = Boolean(state.supabase_publishable_key && state.supabase_schema_applied);
  const steps = [
    Boolean(state.repo_full_name),
    databaseReady,
    Boolean(state.site_url),
    Boolean(state.site_url),
    Boolean(state.domain_connected_at),
  ];
  const doneCount = steps.filter(Boolean).length;

  const banner = notice.error
    ? { tone: "error" as const, text: `La connexion à ${PROVIDER_NAMES[notice.error as Provider] ?? "ce compte"} n'a pas abouti. Réessaie.` }
    : notice.connected
      ? { tone: "ok" as const, text: `${PROVIDER_NAMES[notice.connected as Provider] ?? "Ton compte"} est connecté.` }
      : null;

  // Drop ?connecte= / ?erreur= once read, so a refresh doesn't show it again.
  useEffect(() => {
    if (notice.connected || notice.error) router.replace("/espace/lancement", { scroll: false });
  }, [notice.connected, notice.error, router]);

  return (
    <div className="mx-auto flex max-w-[940px] flex-col gap-6 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <TabHeader
        eyebrow="Pilote automatique"
        title="On met tout en place pour toi."
        sub="Connecte tes comptes une seule fois : SaaSFounder crée ton dépôt avec tout le plan, ta base de données et branche ton domaine. Toi, tu dis juste « construis » à ton outil."
      >
        <div className="flex items-center gap-3 rounded-[18px] border border-ink/10 bg-ink/[0.03] px-4 py-3">
          <Rocket className="size-5 text-accent" strokeWidth={1.75} />
          <div>
            <p className="font-display text-[20px] font-semibold leading-none text-ink">{doneCount}/5</p>
            <p className="mt-1 font-body text-[12px] text-ink-faint">étapes faites</p>
          </div>
        </div>
      </TabHeader>

      {banner && (
        <p
          className={cn(
            "rounded-[16px] border px-4 py-3 font-body text-[14px]",
            banner.tone === "ok" ? "border-success/30 bg-success/10 text-success" : "border-red-400/30 bg-red-400/10 text-red-300"
          )}
        >
          {banner.text}
        </p>
      )}

      <RepoStep
        state={state}
        setState={setState}
        ideaTitle={ideaTitle}
        connection={connection("github")}
        available={available.github}
        autoStart={notice.connected === "github"}
      />
      <DatabaseStep
        state={state}
        setState={setState}
        connection={connection("supabase")}
        available={available.supabase}
        autoStart={notice.connected === "supabase"}
      />
      <BuildStep state={state} ideaText={ideaText} />
      <SiteStep state={state} setState={setState} />
      <DomainStep state={state} setState={setState} connection={connection("hostinger")} available={available.hostinger} />

      <p className="px-1 font-body text-[13px] leading-relaxed text-ink-faint">
        Tes accès sont chiffrés et ne servent qu&apos;aux actions que tu lances ici. Tu peux déconnecter un compte à tout
        moment, ou retirer l&apos;accès depuis GitHub, Supabase ou Hostinger.
      </p>
    </div>
  );
}

type SetState = React.Dispatch<React.SetStateAction<LaunchState>>;

function StepCard({
  num,
  brands,
  title,
  sub,
  done,
  children,
}: {
  num: number;
  brands: Brand[];
  title: string;
  sub: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: num * 0.04 }}
      className={cn("glass-panel rounded-[26px] p-6 sm:p-8", done && "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.18)]")}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 shrink-0 items-center gap-1.5 rounded-[14px] border border-ink/10 bg-ink/[0.04] px-3">
          {brands.map((brand) => (
            <BrandLogo key={brand} brand={brand} className="size-5" />
          ))}
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

function ErrorLine({ code }: { code: string | null }) {
  if (!code) return null;
  return <p className="mt-3 font-body text-[13px] leading-relaxed text-red-400">{errorText(code)}</p>;
}

function ConnectButton({ provider, available }: { provider: "github" | "supabase"; available: boolean }) {
  if (!available) return <ComingSoon />;
  return (
    <a
      href={`/api/connections/${provider}/start`}
      onClick={() => track("connect_clicked", { provider })}
      className="inline-flex h-12 items-center justify-center gap-2.5 rounded-pill bg-ink px-6 font-body text-[15px] font-semibold text-canvas transition-transform hover:scale-[1.02] active:scale-[0.97]"
    >
      <BrandLogo brand={provider} monochrome className="size-[18px]" />
      Se connecter avec {PROVIDER_NAMES[provider]}
    </a>
  );
}

function ComingSoon() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-ink/12 px-4 py-2 font-body text-[13px] text-ink-faint">
      <Lock className="size-3.5" />
      Bientôt disponible
    </p>
  );
}

function Connected({ connection, onDisconnected }: { connection: ConnectionSummary; onDisconnected: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[13px] text-ink-muted">
      <span className="inline-flex items-center gap-1.5 text-success">
        <Check className="size-3.5" strokeWidth={3} />
        {PROVIDER_NAMES[connection.provider]} connecté
      </span>
      {connection.account_name && <span className="text-ink-faint">· {connection.account_name}</span>}
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await call(`/api/connections/${connection.provider}`, { method: "DELETE" });
          onDisconnected();
        }}
        className="text-ink-faint underline underline-offset-2 hover:text-ink-muted disabled:opacity-50"
      >
        Déconnecter
      </button>
    </div>
  );
}

function ExternalLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 font-body text-[14px] font-medium text-accent hover:underline"
    >
      {children}
      <ArrowUpRight className="size-3.5" />
    </a>
  );
}

// ───────── 1 · GitHub

function RepoStep({
  state,
  setState,
  ideaTitle,
  connection,
  available,
  autoStart,
}: {
  state: LaunchState;
  setState: SetState;
  ideaTitle: string | null;
  connection: ConnectionSummary | null;
  available: boolean;
  autoStart: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async () => {
    setBusy(true);
    setError(null);
    const result = await call("/api/launch/repo");
    if (result.state) setState(result.state);
    if (!result.ok) setError(result.error ?? "create_failed");
    else track("repo_created");
    setBusy(false);
  }, [setState]);

  // Straight back from "Se connecter avec GitHub": create it right away.
  const started = useRef(false);
  useEffect(() => {
    if (!autoStart || started.current || state.repo_full_name || !ideaTitle || !connection) return;
    started.current = true;
    const id = window.setTimeout(create, 0);
    return () => window.clearTimeout(id);
  }, [autoStart, state.repo_full_name, ideaTitle, connection, create]);

  return (
    <StepCard
      num={1}
      brands={["github"]}
      title="Ton dépôt GitHub, avec tout le plan dedans"
      sub="Un dossier privé pour le code de ton SaaS. On y écrit le cahier des charges complet : Claude Code et Replit le lisent tout seuls."
      done={Boolean(state.repo_full_name)}
    >
      {!connection ? (
        <ConnectButton provider="github" available={available} />
      ) : (
        <div className="flex flex-col gap-4">
          <Connected connection={connection} onDisconnected={() => router.refresh()} />
          {state.repo_full_name ? (
            <div className="rounded-[18px] border border-ink/8 bg-ink/[0.03] p-4">
              <p className="font-body text-[14px] text-ink">
                Dépôt créé : <span className="font-mono text-[13px]">{state.repo_full_name}</span>
              </p>
              <p className="mt-1 font-body text-[13px] text-ink-muted">Le plan complet est dans le fichier CLAUDE.md.</p>
              <div className="mt-3">
                <ExternalLink href={state.repo_url ?? `https://github.com/${state.repo_full_name}`}>Voir sur GitHub</ExternalLink>
              </div>
            </div>
          ) : !ideaTitle ? (
            <p className="font-body text-[14px] text-ink-muted">
              Choisis d&apos;abord ton idée dans{" "}
              <Link href="/espace#idee" className="text-accent underline underline-offset-2">
                l&apos;onglet Création
              </Link>
              : le plan part d&apos;elle.
            </p>
          ) : (
            <div>
              <Button showArrow={false} disabled={busy} onClick={create}>
                {busy ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Création du dépôt...
                  </span>
                ) : (
                  `Créer le dépôt de ${ideaTitle}`
                )}
              </Button>
            </div>
          )}
          <ErrorLine code={error} />
        </div>
      )}
    </StepCard>
  );
}

// ───────── 2 · Supabase

// Supabase statuses a new project won't recover from by waiting.
const FAILED = ["INIT_FAILED", "REMOVED", "RESTORE_FAILED", "PAUSING", "PAUSE_FAILED", "GOING_DOWN"];

function DatabaseStep({
  state,
  setState,
  connection,
  available,
  autoStart,
}: {
  state: LaunchState;
  setState: SetState;
  connection: ConnectionSummary | null;
  available: boolean;
  autoStart: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = Boolean(state.supabase_publishable_key && state.supabase_schema_applied);
  const failed = FAILED.includes(state.supabase_status ?? "");
  const starting = Boolean(state.supabase_ref) && !ready && !failed;

  const step = useCallback(async () => {
    setBusy(true);
    setError(null);
    const result = await call("/api/launch/database");
    if (result.state) setState(result.state);
    if (!result.ok) setError(result.error ?? "create_failed");
    setBusy(false);
    return result.ok;
  }, [setState]);

  // While the project starts (a minute or two), check on it every 6 s,
  // for ten minutes at most.
  useEffect(() => {
    if (!starting || error || !connection) return;
    let checks = 0;
    const id = window.setInterval(() => {
      checks += 1;
      if (checks > 100) window.clearInterval(id);
      else void step();
    }, 6000);
    return () => window.clearInterval(id);
  }, [starting, error, connection, step]);

  const started = useRef(false);
  useEffect(() => {
    if (!autoStart || started.current || state.supabase_ref || !connection) return;
    started.current = true;
    const id = window.setTimeout(step, 0);
    return () => window.clearTimeout(id);
  }, [autoStart, state.supabase_ref, connection, step]);

  return (
    <StepCard
      num={2}
      brands={["supabase"]}
      title="Ta base de données Supabase"
      sub="On crée ton projet Supabase (gratuit), les tables de départ pour les comptes de tes clients, et on range ses clés dans ton dépôt."
      done={ready}
    >
      {!connection ? (
        <ConnectButton provider="supabase" available={available} />
      ) : (
        <div className="flex flex-col gap-4">
          <Connected connection={connection} onDisconnected={() => router.refresh()} />
          {ready ? (
            <div className="rounded-[18px] border border-ink/8 bg-ink/[0.03] p-4">
              <p className="font-body text-[14px] text-ink">Ta base est prête, avec la table des comptes et ses protections.</p>
              <p className="mt-1 break-all font-mono text-[12.5px] text-ink-muted">{state.supabase_url}</p>
              <div className="mt-3">
                <ExternalLink href={`https://supabase.com/dashboard/project/${state.supabase_ref}`}>Ouvrir dans Supabase</ExternalLink>
              </div>
            </div>
          ) : failed ? (
            <p className="font-body text-[14px] leading-relaxed text-ink-muted">
              Supabase n&apos;a pas réussi à démarrer ta base ({state.supabase_status}). Ouvre{" "}
              <ExternalLink href={`https://supabase.com/dashboard/project/${state.supabase_ref}`}>ton projet</ExternalLink> pour voir
              ce qui bloque, ou demande au coach.
            </p>
          ) : starting ? (
            <div className="flex items-center gap-3 rounded-[18px] border border-accent/25 bg-accent/[0.05] p-4">
              <Loader2 className="size-5 shrink-0 animate-spin text-accent" />
              <p className="font-body text-[14px] text-ink">
                Ta base démarre chez Supabase (1 à 2 minutes). Tu peux passer à la suite, on finit tout seuls.
              </p>
            </div>
          ) : (
            <div>
              <Button showArrow={false} disabled={busy} onClick={step}>
                {busy ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Création...
                  </span>
                ) : (
                  "Créer ma base de données"
                )}
              </Button>
            </div>
          )}
          <ErrorLine code={error} />
          {error && starting ? (
            <button type="button" onClick={step} className="self-start font-body text-[13px] text-accent underline underline-offset-2">
              Vérifier à nouveau
            </button>
          ) : null}
        </div>
      )}
    </StepCard>
  );
}

// ───────── 3 · Build with their tool

type Tool = "claude" | "replit" | "lovable";

function lovablePrompt(ideaText: string, state: LaunchState) {
  const supabase =
    state.supabase_url && state.supabase_publishable_key
      ? ` Le projet Supabase existe déjà : URL ${state.supabase_url}, clé publique ${state.supabase_publishable_key}.`
      : "";
  return [
    "Construis ce SaaS :",
    ideaText,
    `Stack : comptes et base de données avec Supabase, abonnement mensuel avec Stripe.${supabase}`,
    "Interface en français, simple, pensée d'abord pour le téléphone.",
    "Commence par la page d'accueil, puis l'inscription et la connexion, puis la fonctionnalité principale.",
  ].join("\n\n");
}

function BuildStep({ state, ideaText }: { state: LaunchState; ideaText: string | null }) {
  const [tool, setTool] = useState<Tool>("claude");
  const repo = state.repo_full_name;
  const firstLine = "Lis CLAUDE.md et construis l'étape 1 du plan.";

  return (
    <StepCard
      num={3}
      brands={["claude", "replit"]}
      title="Construis ton SaaS avec l'IA"
      sub="Ton outil de code lit le plan et écrit tout. Toi, tu lui dis « construis », puis « étape suivante » à chaque fois qu'il a fini."
      done={Boolean(state.site_url)}
    >
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "claude", label: "Claude Code", brand: "claude" },
            { id: "replit", label: "Replit", brand: "replit" },
            { id: "lovable", label: "Lovable", brand: null },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTool(option.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-[14px] transition-colors",
              tool === option.id ? "border-accent/60 bg-accent/10 text-ink" : "border-ink/12 text-ink-muted hover:text-ink"
            )}
          >
            {option.brand ? <BrandLogo brand={option.brand} className="size-4" /> : <Heart className="size-4 text-[#ff6b9a]" />}
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tool !== "lovable" && !repo ? (
          <p className="font-body text-[14px] text-ink-muted">Crée d&apos;abord ton dépôt (étape 1) : ton outil part de lui.</p>
        ) : tool === "claude" ? (
          <ol className="flex flex-col gap-3 font-body text-[14px] leading-relaxed text-ink-muted">
            <li>
              1. Ouvre Claude Code (il faut un abonnement Claude) :{" "}
              <ExternalLink href="https://claude.ai/code" onClick={() => track("build_tool_opened", { tool: "claude" })}>
                claude.ai/code
              </ExternalLink>
            </li>
            <li>
              2. Choisis ton dépôt <span className="font-mono text-[13px] text-ink">{repo}</span> (la première fois, autorise GitHub).
            </li>
            <li className="flex flex-wrap items-center gap-3">
              3. Envoie-lui :
              <span className="rounded-[10px] border border-ink/12 bg-black/40 px-3 py-1.5 font-mono text-[12.5px] text-ink">{firstLine}</span>
              <CopyButton text={firstLine} label="Lancement Claude Code" />
            </li>
            <li>4. Quand il a fini, teste, puis écris « Étape suivante ».</li>
          </ol>
        ) : tool === "replit" ? (
          <ol className="flex flex-col gap-3 font-body text-[14px] leading-relaxed text-ink-muted">
            <li>
              1. Ouvre ton dépôt dans Replit :{" "}
              <ExternalLink href={`https://replit.com/github.com/${repo}`} onClick={() => track("build_tool_opened", { tool: "replit" })}>
                Importer dans Replit
              </ExternalLink>{" "}
              (ton dépôt est privé : Replit te demandera l&apos;accès à GitHub).
            </li>
            <li className="flex flex-wrap items-center gap-3">
              2. Dans l&apos;Agent, envoie :
              <span className="rounded-[10px] border border-ink/12 bg-black/40 px-3 py-1.5 font-mono text-[12.5px] text-ink">{firstLine}</span>
              <CopyButton text={firstLine} label="Lancement Replit" />
            </li>
            <li>3. Replit peut aussi héberger ton site : dans ce cas, saute l&apos;étape 4.</li>
          </ol>
        ) : ideaText ? (
          <div className="flex flex-col gap-3 font-body text-[14px] leading-relaxed text-ink-muted">
            <p>Lovable s&apos;ouvre avec tout ton projet déjà écrit : tu n&apos;as plus qu&apos;à cliquer sur Envoyer.</p>
            <div>
              <a
                href={`https://lovable.dev/#prompt=${encodeURIComponent(lovablePrompt(ideaText, state))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("build_tool_opened", { tool: "lovable" })}
                className="inline-flex h-11 items-center gap-2 rounded-pill bg-ink px-5 font-body text-[14px] font-semibold text-canvas"
              >
                <Heart className="size-4 text-[#ff6b9a]" />
                Ouvrir dans Lovable
              </a>
            </div>
            <p>Lovable héberge aussi ton site : l&apos;étape 4 ne te concerne pas.</p>
          </div>
        ) : (
          <p className="font-body text-[14px] text-ink-muted">
            Choisis d&apos;abord ton idée dans{" "}
            <Link href="/espace#idee" className="text-accent underline underline-offset-2">
              l&apos;onglet Création
            </Link>
            .
          </p>
        )}
      </div>
    </StepCard>
  );
}

// ───────── 4 · Netlify

function SiteStep({ state, setState }: { state: LaunchState; setState: SetState }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    const result = await call("/api/launch/site", { body: { siteUrl: value } });
    if (result.state) {
      setState(result.state);
      setEditing(false);
    }
    if (!result.ok) setError(result.error ?? "invalid_site");
    setBusy(false);
  }

  return (
    <StepCard
      num={4}
      brands={["netlify"]}
      title="Mets ton site en ligne sur Netlify"
      sub="Gratuit, même quand ton SaaS encaisse. À chaque modification de ton outil, le site se met à jour tout seul."
      done={Boolean(state.site_url)}
    >
      {state.site_url && !editing ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ExternalLink href={state.site_url}>{state.site_url.replace("https://", "")}</ExternalLink>
          <button type="button" onClick={() => setEditing(true)} className="font-body text-[13px] text-ink-faint underline underline-offset-2">
            Changer
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ol className="flex flex-col gap-2 font-body text-[14px] leading-relaxed text-ink-muted">
            <li>
              1. Ouvre Netlify et crée un compte gratuit avec GitHub :{" "}
              <ExternalLink href={NETLIFY_IMPORT_URL} onClick={() => track("netlify_opened")}>
                app.netlify.com
              </ExternalLink>
            </li>
            <li>
              2. Clique sur « Import from Git », choisis GitHub puis{" "}
              {state.repo_full_name ? <span className="font-mono text-[13px] text-ink">{state.repo_full_name}</span> : "ton dépôt"}, et
              « Deploy ». Les réglages sont déjà dans ton dépôt.
            </li>
            <li>3. Colle ici l&apos;adresse que Netlify te donne :</li>
          </ol>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="mon-saas.netlify.app"
              className="h-12 w-full rounded-lg sm:flex-1 border border-ink/12 bg-accent/5 px-4 font-body text-[15px] text-ink outline-none focus:border-accent/60"
            />
            <Button showArrow={false} variant="secondary" disabled={busy || !value.trim()} onClick={save}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Enregistrer"}
            </Button>
          </div>
          <ErrorLine code={error} />
        </div>
      )}
    </StepCard>
  );
}

// ───────── 5 · Hostinger

function DomainStep({
  state,
  setState,
  connection,
  available,
}: {
  state: LaunchState;
  setState: SetState;
  connection: ConnectionSummary | null;
  available: boolean;
}) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [domains, setDomains] = useState<string[] | null>(null);
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connection) return;
    let cancelled = false;
    call("/api/launch/domain", { method: "GET" }).then((result) => {
      if (cancelled) return;
      if (result.domains) {
        setDomains(result.domains);
        setDomain((current) => current || result.domains?.[0] || "");
      } else setError(result.error ?? "reconnect");
    });
    return () => {
      cancelled = true;
    };
  }, [connection]);

  async function connect() {
    setBusy(true);
    setError(null);
    const result = await call("/api/connections/hostinger", { body: { token } });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "invalid_token");
      return;
    }
    setToken("");
    router.refresh();
  }

  async function point() {
    setBusy(true);
    setError(null);
    const result = await call("/api/launch/domain", { body: { domain } });
    if (result.state) setState(result.state);
    if (!result.ok) setError(result.error ?? "update_failed");
    setBusy(false);
  }

  return (
    <StepCard
      num={5}
      brands={["hostinger"]}
      title="Ton nom de domaine"
      sub="Ton domaine Hostinger pointé vers ton site, sans toucher à tes e-mails. Optionnel : ton site marche déjà avec son adresse Netlify."
      done={Boolean(state.domain_connected_at)}
    >
      {!available ? (
        <ComingSoon />
      ) : !connection ? (
        <div className="flex flex-col gap-4">
          <ol className="flex flex-col gap-2 font-body text-[14px] leading-relaxed text-ink-muted">
            <li>
              1. Dans hPanel, ouvre la page des clés API :{" "}
              <ExternalLink href="https://hpanel.hostinger.com/profile/api">hpanel.hostinger.com/profile/api</ExternalLink>
            </li>
            <li>2. Clique sur « Generate token », puis copie la clé.</li>
            <li>3. Colle-la ici :</li>
          </ol>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Ta clé API Hostinger"
              autoComplete="off"
              className="h-12 w-full rounded-lg sm:flex-1 border border-ink/12 bg-accent/5 px-4 font-body text-[15px] text-ink outline-none focus:border-accent/60"
            />
            <Button showArrow={false} variant="secondary" disabled={busy || !token.trim()} onClick={connect}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Connecter Hostinger"}
            </Button>
          </div>
          <ErrorLine code={error} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Connected connection={connection} onDisconnected={() => router.refresh()} />
          {state.domain_connected_at && state.domain ? (
            <div className="rounded-[18px] border border-ink/8 bg-ink/[0.03] p-4 font-body text-[14px] leading-relaxed text-ink-muted">
              <p className="text-ink">
                {state.domain} pointe vers ton site.
              </p>
              <p className="mt-2">
                Dernier clic dans Netlify : « Domain management » → « Add a domain » → {state.domain}. Le cadenas HTTPS
                s&apos;active tout seul, en général en moins d&apos;une heure (jusqu&apos;à 24 h).
              </p>
            </div>
          ) : !state.site_url ? (
            <p className="font-body text-[14px] text-ink-muted">Mets d&apos;abord ton site en ligne (étape 4).</p>
          ) : domains === null ? (
            error ? null : <Loader2 className="size-5 animate-spin text-ink-faint" />
          ) : domains.length === 0 ? (
            <p className="font-body text-[14px] text-ink-muted">
              Aucun domaine actif sur ton compte Hostinger. Achètes-en un, puis reviens ici.
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="h-12 w-full rounded-lg sm:flex-1 border border-ink/12 bg-canvas px-4 font-body text-[15px] text-ink outline-none focus:border-accent/60"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <Button showArrow={false} disabled={busy || !domain} onClick={point}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : `Brancher ${domain}`}
              </Button>
            </div>
          )}
          <ErrorLine code={error} />
        </div>
      )}
    </StepCard>
  );
}
