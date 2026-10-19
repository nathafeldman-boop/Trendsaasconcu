"use client";

import { useMemo, useState } from "react";
import { marketingRecommendations } from "@/lib/espace/recommendations";
import { Recommendations } from "@/components/espace/recommendations";
import { TabHeader } from "@/components/espace/kit";
import { MarketingPanel, type MarketingProgress } from "@/components/espace/marketing-panel";
import { ContentGuide } from "@/components/espace/content-guide";
import { SiteAnalysis } from "@/components/espace/site-analysis";

export function MarketingTab({
  userId,
  idea,
  mvpLaunched,
  hasExistingSaas,
  existingUrl,
  noFace,
  prospects,
  initialMarketing,
}: {
  userId: string;
  idea: string;
  mvpLaunched: boolean;
  hasExistingSaas: boolean;
  existingUrl: string | null;
  noFace: boolean;
  prospects: boolean;
  initialMarketing: MarketingProgress;
}) {
  const [marketing, setMarketing] = useState(initialMarketing);

  const recs = useMemo(
    () =>
      marketingRecommendations({
        channel: marketing.chosen_channel,
        videoUrl: marketing.tiktok_url,
        views: marketing.self_reported_views,
        idea,
        mvpLaunched,
        hasExistingSaas,
        noFace,
        prospects,
      }),
    [marketing, idea, mvpLaunched, hasExistingSaas, noFace, prospects]
  );

  return (
    <div className="mx-auto flex max-w-[940px] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <TabHeader
        eyebrow="Marketing"
        title="Tes premiers clients."
        sub="Un canal, des vidéos qui accrochent et des messages à ta cible. Les recommandations suivent tes résultats."
      />
      <Recommendations items={recs} />
      {hasExistingSaas && existingUrl && <SiteAnalysis url={existingUrl} />}
      <MarketingPanel userId={userId} state={marketing} onChange={setMarketing} />
      <ContentGuide />
    </div>
  );
}
