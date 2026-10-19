import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { describeAnswers } from "@/lib/claude/project-context";
import type { Answers } from "@/components/onboarding/funnel";
import { CHECKLIST_ITEMS, CODE_TOOLS } from "@/lib/espace/content";
import { DEVICE_LABELS, eventLabel, SOURCE_LABELS } from "@/lib/analytics/labels";
import { formatParis } from "@/components/admin/analytics-dashboard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Parcours — Admin SaaSFounder",
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type EventRow = {
  id: number;
  created_at: string;
  name: string;
  path: string | null;
  props: Record<string, unknown> | null;
  user_id: string | null;
  anon_id: string | null;
  source: string | null;
  device: string | null;
  country: string | null;
};

const MILESTONES: { label: string; match: (e: EventRow) => boolean }[] = [
  { label: "Première visite", match: (e) => e.name === "page_view" },
  { label: "Commence le questionnaire", match: (e) => e.name === "onboarding_step" },
  { label: "Crée son compte", match: (e) => e.name === "signup_completed" },
  { label: "Voit les prix", match: (e) => e.name === "pricing_viewed" },
  { label: "Clique sur une formule", match: (e) => e.name === "checkout_clicked" },
  { label: "Paie", match: (e) => e.name === "payment_completed" },
  { label: "Choisit son idée", match: (e) => e.name === "idea_saved" },
  { label: "Génère son prompt", match: (e) => e.name === "build_prompt_generated" },
  { label: "Lance sa MVP", match: (e) => e.name === "mvp_launched" },
];

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" });
}

function duration(fromIso: string, toIso: string) {
  const minutes = Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000);
  if (minutes < 1) return "moins d'une minute";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.round(hours / 24)} jours`;
}

export default async function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, email, has_access, is_admin, plan, created_at, last_seen_at, current_path, stripe_customer_id")
    .eq("id", id)
    .maybeSingle();

  const columns = "id, created_at, name, path, props, user_id, anon_id, source, device, country";
  let events: EventRow[] = [];
  let linkedUsers: string[] = [];

  if (profile) {
    // Their browsers' events from before the account existed belong to the journey too.
    const { data: anonRows } = await supabase.from("events").select("anon_id").eq("user_id", id).not("anon_id", "is", null).limit(500);
    const anonIds = [...new Set((anonRows ?? []).map((r) => r.anon_id as string))].slice(0, 30);
    const filter = anonIds.length ? `user_id.eq.${id},anon_id.in.(${anonIds.join(",")})` : `user_id.eq.${id}`;
    const { data } = await supabase.from("events").select(columns).or(filter).order("created_at", { ascending: true }).limit(1500);
    events = (data ?? []) as EventRow[];
  } else {
    const { data } = await supabase.from("events").select(columns).eq("anon_id", id).order("created_at", { ascending: true }).limit(1500);
    events = (data ?? []) as EventRow[];
    linkedUsers = [...new Set(events.map((e) => e.user_id).filter(Boolean))] as string[];
    if (!events.length) notFound();
  }

  const [onboarding, builder, marketing, usage] = profile
    ? await Promise.all([
        supabase.from("onboarding_responses").select("answers").eq("user_id", id).maybeSingle(),
        supabase.from("builder_progress").select("idea_text, chosen_tool, checklist, mvp_launched").eq("user_id", id).maybeSingle(),
        supabase.from("marketing_progress").select("chosen_channel, tiktok_url, self_reported_views").eq("user_id", id).maybeSingle(),
        supabase.from("ai_usage").select("month, cost_usd, requests").eq("user_id", id),
      ])
    : [null, null, null, null];

  const first = events[0];
  const last = events[events.length - 1];
  const source = events.find((e) => e.source)?.source ?? "direct";
  const devices = [...new Set(events.map((e) => e.device).filter(Boolean))] as string[];
  const countries = [...new Set(events.map((e) => e.country).filter(Boolean))] as string[];
  const inApp = events.find((e) => typeof e.props?.in_app === "string")?.props?.in_app as string | undefined;
  const sessions = new Set(events.map((e) => e.anon_id ?? "").filter(Boolean)).size;

  const milestones = MILESTONES.map((m) => ({ label: m.label, at: events.find(m.match)?.created_at ?? null }));
  const answers = describeAnswers((onboarding?.data?.answers ?? {}) as Answers);
  const b = builder?.data;
  const checklist = (b?.checklist ?? {}) as Record<string, boolean>;
  const aiSpent = (usage?.data ?? []).reduce((sum, row) => sum + Number(row.cost_usd), 0);
  const aiRequests = (usage?.data ?? []).reduce((sum, row) => sum + row.requests, 0);

  // Timeline grouped by day, most recent first.
  const days = new Map<string, EventRow[]>();
  for (const e of [...events].reverse()) {
    const key = dayKey(e.created_at);
    if (!days.has(key)) days.set(key, []);
    days.get(key)!.push(e);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-6 sm:px-8">
      <Link href="/admin" className="inline-flex items-center gap-1.5 font-body text-[13px] text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Retour au dashboard
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-semibold text-ink">
            {profile ? profile.first_name || profile.email || "Compte sans nom" : "Visiteur anonyme"}
          </h1>
          <p className="mt-1 font-body text-[14px] text-ink-muted">
            {profile ? profile.email : `Identifiant navigateur ${id.slice(0, 8)}…`}
          </p>
        </div>
        {profile && (
          <div className="flex flex-wrap gap-2">
            <Chip tone={profile.has_access ? "good" : "muted"}>{profile.has_access ? `Payant${profile.plan ? ` · ${profile.plan}` : ""}` : "Sans accès"}</Chip>
            {profile.is_admin && <Chip tone="accent">Admin</Chip>}
          </div>
        )}
      </div>

      {linkedUsers.length > 0 && (
        <div className="mt-5 rounded-[16px] border border-accent/25 bg-accent/[0.05] p-4 font-body text-[14px] text-ink-muted">
          Ce visiteur a ensuite créé un compte :{" "}
          {linkedUsers.map((uid) => (
            <Link key={uid} href={`/admin/parcours/${uid}`} className="text-accent underline underline-offset-2">
              voir son parcours complet
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Fact label="Source" value={SOURCE_LABELS[source] ?? source} sub={inApp ? `navigateur intégré ${inApp}` : undefined} />
        <Fact label="Première visite" value={first ? formatParis(first.created_at) : "—"} sub={first && last ? `actif sur ${duration(first.created_at, last.created_at)}` : undefined} />
        <Fact label="Appareil" value={devices.map((d) => DEVICE_LABELS[d] ?? d).join(", ") || "—"} sub={countries.join(", ") || undefined} />
        <Fact
          label={profile ? "Inscrit le" : "Navigateurs"}
          value={profile ? formatParis(profile.created_at) : String(sessions)}
          sub={profile?.last_seen_at ? `vu le ${formatParis(profile.last_seen_at)}` : undefined}
        />
      </div>

      <section className="glass-panel mt-4 rounded-[22px] p-5 sm:p-6">
        <h2 className="font-display text-[17px] font-semibold text-ink">Étapes franchies</h2>
        <ol className="mt-4 grid gap-2 sm:grid-cols-3">
          {milestones.map((m) => (
            <li key={m.label} className={cn("flex items-start gap-2.5 rounded-[12px] border px-3 py-2.5", m.at ? "border-success/25 bg-success/[0.05]" : "border-ink/8")}>
              {m.at ? <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} /> : <Circle className="mt-0.5 size-4 shrink-0 text-ink-faint" />}
              <span>
                <span className={cn("block font-body text-[13px]", m.at ? "text-ink" : "text-ink-faint")}>{m.label}</span>
                {m.at && <span className="block font-mono text-[11px] text-ink-faint">{formatParis(m.at)}</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {profile && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="glass-panel rounded-[22px] p-5 sm:p-6">
            <h2 className="font-display text-[17px] font-semibold text-ink">Son projet</h2>
            <dl className="mt-4 flex flex-col gap-3 font-body text-[13.5px]">
              <Row label="Idée" value={b?.idea_text ? b.idea_text.split("\n")[0] : "pas encore choisie"} />
              <Row label="Outil" value={CODE_TOOLS.find((t) => t.id === b?.chosen_tool)?.name ?? "pas encore choisi"} />
              <Row label="Checklist" value={`${CHECKLIST_ITEMS.filter((i) => checklist[i.id]).length}/${CHECKLIST_ITEMS.length} étapes${b?.mvp_launched ? " · MVP lancée" : ""}`} />
              <Row label="Canal" value={marketing?.data?.chosen_channel ?? "pas encore choisi"} />
              <Row label="Vidéo" value={marketing?.data?.tiktok_url ? `${marketing.data.tiktok_url}${marketing.data.self_reported_views != null ? ` · ${marketing.data.self_reported_views} vues` : ""}` : "pas encore publiée"} />
              <Row label="IA" value={`${aiRequests} appels · ${aiSpent.toFixed(2).replace(".", ",")} $ au total`} />
              <Row label="En ce moment" value={profile.current_path ?? "—"} />
            </dl>
          </section>
          <section className="glass-panel rounded-[22px] p-5 sm:p-6">
            <h2 className="font-display text-[17px] font-semibold text-ink">Ses réponses au questionnaire</h2>
            {answers.length ? (
              <ul className="mt-4 flex flex-col gap-2 font-body text-[13px] leading-relaxed text-ink-muted">
                {answers.map((line) => (
                  <li key={line}>{line.replace(/^- /, "")}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 font-body text-[13px] text-ink-faint">Pas de réponses enregistrées.</p>
            )}
          </section>
        </div>
      )}

      <section className="glass-panel mt-4 rounded-[22px] p-5 sm:p-6">
        <h2 className="font-display text-[17px] font-semibold text-ink">Chronologie</h2>
        <p className="mt-1 font-body text-[12.5px] text-ink-faint">
          {events.length} événements, du plus récent au plus ancien. Heures de Paris.
        </p>
        {events.length === 0 && (
          <p className="mt-4 font-body text-[13px] text-ink-faint">
            Aucun événement : ce compte date d&apos;avant l&apos;activation du suivi, ou n&apos;est pas revenu depuis.
          </p>
        )}
        <div className="mt-4 flex flex-col gap-6">
          {[...days.entries()].map(([day, list]) => (
            <div key={day}>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent">{day}</p>
              <ol className="mt-2 border-l border-ink/10 pl-4">
                {list.map((e) => (
                  <li key={e.id} className="relative py-1.5">
                    <span
                      className={cn(
                        "absolute -left-[21px] top-[13px] size-2 rounded-full",
                        e.name === "page_view" ? "bg-ink/25" : e.name === "payment_completed" ? "bg-success" : "bg-accent"
                      )}
                    />
                    <span className="mr-3 font-mono text-[11px] text-ink-faint">{formatParis(e.created_at, false)}</span>
                    <span className={cn("font-body text-[13.5px]", e.name === "page_view" ? "text-ink-faint" : "text-ink")}>
                      {eventLabel(e.name, e.props, e.path)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Chip({ tone, children }: { tone: "good" | "muted" | "accent"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]",
        tone === "good" && "border-success/30 bg-success/10 text-success",
        tone === "muted" && "border-ink/12 text-ink-faint",
        tone === "accent" && "border-accent/40 bg-accent/10 text-accent"
      )}
    >
      {children}
    </span>
  );
}

function Fact({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass-panel rounded-[18px] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
      <p className="mt-1.5 truncate font-display text-[17px] font-semibold text-ink">{value}</p>
      {sub && <p className="mt-1 truncate font-body text-[12px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{value}</dd>
    </div>
  );
}
