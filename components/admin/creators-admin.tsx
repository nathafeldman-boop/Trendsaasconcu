"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MessageCircle, RefreshCw } from "lucide-react";
import { CopyLink } from "@/components/creators/copy-link";
import type { CreatorAccount } from "@/lib/creators/store";
import { formatEuros, formatViews, PAYOUT_METHODS, payoutLabel, whatsappUrl } from "@/lib/creators/program";
import { cn } from "@/lib/utils";

async function post(body: object) {
  const res = await fetch("/api/admin/creators", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  return !!res?.ok && (await res.json().catch(() => null))?.ok === true;
}

export function RefreshViewsButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | string>("idle");
  return (
    <button
      type="button"
      disabled={state === "busy"}
      onClick={async () => {
        setState("busy");
        const res = await fetch("/api/creators/refresh").catch(() => null);
        const data = await res?.json().catch(() => null);
        setState(data ? `${data.updated} à jour${data.failed ? `, ${data.failed} en erreur` : ""}` : "Erreur");
        router.refresh();
      }}
      className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 font-body text-[13px] text-ink-muted hover:border-accent/40 hover:text-ink disabled:opacity-50"
    >
      <RefreshCw className={cn("size-3.5", state === "busy" && "animate-spin")} />
      {state === "idle" || state === "busy" ? "Actualiser les vues" : state}
    </button>
  );
}

function CreatorRow({ creator }: { creator: CreatorAccount }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!creator.payout_method && !window.confirm(`${creator.name} n'a pas encore dit où le payer. Enregistrer quand même un paiement ?`)) return;
    const typed = window.prompt(
      `Montant payé à ${creator.name} (en €) via ${payoutLabel(creator.payout_method)} :`,
      (creator.dueCents / 100).toFixed(2).replace(".", ",")
    );
    if (!typed) return;
    const cents = Math.round(Number(typed.replace(",", ".").replace(/[^\d.]/g, "")) * 100);
    if (!cents || cents <= 0) return window.alert("Montant invalide");
    setBusy(true);
    if (!(await post({ action: "payout", creatorId: creator.id, amountCents: cents }))) window.alert("Enregistrement impossible");
    setBusy(false);
    router.refresh();
  }

  async function editPayout() {
    const options = PAYOUT_METHODS.map((m, i) => `${i + 1}. ${m.label}`).join("\n");
    const pick = window.prompt(`Moyen de paiement de ${creator.name} :\n${options}\n\nTape le numéro :`, "1");
    const method = PAYOUT_METHODS[Number(pick) - 1];
    if (!method) return;
    const details = window.prompt(`${method.label} : coordonnées (${method.placeholder})`, creator.payout_method === method.id ? creator.payout_details : "");
    if (!details) return;
    if (!(await post({ action: "payout-details", creatorId: creator.id, method: method.id, details }))) window.alert("Coordonnées invalides");
    router.refresh();
  }

  async function editInstagram() {
    const handle = window.prompt(`@ Instagram de ${creator.name} :`, creator.instagram_handle ? `@${creator.instagram_handle}` : "");
    if (handle === null) return;
    if (!(await post({ action: "instagram-handle", creatorId: creator.id, handle }))) window.alert("@ Instagram invalide");
    router.refresh();
  }

  async function enterViews(videoId: string, current: number) {
    const typed = window.prompt("Vues du reel (d'après la capture envoyée par le créateur) :", String(current));
    if (typed === null) return;
    const views = Number(typed.replace(/[\s.,]/g, ""));
    if (!Number.isFinite(views) || views < 0) return window.alert("Nombre invalide");
    if (!(await post({ action: "manual-views", videoId, views }))) window.alert("Enregistrement impossible");
    router.refresh();
  }

  async function toggleVideo(videoId: string, status: "active" | "rejected") {
    const reason = status === "rejected" ? window.prompt("Raison (visible par le créateur) :", "Ne respecte pas les règles") : null;
    if (status === "rejected" && reason === null) return;
    await post({ action: "video-status", videoId, status, reason });
    router.refresh();
  }

  return (
    <>
      <tr className="border-t border-ink/10 align-top">
        <td className="py-3 pr-3">
          <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-left text-ink hover:text-accent">
            <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            <span>
              {creator.name}
              <span className="block text-[12px] text-ink-faint">
                TikTok @{creator.tiktok_handle}
                {creator.instagram_handle && <> · IG @{creator.instagram_handle}</>}
              </span>
            </span>
          </button>
        </td>
        <td className="py-3 pr-3">
          <a href={whatsappUrl(creator.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-ink hover:text-accent">
            <MessageCircle className="size-3.5" />
            {creator.phone}
          </a>
        </td>
        <td className="py-3 pr-3">
          <span className={cn(!creator.payout_method && "text-amber-300")}>{payoutLabel(creator.payout_method)}</span>
          <span className="block select-all break-all text-[12px] text-ink-faint">{creator.payout_details}</span>
          <button type="button" onClick={editPayout} className="mt-1 text-[12px] text-accent hover:underline">
            {creator.payout_method ? "Modifier" : "Ajouter"}
          </button>
        </td>
        <td className="py-3 pr-3 text-right tabular-nums">{creator.videos.length}</td>
        <td className="py-3 pr-3 text-right tabular-nums">{formatViews(creator.views)}</td>
        <td className="py-3 pr-3 text-right tabular-nums">{formatEuros(creator.earnedCents)}</td>
        <td className="py-3 pr-3 text-right tabular-nums">{formatEuros(creator.paidCents)}</td>
        <td className={cn("py-3 pr-3 text-right font-semibold tabular-nums", creator.dueCents > 0 ? "text-accent" : "text-ink-faint")}>
          {formatEuros(creator.dueCents)}
        </td>
        <td className="py-3 text-right">
          <button
            type="button"
            disabled={busy}
            onClick={pay}
            className="rounded-full bg-accent px-3 py-1.5 text-[12.5px] font-semibold text-canvas disabled:opacity-40"
          >
            Payé
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={9} className="pb-4">
            <div className="rounded-[12px] bg-ink/[0.03] p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] text-ink-faint">
                <button type="button" onClick={editInstagram} className="text-accent hover:underline">
                  {creator.instagram_handle ? "Modifier l'Instagram" : "Ajouter l'Instagram"}
                </button>{" "}
                · Inscrit le {new Date(creator.created_at).toLocaleDateString("fr-FR")} · série : {creator.streak.current} j · ce mois-ci{" "}
                {creator.streak.thisMonth}/{creator.streak.daysInThisMonth} j
                {creator.streak.completedMonths.length > 0 && ` · ${creator.streak.completedMonths.length} mois complet(s)`} · page perso :
                <CopyLink path={`/createurs/${creator.token}`} label="Copier son lien" />
              </div>
              {creator.videos.length === 0 && <p className="text-[13px] text-ink-muted">Pas encore de vidéo.</p>}
              {creator.videos.map((v) => {
                const post = creator.posts.find((p) => p.tiktok?.id === v.id || p.instagram?.id === v.id);
                const paired = Boolean(post?.tiktok && post?.instagram);
                const counted = post?.counted === v.platform;
                return (
                <div key={v.id} className="flex items-center justify-between gap-3 border-t border-ink/5 py-2 text-[13px]">
                  <a href={v.url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-ink hover:text-accent">
                    {v.url.replace("https://www.", "")}
                    <span className="block text-[11.5px] text-ink-faint">
                      {v.status === "rejected" ? `Refusée : ${v.rejected_reason ?? ""}` : v.last_error ? `Erreur : ${v.last_error}` : "OK"}
                      {v.views_checked_at && ` · lu le ${new Date(v.views_checked_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`}
                    </span>
                  </a>
                  <span className="shrink-0 tabular-nums">
                    {v.platform === "instagram" ? "IG" : "TT"} · {formatViews(Number(v.views))} vues ·{" "}
                    {counted ? formatEuros(post?.earnedCents ?? 0) : paired ? "non comptée (l'autre fait plus)" : formatEuros(0)}
                  </span>
                  {v.platform === "instagram" && (
                    <button
                      type="button"
                      onClick={() => enterViews(v.id, Number(v.views))}
                      className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[12px] font-semibold text-canvas"
                    >
                      Saisir les vues
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleVideo(v.id, v.status === "active" ? "rejected" : "active")}
                    className="shrink-0 rounded-full border border-ink/15 px-2.5 py-1 text-[12px] text-ink-muted hover:text-ink"
                  >
                    {v.status === "active" ? "Refuser" : "Réactiver"}
                  </button>
                </div>
                );
              })}
              {creator.payouts.length > 0 && (
                <p className="mt-2 text-[12px] text-ink-faint">
                  Paiements : {creator.payouts.map((p) => `${formatEuros(p.amount_cents)} le ${new Date(p.created_at).toLocaleDateString("fr-FR")}`).join(" · ")}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function CreatorsTable({ creators }: { creators: CreatorAccount[] }) {
  if (creators.length === 0) {
    return <p className="font-body text-[14px] text-ink-muted">Aucun créateur inscrit pour l&apos;instant. Partage le lien d&apos;inscription.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] font-body text-[13.5px] text-ink-muted">
        <thead>
          <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.15em] text-ink-faint">
            <th className="pb-2">Créateur</th>
            <th className="pb-2">Téléphone</th>
            <th className="pb-2">Où le payer</th>
            <th className="pb-2 text-right">Vidéos</th>
            <th className="pb-2 text-right">Vues</th>
            <th className="pb-2 text-right">Gagné</th>
            <th className="pb-2 text-right">Payé</th>
            <th className="pb-2 text-right">À payer</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {creators.map((c) => (
            <CreatorRow key={c.id} creator={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
