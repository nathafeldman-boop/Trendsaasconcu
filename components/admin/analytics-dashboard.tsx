import Link from "next/link";
import { Activity, ArrowDownRight, Eye, MousePointerClick, Percent, UserPlus, Wallet, type LucideIcon } from "lucide-react";
import { ACTION_NAMES, DEVICE_LABELS, eventLabel, SOURCE_LABELS, stepLabel, stepOrder } from "@/lib/analytics/labels";
import { cn } from "@/lib/utils";

// The analytics half of /admin, rendered on the server: KPIs, the funnel,
// day-by-day small multiples (three charts, never a dual axis), onboarding
// drop-off, sources, devices, in-app actions and a live feed. One hue (the
// brand accent) for single-series bars; numbers stay in text colors.

export type Analytics = {
  kpis: { visitors: number; sessions: number; pageviews: number; signups: number; payments: number; checkouts: number };
  funnel: { step: string; count: number }[];
  daily: { day: string; visitors: number; signups: number; payments: number }[];
  onboarding: { step: string; index: number | null; visitors: number }[];
  sources: { source: string; visitors: number; signups: number; payments: number }[];
  devices: { device: string; visitors: number }[];
  countries: { country: string; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  actions: { name: string; count: number; users: number }[];
};

export type FeedEvent = {
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
  who: string | null;
};

const PERIODS = [7, 30, 90];

const nf = new Intl.NumberFormat("fr-FR");

function pct(part: number, whole: number) {
  if (!whole) return "—";
  const value = (part / whole) * 100;
  return `${value < 10 && value > 0 ? value.toFixed(1).replace(".", ",") : Math.round(value)} %`;
}

export function formatParis(iso: string, withDay = true) {
  return new Date(iso).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    ...(withDay ? { day: "2-digit", month: "2-digit" } : {}),
  });
}

function flag(code: string) {
  return /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0))) : "🌐";
}

export function AnalyticsDashboard({ period, data, feed }: { period: number; data: Analytics | null; feed: FeedEvent[] }) {
  const k = data?.kpis;
  const empty = !k || k.pageviews === 0;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[26px] font-semibold text-ink">Parcours des utilisateurs</h2>
          <p className="mt-1 font-body text-[14px] text-ink-muted">
            De la première visite au paiement, puis dans l&apos;espace. Heures de Paris.
          </p>
        </div>
        <nav className="flex gap-1 rounded-full border border-ink/10 bg-ink/[0.03] p-1" aria-label="Période">
          {PERIODS.map((days) => (
            <Link
              key={days}
              href={`/admin?p=${days}`}
              className={cn(
                "rounded-full px-4 py-1.5 font-body text-[13px] transition-colors",
                days === period ? "bg-ink text-canvas" : "text-ink-muted hover:text-ink"
              )}
            >
              {days} jours
            </Link>
          ))}
        </nav>
      </div>

      {empty && (
        <p className="mt-6 rounded-[16px] border border-accent/25 bg-accent/[0.05] p-4 font-body text-[14px] text-ink-muted">
          Le suivi du parcours vient d&apos;être activé : les visites et actions s&apos;afficheront ici au fur et à mesure.
          Les inscriptions, elles, sont comptées depuis le début.
        </p>
      )}

      {k && (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Kpi icon={Eye} label="Visiteurs uniques" value={k.visitors} sub={`${nf.format(k.pageviews)} pages vues`} />
          <Kpi icon={Activity} label="Sessions" value={k.sessions} sub={k.visitors ? `${(k.sessions / k.visitors).toFixed(1).replace(".", ",")} par visiteur` : "—"} />
          <Kpi icon={UserPlus} label="Inscriptions" value={k.signups} sub={`${pct(k.signups, k.visitors)} des visiteurs`} />
          <Kpi icon={MousePointerClick} label="Clics formule" value={k.checkouts} sub={`${pct(k.checkouts, k.signups)} des inscrits`} />
          <Kpi icon={Wallet} label="Paiements" value={k.payments} sub={`${pct(k.payments, k.checkouts)} des clics`} />
          <Kpi icon={Percent} label="Visiteur → payant" value={pct(k.payments, k.visitors)} sub="sur la période" />
        </div>
      )}

      {data && (
        <>
          <Card title="Entonnoir" sub="Personnes ayant atteint chaque étape sur la période. Le % compare à l'étape d'avant.">
            <Funnel steps={data.funnel} />
          </Card>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <MiniBars title="Visiteurs par jour" days={data.daily} pick={(d) => d.visitors} />
            <MiniBars title="Inscriptions par jour" days={data.daily} pick={(d) => d.signups} />
            <MiniBars title="Paiements par jour" days={data.daily} pick={(d) => d.payments} />
          </div>

          <Card
            title="Questionnaire : où ils décrochent"
            sub="Visiteurs ayant vu chaque étape, dans l'ordre du questionnaire. Le pourcentage est calculé par rapport à la première étape."
          >
            <Onboarding steps={data.onboarding} />
          </Card>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card title="Sources" sub="D'où viennent les visiteurs (premier contact) et ce qu'ils deviennent." flush>
              <Sources rows={data.sources} />
            </Card>
            <Card title="Actions dans l'application" sub="Personnes distinctes et nombre de fois." flush>
              <Actions rows={data.actions} />
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card title="Appareils" flush>
              <Shares rows={data.devices.map((d) => ({ label: DEVICE_LABELS[d.device] ?? d.device, value: d.visitors }))} />
            </Card>
            <Card title="Pays" flush>
              <Shares rows={data.countries.map((c) => ({ label: `${flag(c.country)} ${c.country}`, value: c.visitors }))} />
            </Card>
            <Card title="Pages les plus vues" flush>
              <Shares rows={data.pages.map((p) => ({ label: p.path, value: p.views, mono: true }))} unit="vues" />
            </Card>
          </div>
        </>
      )}

      <Card title="En direct" sub="Les 40 derniers événements. Clique sur une personne pour voir tout son parcours." flush>
        <Feed events={feed} />
      </Card>
    </section>
  );
}

// ───────────────────────── Pieces

function Card({ title, sub, flush = false, children }: { title: string; sub?: string; flush?: boolean; children: React.ReactNode }) {
  return (
    <div className="glass-panel mt-4 rounded-[22px]">
      <div className={cn("px-5 pt-5 sm:px-6", flush ? "pb-3" : "pb-0")}>
        <h3 className="font-display text-[17px] font-semibold text-ink">{title}</h3>
        {sub && <p className="mt-1 font-body text-[12.5px] leading-relaxed text-ink-faint">{sub}</p>}
      </div>
      <div className={cn(flush ? "" : "px-5 pb-5 pt-4 sm:px-6")}>{children}</div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: number | string; sub: string }) {
  return (
    <div className="glass-panel rounded-[18px] p-4">
      <Icon className="size-4 text-accent" strokeWidth={1.75} />
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-[28px] font-semibold leading-none text-ink">
        {typeof value === "number" ? nf.format(value) : value}
      </p>
      <p className="mt-1.5 font-body text-[12px] text-ink-faint">{sub}</p>
    </div>
  );
}

function Bar({ value, max, title }: { value: number; max: number; title: string }) {
  const width = max ? Math.max(value ? 1.5 : 0, (value / max) * 100) : 0;
  return (
    <div className="relative h-6 flex-1 rounded-[4px] bg-ink/[0.05]" title={title}>
      <div className="absolute inset-y-0 left-0 rounded-r-[4px] bg-accent" style={{ width: `${width}%` }} />
    </div>
  );
}

function Funnel({ steps }: { steps: Analytics["funnel"] }) {
  const max = Math.max(...steps.map((s) => s.count), 1);
  return (
    <div className="flex flex-col gap-1.5">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].count : null;
        return (
          <div key={s.step}>
            {s.step === "Choisit son idée" && (
              <p className="mb-1.5 mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Après le paiement</p>
            )}
            <div className="flex items-center gap-3">
              <span className="w-[150px] shrink-0 font-body text-[13px] text-ink sm:w-[190px]">{s.step}</span>
              <Bar value={s.count} max={max} title={`${s.step} : ${nf.format(s.count)}`} />
              <span className="w-[120px] shrink-0 text-right font-body text-[13px]">
                <span className="font-semibold text-ink">{nf.format(s.count)}</span>
                {prev !== null && <span className="ml-2 text-ink-faint">{pct(s.count, prev)}</span>}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniBars({
  title,
  days,
  pick,
}: {
  title: string;
  days: Analytics["daily"];
  pick: (d: Analytics["daily"][number]) => number;
}) {
  const values = days.map(pick);
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(...values, 1);
  const W = 300;
  const H = 80;
  const step = W / Math.max(values.length, 1);
  const barW = Math.max(1, step - 2);
  const day = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

  return (
    <div className="glass-panel rounded-[22px] p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
        <span className="font-body text-[12px] text-ink-faint">
          total <span className="font-semibold text-ink">{nf.format(total)}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 1}`} className="mt-4 h-24 w-full" preserveAspectRatio="none" role="img" aria-label={`${title} : ${total} au total`}>
        <line x1="0" x2={W} y1={H + 0.5} y2={H + 0.5} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        {values.map((v, i) => {
          const h = v ? Math.max(2, (v / max) * (H - 4)) : 0;
          return (
            <g key={days[i].day}>
              {/* Full-height hit area: hovering anywhere in the column shows the day. */}
              <rect x={i * step} y="0" width={step} height={H} fill="transparent">
                <title>{`${day(days[i].day)} : ${v}`}</title>
              </rect>
              {h > 0 && (
                <rect x={i * step + 1} y={H - h} width={barW} height={h} rx={Math.min(2, barW / 2)} fill="var(--color-accent)">
                  <title>{`${day(days[i].day)} : ${v}`}</title>
                </rect>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-1.5 flex justify-between font-body text-[11px] text-ink-faint">
        <span>{days[0] ? day(days[0].day) : ""}</span>
        <span>max {nf.format(max === 1 && !values.some((v) => v) ? 0 : max)}/jour</span>
        <span>{days.length ? day(days[days.length - 1].day) : ""}</span>
      </div>
    </div>
  );
}

function Onboarding({ steps }: { steps: Analytics["onboarding"] }) {
  const ordered = [...steps].sort((a, b) => stepOrder(a.step) - stepOrder(b.step));
  if (!ordered.length) return <p className="font-body text-[13px] text-ink-faint">Pas encore de passage dans le questionnaire sur la période.</p>;
  const first = ordered[0].visitors;
  // Biggest loss between two consecutive steps, in people.
  let worst = -1;
  let worstLoss = 0;
  ordered.forEach((s, i) => {
    if (i === 0) return;
    const loss = ordered[i - 1].visitors - s.visitors;
    if (loss > worstLoss) {
      worstLoss = loss;
      worst = i;
    }
  });

  return (
    <div className="flex flex-col gap-1">
      {ordered.map((s, i) => (
        <div key={s.step} className="flex items-center gap-3">
          <span
            className={cn("w-[170px] shrink-0 truncate font-body text-[12.5px] sm:w-[210px]", i === worst ? "text-amber-300" : "text-ink-muted")}
            title={s.step}
          >
            {i + 1}. {stepLabel(s.step)}
          </span>
          <Bar value={s.visitors} max={first} title={`${stepLabel(s.step)} : ${s.visitors} visiteurs`} />
          <span className="w-[130px] shrink-0 text-right font-body text-[12.5px]">
            <span className="font-semibold text-ink">{nf.format(s.visitors)}</span>
            <span className="ml-2 text-ink-faint">{pct(s.visitors, first)}</span>
            {i === worst && (
              <span className="ml-1.5 inline-flex items-center text-amber-300" title={`Plus grosse perte : −${worstLoss} personnes`}>
                <ArrowDownRight className="size-3.5" />
              </span>
            )}
          </span>
        </div>
      ))}
      {worst > 0 && (
        <p className="mt-3 flex items-center gap-1.5 font-body text-[12.5px] text-amber-300">
          <ArrowDownRight className="size-3.5" />
          Plus grosse perte : « {stepLabel(ordered[worst].step)} » (−{worstLoss} personnes par rapport à l&apos;étape
          d&apos;avant).
        </p>
      )}
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-body text-[13px]">
        <thead>
          <tr className="border-y border-ink/8 text-ink-faint">
            {head.map((h, i) => (
              <th key={h} className={cn("px-5 py-2.5 font-normal sm:px-6", i > 0 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Sources({ rows }: { rows: Analytics["sources"] }) {
  if (!rows.length) return <Empty />;
  const max = Math.max(...rows.map((r) => r.visitors), 1);
  return (
    <Table head={["Source", "Visiteurs", "Inscrits", "Payants", "Conversion"]}>
      {rows.map((r) => (
        <tr key={r.source} className="border-b border-ink/5 last:border-0">
          <td className="px-5 py-2.5 text-ink sm:px-6">
            <div className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate">{SOURCE_LABELS[r.source] ?? r.source}</span>
              <div className="hidden h-1.5 w-24 shrink-0 rounded-full bg-ink/[0.05] sm:block">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(r.visitors / max) * 100}%` }} />
              </div>
            </div>
          </td>
          <td className="px-5 py-2.5 text-right text-ink sm:px-6">{nf.format(r.visitors)}</td>
          <td className="px-5 py-2.5 text-right text-ink-muted sm:px-6">{nf.format(r.signups)}</td>
          <td className="px-5 py-2.5 text-right text-ink-muted sm:px-6">{nf.format(r.payments)}</td>
          <td className="px-5 py-2.5 text-right text-ink-faint sm:px-6">{pct(r.payments, r.visitors)}</td>
        </tr>
      ))}
    </Table>
  );
}

function Actions({ rows }: { rows: Analytics["actions"] }) {
  if (!rows.length) return <Empty />;
  return (
    <Table head={["Action", "Personnes", "Fois"]}>
      {rows.map((r) => (
        <tr key={r.name} className="border-b border-ink/5 last:border-0">
          <td className="px-5 py-2.5 text-ink sm:px-6">{ACTION_NAMES[r.name] ?? r.name}</td>
          <td className="px-5 py-2.5 text-right text-ink sm:px-6">{nf.format(r.users)}</td>
          <td className="px-5 py-2.5 text-right text-ink-faint sm:px-6">{nf.format(r.count)}</td>
        </tr>
      ))}
    </Table>
  );
}

function Shares({ rows, unit = "visiteurs" }: { rows: { label: string; value: number; mono?: boolean }[]; unit?: string }) {
  if (!rows.length) return <Empty />;
  const total = rows.reduce((a, r) => a + r.value, 0);
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="flex flex-col gap-2.5 px-5 pb-5 sm:px-6">
      {rows.map((r) => (
        <div key={r.label} title={`${r.label} : ${r.value} ${unit}`}>
          <div className="flex items-baseline justify-between gap-3 font-body text-[12.5px]">
            <span className={cn("truncate text-ink-muted", r.mono && "font-mono text-[11.5px]")}>{r.label}</span>
            <span className="shrink-0 text-ink">
              {nf.format(r.value)} <span className="text-ink-faint">{pct(r.value, total)}</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-ink/[0.05]">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Feed({ events }: { events: FeedEvent[] }) {
  if (!events.length) return <Empty text="Aucun événement pour l'instant." />;
  return (
    <ul className="divide-y divide-ink/5 border-t border-ink/8">
      {events.map((e) => {
        const target = e.user_id ?? e.anon_id;
        const who = e.who ?? (e.user_id ? "Compte" : `Visiteur · ${SOURCE_LABELS[e.source ?? "direct"] ?? e.source}`);
        return (
          <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 sm:px-6">
            <span className="w-[86px] shrink-0 font-mono text-[11px] text-ink-faint">{formatParis(e.created_at)}</span>
            {target ? (
              <Link href={`/admin/parcours/${target}`} className="w-[150px] shrink-0 truncate font-body text-[13px] text-accent hover:underline">
                {who}
              </Link>
            ) : (
              <span className="w-[150px] shrink-0 truncate font-body text-[13px] text-ink-muted">{who}</span>
            )}
            <span className="min-w-0 flex-1 truncate font-body text-[13px] text-ink">{eventLabel(e.name, e.props, e.path)}</span>
            <span className="shrink-0 font-body text-[11px] text-ink-faint">
              {[e.device ? DEVICE_LABELS[e.device] : null, e.country].filter(Boolean).join(" · ")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Empty({ text = "Pas encore de données sur la période." }: { text?: string }) {
  return <p className="px-5 pb-5 font-body text-[13px] text-ink-faint sm:px-6">{text}</p>;
}
