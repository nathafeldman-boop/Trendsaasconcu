import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { AddVideoForm } from "@/components/creators/add-video-form";
import { CopyLink } from "@/components/creators/copy-link";
import { getCreatorAccount } from "@/lib/creators/store";
import { earnedCents, formatEuros, formatViews, payoutLabel, rateLabel } from "@/lib/creators/program";

export const metadata: Metadata = {
  title: "Mon espace créateur — SaaSFounder",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function ago(iso: string | null) {
  if (!iso) return "en attente";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return hours < 48 ? `il y a ${hours} h` : `il y a ${Math.round(hours / 24)} j`;
}

export default async function CreatorAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ bienvenue?: string }>;
}) {
  const { token } = await params;
  const welcome = (await searchParams).bienvenue === "1";
  const creator = await getCreatorAccount(token);
  if (!creator) notFound();

  const stats = [
    { label: "Vues comptées", value: formatViews(creator.views) },
    { label: "Gagné", value: formatEuros(creator.earnedCents) },
    { label: "Déjà payé", value: formatEuros(creator.paidCents) },
    { label: "À recevoir", value: formatEuros(creator.dueCents), strong: true },
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
        <CopyLink path={`/createurs/${creator.token}`} />
      </div>

      {welcome && (
        <div className="mt-8 rounded-[16px] border border-accent/40 bg-accent/10 p-4 font-body text-[14px] leading-relaxed text-ink">
          <strong>Bienvenue {creator.name.split(" ")[0]} !</strong> Cette page est ton espace perso : ajoute-la à tes favoris ou copie
          le lien. C&apos;est grâce à lui que tu retrouves tes vues et tes gains.
        </div>
      )}

      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Espace créateur · @{creator.tiktok_handle}</p>
      <h1 className="mt-2 font-display text-[32px] font-semibold tracking-[-0.04em] text-ink">Tes vues et tes gains</h1>
      <p className="mt-1 font-body text-[14px] text-ink-muted">
        {rateLabel()} · vues mises à jour toutes les 10 minutes · paiement par {payoutLabel(creator.payout_method)}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-panel rounded-[16px] p-4">
            <p className="font-body text-[12px] text-ink-faint">{s.label}</p>
            <p className={`mt-1 font-display text-[22px] font-semibold ${s.strong ? "text-accent" : "text-ink"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <section className="glass-panel mt-8 rounded-[20px] p-5">
        <h2 className="font-body text-[15px] font-semibold text-ink">Ajouter une vidéo</h2>
        <p className="mb-4 mt-1 font-body text-[13px] text-ink-muted">Colle le lien d&apos;une vidéo publiée par @{creator.tiktok_handle}.</p>
        <AddVideoForm token={creator.token} />
      </section>

      <section className="mt-8">
        <h2 className="font-body text-[15px] font-semibold text-ink">Tes vidéos ({creator.videos.length})</h2>
        {creator.videos.length === 0 ? (
          <p className="mt-3 font-body text-[14px] text-ink-muted">Aucune vidéo pour l&apos;instant.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {creator.videos.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 rounded-[14px] border border-ink/10 p-4">
                <div className="min-w-0">
                  <a href={v.url} target="_blank" rel="noreferrer" className="block truncate font-body text-[13.5px] text-ink hover:text-accent">
                    Vidéo {v.video_id.slice(-6)}
                    {v.posted_at && <span className="text-ink-faint"> · publiée le {new Date(v.posted_at).toLocaleDateString("fr-FR")}</span>}
                  </a>
                  <p className="font-body text-[12px] text-ink-faint">
                    {v.status === "rejected"
                      ? `Non comptée${v.rejected_reason ? ` : ${v.rejected_reason}` : ""}`
                      : v.last_error
                        ? `Lecture impossible (${v.last_error}), on réessaie`
                        : `Mise à jour ${ago(v.views_checked_at)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-[16px] font-semibold text-ink">{formatViews(Number(v.views))} vues</p>
                  <p className="font-body text-[12px] text-ink-faint">{v.status === "active" ? formatEuros(earnedCents(Number(v.views))) : "—"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {creator.payouts.length > 0 && (
        <section className="mt-8">
          <h2 className="font-body text-[15px] font-semibold text-ink">Paiements reçus</h2>
          <ul className="mt-3 flex flex-col gap-1 font-body text-[14px] text-ink-muted">
            {creator.payouts.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{new Date(p.created_at).toLocaleDateString("fr-FR")}</span>
                <span className="text-ink">{formatEuros(p.amount_cents)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
