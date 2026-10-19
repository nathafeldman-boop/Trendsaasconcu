import { notFound } from "next/navigation";
import { EspaceShell } from "@/components/espace/espace-shell";
import { CreationTab } from "@/components/espace/creation-tab";
import { LaunchTab } from "@/components/espace/launch-tab";
import { CoachChatLoader } from "@/components/espace/coach-chat-loader";
import { RevenueTab } from "@/components/espace/revenue-tab";
import { MarketingTab } from "@/components/espace/marketing-tab";
import { SeedStorage } from "@/app/vsl-capture/seed-storage";
import {
  DEMO_COACH,
  DEMO_FIRST_NAME,
  DEMO_GOAL,
  DEMO_IDEA_TEXT,
  DEMO_LAUNCH,
  DEMO_METRICS,
  DEMO_PROMPT,
  DEMO_USER_ID,
} from "@/app/vsl-capture/demo";

// The real member-area screens filled with the demo member, for
// scripts/capture-vsl.mjs to screenshot into public/vsl. Development only.

export default async function VslCapture({ params }: { params: Promise<{ scene: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { scene } = await params;

  const shell = (path: string, children: React.ReactNode) => (
    <EspaceShell firstName={DEMO_FIRST_NAME} hasStripeSubscription isAdmin={false} activePath={path}>
      {children}
    </EspaceShell>
  );

  switch (scene) {
    case "creation":
      return shell(
        "/espace",
        <CreationTab
          userId={DEMO_USER_ID}
          firstName={DEMO_FIRST_NAME}
          checkoutSuccess={false}
          hasExistingSaas={false}
          autopilotStarted
          initialBuilder={{
            has_idea: false,
            idea_text: DEMO_IDEA_TEXT,
            chosen_tool: "claude",
            checklist: { site: true, auth: true },
            mvp_launched: false,
          }}
          initialIdeas={null}
          initialPrompt={{ text: DEMO_PROMPT, key: `claude::${DEMO_IDEA_TEXT.trim().slice(0, 2000)}` }}
        />
      );
    case "pilote":
      return shell(
        "/espace/lancement",
        <LaunchTab
          ideaTitle="RappelBeauté"
          ideaText={DEMO_IDEA_TEXT}
          connections={[
            { provider: "github", account_name: "camille-dev", connected_at: "" },
            { provider: "supabase", account_name: "Camille", connected_at: "" },
            { provider: "hostinger", account_name: "rappelbeaute.fr", connected_at: "" },
          ]}
          initialState={DEMO_LAUNCH}
          available={{ github: true, supabase: true, hostinger: true }}
          notice={{ connected: null, error: null }}
        />
      );
    case "coach":
      return shell(
        "/espace/coach",
        <>
          <SeedStorage storageKey={`saasfounder-coach-v1-${DEMO_USER_ID}`} value={JSON.stringify(DEMO_COACH)} />
          <CoachChatLoader
            userId={DEMO_USER_ID}
            firstName={DEMO_FIRST_NAME}
            initialQuestion=""
            initialBudgetUsed={12}
            facts={[
              { label: "Idée", value: "RappelBeauté" },
              { label: "Outil", value: "Claude Code" },
              { label: "Lancement", value: "2/6 étapes" },
              { label: "Stripe", value: "connecté" },
              { label: "Canal", value: "TikTok" },
            ]}
          />
        </>
      );
    case "revenus":
      return shell("/espace/revenus", <RevenueTab initialMetrics={DEMO_METRICS} revenueGoal={DEMO_GOAL} />);
    case "marketing":
      return shell(
        "/espace/marketing",
        <MarketingTab
          userId={DEMO_USER_ID}
          idea={DEMO_IDEA_TEXT}
          mvpLaunched
          hasExistingSaas={false}
          existingUrl={null}
          noFace
          prospects
          initialMarketing={{ chosen_channel: "TikTok", tiktok_url: "", self_reported_views: null, submitted_at: null }}
        />
      );
    default:
      notFound();
  }
}
