// The Supabase Management API calls the launch autopilot needs, with the
// member's OAuth token: their organizations, a new project, its status,
// running the starter schema, and the project's publishable key.

const API = "https://api.supabase.com";

async function sb<T>(token: string, path: string, init?: { method?: string; body?: unknown }) {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json().catch(() => null)) as T | null;
  return { ok: res.ok, status: res.status, data };
}

type Organization = { slug: string; name: string };

export async function listOrganizations(token: string) {
  const { ok, data } = await sb<Organization[]>(token, "/v1/organizations");
  return ok && Array.isArray(data) ? data : [];
}

export async function supabaseAccountName(token: string) {
  const orgs = await listOrganizations(token);
  return orgs.length ? orgs.map((org) => org.name).join(", ").slice(0, 120) : null;
}

/** A new project in Paris (closest to French customers), smallest size. */
export async function createProject(token: string, input: { name: string; organizationSlug: string; dbPass: string }) {
  const { ok, status, data } = await sb<{ ref?: string; status?: string; message?: string }>(token, "/v1/projects", {
    method: "POST",
    body: {
      name: input.name,
      organization_slug: input.organizationSlug,
      db_pass: input.dbPass,
      region_selection: { type: "specific", code: "eu-west-3" },
    },
  });
  if (ok && data?.ref) return { ref: data.ref, status: data.status ?? "COMING_UP" };
  console.error("Supabase project creation failed:", status, data?.message);
  return { error: status === 401 ? "reconnect" : "create_failed", message: data?.message ?? null };
}

export async function projectStatus(token: string, ref: string) {
  const { ok, status, data } = await sb<{ status?: string }>(token, `/v1/projects/${ref}`);
  if (status === 401) return "RECONNECT";
  return ok ? (data?.status ?? "UNKNOWN") : "UNKNOWN";
}

export async function runQuery(token: string, ref: string, query: string) {
  const { ok, status, data } = await sb<{ message?: string }>(token, `/v1/projects/${ref}/database/query`, {
    method: "POST",
    body: { query },
  });
  if (!ok) console.error("Supabase query failed:", status, data && "message" in data ? data.message : "");
  return ok;
}

/** The key the browser uses: the new publishable key, else the legacy anon key. */
export async function publishableKey(token: string, ref: string) {
  const { ok, data } = await sb<{ api_key?: string | null; type?: string | null; name?: string }[]>(
    token,
    `/v1/projects/${ref}/api-keys`
  );
  if (!ok || !Array.isArray(data)) return null;
  const key = data.find((k) => k.type === "publishable" && k.api_key) ?? data.find((k) => k.name === "anon" && k.api_key);
  return key?.api_key ?? null;
}
