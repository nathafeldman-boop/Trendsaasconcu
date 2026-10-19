// The few GitHub REST calls the launch autopilot needs, with the member's
// OAuth token: who they are, a private repository, and one commit holding
// several files (the Git Data API, so the plan lands as a single commit).

const API = "https://api.github.com";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "SaaSFounder",
  };
}

async function gh<T>(token: string, path: string, init?: { method?: string; body?: unknown }) {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: { ...headers(token), ...(init?.body ? { "Content-Type": "application/json" } : {}) },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json().catch(() => null)) as T | null;
  return { ok: res.ok, status: res.status, data };
}

export async function githubLogin(token: string) {
  const { ok, data } = await gh<{ login?: string }>(token, "/user");
  return ok && data?.login ? data.login : null;
}

export type Repo = { full_name: string; html_url: string; default_branch: string };

/**
 * A new private repository, initialised with a first commit so files can be
 * added on top. Taken names get a numeric suffix.
 */
export async function createRepo(token: string, baseName: string, description: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const name = attempt === 0 ? baseName : `${baseName}-${attempt + 1}`;
    const { ok, status, data } = await gh<Repo & { message?: string }>(token, "/user/repos", {
      method: "POST",
      body: { name, description: description.slice(0, 340), private: true, auto_init: true },
    });
    if (ok && data?.full_name) return { repo: data };
    // 422: the name is taken on their account; anything else won't get better.
    if (status !== 422) return { error: status === 401 ? "reconnect" : "create_failed" };
  }
  return { error: "name_taken" };
}

export type RepoFile = { path: string; content: string };

/** Commits `files` on top of `branch` in one commit. */
export async function commitFiles(token: string, fullName: string, branch: string, files: RepoFile[], message: string) {
  // Right after auto_init the branch can take a moment to exist.
  let head: string | undefined;
  for (let attempt = 0; attempt < 4 && !head; attempt++) {
    if (attempt) await new Promise((resolve) => setTimeout(resolve, 800));
    const ref = await gh<{ object?: { sha?: string } }>(token, `/repos/${fullName}/git/ref/heads/${branch}`);
    head = ref.data?.object?.sha;
  }
  if (!head) return false;

  const commit = await gh<{ tree?: { sha?: string } }>(token, `/repos/${fullName}/git/commits/${head}`);
  const baseTree = commit.data?.tree?.sha;
  if (!baseTree) return false;

  const tree = await gh<{ sha?: string }>(token, `/repos/${fullName}/git/trees`, {
    method: "POST",
    body: {
      base_tree: baseTree,
      tree: files.map((file) => ({ path: file.path, mode: "100644", type: "blob", content: file.content })),
    },
  });
  if (!tree.data?.sha) return false;

  const created = await gh<{ sha?: string }>(token, `/repos/${fullName}/git/commits`, {
    method: "POST",
    body: { message, tree: tree.data.sha, parents: [head] },
  });
  if (!created.data?.sha) return false;

  const moved = await gh(token, `/repos/${fullName}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: { sha: created.data.sha },
  });
  return moved.ok;
}

/** A file's current text on the default branch, or null when it doesn't exist. */
export async function readFile(token: string, fullName: string, path: string) {
  const { ok, data } = await gh<{ content?: string; encoding?: string }>(token, `/repos/${fullName}/contents/${path}`);
  if (!ok || !data?.content || data.encoding !== "base64") return null;
  return Buffer.from(data.content, "base64").toString("utf8");
}

/** The repository if it still exists and this token can reach it. */
export async function getRepo(token: string, fullName: string) {
  const { ok, data } = await gh<Repo>(token, `/repos/${fullName}`);
  return ok && data?.full_name ? data : null;
}
