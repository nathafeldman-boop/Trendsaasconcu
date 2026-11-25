import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { AddMissingLink, AddVideoForm } from "@/components/creators/add-video-form";
import { CopyLink } from "@/components/creators/copy-link";
import { PayoutForm } from "@/components/creators/payout-form";
import { InstagramForm } from "@/components/creators/instagram-form";
import { RememberCreator } from "@/components/creators/creator-login";
import { getCreatorAccount } from "@/lib/creators/store";
import { bonusCents, bonusLabel, formatEuros, formatViews, payoutLabel, rateLabel, STREAK_BONUS_CENTS } from "@/lib/creators/program";

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
      <RememberCreator token={creator.token} />
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

      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Espace créateur · TikTok @{creator.tiktok_handle}
        {creator.instagram_handle && ` · Instagram @${creator.instagram_handle}`}
      </p>
      <h1 className="mt-2 font-display text-[32px] font-semibold tracking-[-0.04em] text-ink">Tes vues et tes gains</h1>
      <p className="mt-1 font-body text-[14px] text-ink-muted">
        {rateLabel()} · vues mises à jour toutes les 10 minutes · paiement : {payoutLabel(creator.payout_method)}
      </p>
      <p className="mt-1 font-body text-[13px] text-accent">
        Bonus par vidéo : {bonusLabel()}. Série : {formatEuros(STREAK_BONUS_CENTS)} si tu publies au moins une vidéo chaque jour du mois.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-panel rounded-[16px] p-4">
            <p className="font-body text-[12px] text-ink-faint">{s.label}</p>
            <p className={`mt-1 font-display text-[22px] font-semibold ${s.strong ? "text-accent" : "text-ink"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <section id="ajouter" className="glass-panel mt-6 rounded-[20px] border border-accent/30 p-5">
        <h2 className="font-body text-[17px] font-semibold text-ink">Ajouter une vidéo</h2>
        <p className="mb-4 mt-1 font-body text-[13px] leading-relaxed text-ink-muted">
          Une vidéo = une carte. Tu postes la même vidéo sur TikTok et sur Instagram ? Colle les deux liens ensemble : on paie la
          plateforme qui fait le plus de vues (on n&apos;additionne pas). Si tu ne colles qu&apos;un lien, on te demandera si c&apos;est
          un doublon.
        </p>
        <AddVideoForm
          token={creator.token}
          lonePosts={creator.posts
            .filter((p) => Boolean(p.tiktok) !== Boolean(p.instagram))
            .map((p) => ({ key: p.key, platform: p.tiktok ? "tiktok" : "instagram", date: p.postedAt, views: p.views }))}
        />
        <p className="mt-3 font-body text-[12px] leading-relaxed text-ink-faint">
          TikTok : vues lues automatiquement toutes les 10 minutes (vidéo publiée par @{creator.tiktok_handle}). Instagram : envoie-nous
          une capture des vues du reel sur WhatsApp, on les met à jour.
        </p>
      </section>

      <section className="mt-6 rounded-[20px] border border-ink/10 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-body text-[15px] font-semibold text-ink">Ta série</h2>
          <p className="font-display text-[22px] font-semibold text-ink">
            {creator.streak.current} jour{creator.streak.current > 1 ? "s" : ""} d&apos;affilée
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.round((creator.streak.thisMonth / creator.streak.daysInThisMonth) * 100)}%` }}
          />
        </div>
        <p className="mt-2 font-body text-[13px] text-ink-muted">
          {creator.streak.thisMonth} / {creator.streak.daysInThisMonth} jours avec une vidéo ce mois-ci.{" "}
          {creator.streak.stillPossible
            ? `Publie chaque jour jusqu'à la fin du mois pour gagner ${formatEuros(STREAK_BONUS_CENTS)}.`
            : `Un jour a été manqué ce mois-ci : le bonus de ${formatEuros(STREAK_BONUS_CENTS)} repart le mois prochain.`}
        </p>
        {creator.streak.completedMonths.length > 0 && (
          <p className="mt-1 font-body text-[13px] text-success">
            Mois complets : {creator.streak.completedMonths.length} · {formatEuros(creator.streak.bonusCents)} de bonus gagnés.
          </p>
        )}
      </section>

      {!creator.payout_method && (
        <section className="mt-8 rounded-[20px] border border-accent/40 bg-accent/[0.06] p-5">
          <h2 className="font-body text-[15px] font-semibold text-ink">Où veux-tu être payé ?</h2>
          <p className="mb-4 mt-1 font-body text-[13px] text-ink-muted">Ajoute-le quand tu veux : sans ça, on te contactera avant de te payer.</p>
          <PayoutForm token={creator.token} initialMethod="" initialDetails="" />
        </section>
      )}

      <section className="mt-8 rounded-[20px] border border-ink/10 bg-ink/[0.03] p-5">
        <h2 className="font-body text-[15px] font-semibold text-ink">Ce que tu peux filmer</h2>
        <p className="mt-1 font-body text-[13.5px] leading-relaxed text-ink-muted">
          La simulation montre la création d&apos;un SaaS de A à Z : l&apos;objectif de revenus, les choix, le potentiel, puis le site
          généré. Ouvre-la sur ton ordinateur et filme l&apos;écran avec ton téléphone. Rien n&apos;est enregistré, tu peux la rejouer
          autant que tu veux.
        </p>
        <a
          href="/simulation"
          target="_blank"
          rel="noopener"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 font-body text-[14px] font-semibold text-canvas transition-transform hover:scale-[1.02]"
        >
          Ouvrir la simulation
        </a>
        <p className="mt-3 font-body text-[12.5px] text-ink-faint">
          Pense à indiquer « Collaboration commerciale » sur chaque vidéo, et à mentionner saasfounder.fr.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-body text-[15px] font-semibold text-ink">Tes vidéos ({creator.posts.length})</h2>
        {creator.posts.length === 0 ? (
          <p className="mt-3 font-body text-[14px] text-ink-muted">Aucune vidéo pour l&apos;instant.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {creator.posts.map((post) => (
              <li key={post.key} className="rounded-[14px] border border-ink/10 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-body text-[12.5px] text-ink-faint">
                    Publiée le {new Date(post.postedAt).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}
                  </p>
                  <p className="shrink-0 text-right font-body text-[13px] text-ink">
                    <span className="font-display text-[16px] font-semibold">{formatEuros(post.earnedCents)}</span>
                    {bonusCents(post.views) > 0 && <span className="text-ink-faint"> dont {formatEuros(bonusCents(post.views))} de bonus</span>}
                  </p>
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  {[post.tiktok, post.instagram].map((v, i) => {
                    const platform = i === 0 ? "tiktok" : "instagram";
                    const name = i === 0 ? "TikTok" : "Instagram";
                    if (!v) return <AddMissingLink key={platform} token={creator.token} post={post.key} platform={platform} />;
                    const counted = post.counted === platform;
                    return (
                      <div key={platform} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <a href={v.url} target="_blank" rel="noreferrer" className="font-body text-[13.5px] font-semibold text-ink hover:text-accent">
                            {name}
                          </a>
                          <span className="ml-2 font-body text-[12px] text-ink-faint">
                            {v.status === "rejected"
                              ? `non comptée${v.rejected_reason ? ` : ${v.rejected_reason}` : ""}`
                              : platform === "instagram"
                                ? v.views_checked_at
                                  ? `mis à jour ${ago(v.views_checked_at)}`
                                  : "envoie-nous une capture sur WhatsApp"
                                : v.last_error
                                  ? "lecture en cours, on réessaie"
                                  : `mis à jour ${ago(v.views_checked_at)}`}
                          </span>
                        </div>
                        <p className={`shrink-0 font-body text-[13.5px] tabular-nums ${counted ? "font-semibold text-accent" : "text-ink-faint"}`}>
                          {formatViews(Number(v.views))} vues{counted && post.tiktok && post.instagram ? " · comptées" : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className="mt-8 rounded-[16px] border border-ink/10 p-4">
        <summary className="cursor-pointer font-body text-[14px] text-ink-muted">
          Ton compte Instagram{creator.instagram_handle ? ` : @${creator.instagram_handle}` : " (facultatif)"}
        </summary>
        <div className="mt-4">
          <InstagramForm token={creator.token} initial={creator.instagram_handle} />
        </div>
      </details>

      {creator.payout_method && (
        <details className="mt-8 rounded-[16px] border border-ink/10 p-4">
          <summary className="cursor-pointer font-body text-[14px] text-ink-muted">
            Paiement par {payoutLabel(creator.payout_method)} (…{creator.payout_details.slice(-4)}) · modifier
          </summary>
          <div className="mt-4">
            <PayoutForm token={creator.token} initialMethod={creator.payout_method} initialDetails="" />
          </div>
        </details>
      )}

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
