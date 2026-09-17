"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { FloatingIcon } from "@/components/ui/floating-icon";

const TIPS = [
  "Vérifie que ta page d'accueil dit clairement, en une phrase, à qui elle s'adresse.",
  "Un seul appel à l'action clair et visible vaut mieux que plusieurs boutons différents.",
  "Teste ton site sur mobile : c'est probablement là que la majorité de tes visiteurs arrivent.",
];

type Analysis = { reachable: boolean; title?: string | null; description?: string | null };

export function SiteAnalysis({ url }: { url: string }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    fetch(`/api/site-analysis?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then(setAnalysis)
      .catch(() => setAnalysis({ reachable: false }));
  }, [url]);

  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.02] p-6">
      <FloatingIcon className="size-10">
        <Globe className="size-4" strokeWidth={1.75} />
      </FloatingIcon>
      <h2 className="mt-3 font-display text-xl font-semibold text-ink">Ton site</h2>
      <p className="mt-1 font-body text-[14px] text-ink-muted">{url}</p>

      {!analysis && (
        <p className="mt-4 font-body text-[13px] text-ink-faint">Analyse en cours...</p>
      )}

      {analysis && !analysis.reachable && (
        <p className="mt-4 font-body text-[13px] leading-relaxed text-ink-faint">
          On n&apos;a pas réussi à charger ton site pour l&apos;instant (vérifie que l&apos;URL est
          correcte et accessible publiquement). En attendant, voici des points à vérifier toi-même :
        </p>
      )}

      {analysis?.reachable && (analysis.title || analysis.description) && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
          {analysis.title && (
            <p className="font-body text-[14px] font-medium text-ink">{analysis.title}</p>
          )}
          {analysis.description && (
            <p className="mt-1 font-body text-[13px] text-ink-muted">{analysis.description}</p>
          )}
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {TIPS.map((tip) => (
          <li
            key={tip}
            className="rounded-lg border border-white/10 bg-white/[0.02] p-3 font-body text-[13px] text-ink-muted"
          >
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
