import { commitFiles, getRepo, readFile, type RepoFile } from "@/lib/connections/github";
import { getAccessToken, type AdminClient } from "@/lib/connections/store";
import { repoFiles, type RepoInputs } from "@/lib/launch/repo-files";
import { getIdeaText, type LaunchState } from "@/lib/launch/state";

// Writes the Supabase keys into the member's repository once the project
// is ready. A file is only replaced while it's still exactly one of the
// versions SaaSFounder wrote: anything their coding tool has edited since
// is left alone.

export async function syncRepoWithSupabase(admin: AdminClient, userId: string, state: LaunchState) {
  if (!state.repo_full_name || !state.supabase_url || !state.supabase_publishable_key) return false;
  const [token, ideaText] = await Promise.all([getAccessToken(admin, userId, "github"), getIdeaText(admin, userId)]);
  if (!token || !ideaText) return false;
  const repo = await getRepo(token, state.repo_full_name);
  if (!repo) return false;

  // The repo may have been created before the project, or while it was
  // still starting: every earlier version is a candidate.
  const earlier: RepoInputs[] = [
    { ideaText, supabaseUrl: null, supabaseKey: null },
    { ideaText, supabaseUrl: state.supabase_url, supabaseKey: null },
  ];
  const target = repoFiles({ ideaText, supabaseUrl: state.supabase_url, supabaseKey: state.supabase_publishable_key });
  const earlierVersions = earlier.map(repoFiles);

  const changes: RepoFile[] = [];
  for (const file of target) {
    const previous = earlierVersions.map((files) => files.find((f) => f.path === file.path)?.content);
    if (previous.every((content) => content === file.content)) continue;
    const current = await readFile(token, repo.full_name, file.path);
    if (current !== null && previous.includes(current) && current !== file.content) changes.push(file);
  }
  if (!changes.length) return true;
  return commitFiles(token, repo.full_name, repo.default_branch, changes, "Clés Supabase ajoutées par SaaSFounder");
}
