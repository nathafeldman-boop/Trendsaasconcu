import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CopyLink } from "@/components/creators/copy-link";
import { CreatorsTable, RefreshViewsButton } from "@/components/admin/creators-admin";
import { listCreatorAccounts } from "@/lib/creators/store";
import { bonusLabel, formatEuros, formatViews, rateLabel } from "@/lib/creators/program";

export const metadata: Metadata = {
  title: "Créateurs — Admin SaaSFounder",
  robots: { index: false, follow: false },
};

export default async function CreatorsAdminPage() {
  let creators: Awaited<ReturnType<typeof listCreatorAccounts>> = [];
  let setupError = false;
  try {
    creators = await listCreatorAccounts();
  } catch {
    setupError = true;
  }

  const sum = (pick: (c: (typeof creators)[number]) => number) => creators.reduce((total, c) => total + pick(c), 0);
  const totals = [
    { label: "Créateurs", value: String(creators.length) },
    { label: "Vidéos", value: String(sum((c) => c.videos.length)) },
    { label: "Vues comptées", value: formatViews(sum((c) => c.views)) },
    { label: "Total gagné", value: formatEuros(sum((c) => c.earnedCents)) },
    { label: "Déjà payé", value: formatEuros(sum((c) => c.paidCents)) },
    { label: "Reste à payer", value: formatEuros(sum((c) => c.dueCents)) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-6 sm:px-8">
      <Link href="/admin" className="inline-flex items-center gap-1.5 font-body text-[13px] text-ink-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> Admin
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Créateurs</h1>
          <p className="mt-1 font-body text-ink-muted">{rateLabel()} · bonus par vidéo : {bonusLabel()} · vues relues toutes les 10 minutes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyLink path="/createurs" label="Copier le lien d'inscription" />
          <RefreshViewsButton />
        </div>
      </div>

      {setupError ? (
        <p className="mt-8 rounded-[14px] border border-red-400/40 p-4 font-body text-[14px] text-red-300">
          Les tables créateurs n&apos;existent pas encore : colle le fichier supabase/migrations/0019_creators.sql dans l&apos;éditeur SQL de
          Supabase.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {totals.map((t) => (
              <div key={t.label} className="glass-panel rounded-[14px] p-4">
                <p className="font-body text-[12px] text-ink-faint">{t.label}</p>
                <p className="mt-1 font-display text-[20px] font-semibold text-ink">{t.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <CreatorsTable creators={creators} />
          </div>
        </>
      )}
    </div>
  );
}
