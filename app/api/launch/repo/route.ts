import { NextResponse } from "next/server";
import { commitFiles, createRepo, getRepo, readFile } from "@/lib/connections/github";
import { getAccessToken, openLaunchSession } from "@/lib/connections/store";
import { parseIdea, repoFiles, repoSlug } from "@/lib/launch/repo-files";
import { getIdeaText, getLaunchState, updateLaunchState } from "@/lib/launch/state";
import { logEvent } from "@/lib/analytics/server";

export const maxDuration = 30;

// Step 1 of the autopilot: a private GitHub repository holding the whole
// plan, so Claude Code (or Replit) starts from it with one sentence.
export async function POST() {
  const opened = await openLaunchSession();
  if ("response" in opened) return opened.response;
  const { userId, admin } = opened.session;

  const [state, token, ideaText] = await Promise.all([
    getLaunchState(admin, userId),
    getAccessToken(admin, userId, "github"),
    getIdeaText(admin, userId),
  ]);
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 400 });
  if (!ideaText) return NextResponse.json({ error: "no_idea" }, { status: 400 });
  const files = repoFiles({ ideaText, supabaseUrl: state.supabase_url, supabaseKey: state.supabase_publishable_key });

  // Already created: only finish it if the plan never made it in.
  const existing = state.repo_full_name ? await getRepo(token, state.repo_full_name) : null;
  if (existing) {
    if ((await readFile(token, existing.full_name, "CLAUDE.md")) === null) {
      const committed = await commitFiles(token, existing.full_name, existing.default_branch, files, "Plan du projet, préparé par SaaSFounder");
      if (!committed) return NextResponse.json({ error: "commit_failed", state }, { status: 502 });
    }
    return NextResponse.json({ state });
  }

  const idea = parseIdea(ideaText);
  const created = await createRepo(token, repoSlug(idea.title), idea.pitch ?? idea.title);
  if ("error" in created) return NextResponse.json({ error: created.error }, { status: 502 });

  const next = { ...state, repo_full_name: created.repo.full_name, repo_url: created.repo.html_url };
  await updateLaunchState(admin, userId, { repo_full_name: next.repo_full_name, repo_url: next.repo_url });
  const committed = await commitFiles(
    token,
    created.repo.full_name,
    created.repo.default_branch,
    files,
    "Plan du projet, préparé par SaaSFounder"
  );
  if (!committed) return NextResponse.json({ error: "commit_failed", state: next }, { status: 502 });

  await logEvent({ name: "repo_created", user_id: userId, props: { repo: created.repo.full_name } });
  return NextResponse.json({ state: next });
}
