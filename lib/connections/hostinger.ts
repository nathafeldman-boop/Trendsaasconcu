// Hostinger's API with the token the member pasted: their domains, and
// pointing one at their Netlify site.

const API = "https://developers.hostinger.com";

// Netlify's documented targets for a domain managed elsewhere.
const NETLIFY_APEX_IP = "75.2.60.5";

async function hostinger<T>(token: string, path: string, init?: { method?: string; body?: unknown }) {
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

type PortfolioEntry = { domain?: string | null; status?: string };

/** Active domains on the account, or null when the token doesn't work. */
export async function listDomains(token: string) {
  const { ok, data } = await hostinger<PortfolioEntry[]>(token, "/api/domains/v1/portfolio");
  if (!ok || !Array.isArray(data)) return null;
  return data.filter((d) => d.domain && d.status === "active").map((d) => d.domain as string);
}

export async function hostingerAccountName(token: string) {
  const domains = await listDomains(token);
  if (domains === null) return null;
  return domains.length === 1 ? domains[0] : `${domains.length} domaines`;
}

type ZoneRecord = { name: string; type: string; ttl?: number; records: { content: string }[] };

/**
 * Points `domain` (and www) at a Netlify site: A for the apex, CNAME for
 * www. Only the records in the way are removed first (apex A/AAAA/ALIAS,
 * www A/AAAA/CNAME), so e-mail (MX, TXT) keeps working. Hostinger's update
 * replaces the whole zone by default, hence overwrite: false.
 */
export async function pointDomainToNetlify(token: string, domain: string, netlifyHost: string) {
  const zonePath = `/api/dns/v1/zones/${encodeURIComponent(domain)}`;
  const records: ZoneRecord[] = [
    { name: "@", type: "A", ttl: 3600, records: [{ content: NETLIFY_APEX_IP }] },
    { name: "www", type: "CNAME", ttl: 3600, records: [{ content: netlifyHost }] },
  ];

  const valid = await hostinger(token, `${zonePath}/validate`, { method: "POST", body: { overwrite: false, zone: records } });
  if (!valid.ok) {
    console.error("Hostinger DNS validation failed:", valid.status);
    return { error: valid.status === 401 ? "reconnect" : "invalid_records" };
  }

  const current = await hostinger<ZoneRecord[]>(token, zonePath);
  if (!current.ok || !Array.isArray(current.data)) return { error: current.status === 401 ? "reconnect" : "zone_unreadable" };
  const inTheWay = current.data
    .filter(
      (r) =>
        (r.name === "@" && ["A", "AAAA", "ALIAS"].includes(r.type)) ||
        (r.name === "www" && ["A", "AAAA", "CNAME"].includes(r.type))
    )
    .map((r) => ({ name: r.name, type: r.type }));
  if (inTheWay.length) {
    const removed = await hostinger(token, zonePath, { method: "DELETE", body: { filters: inTheWay } });
    if (!removed.ok) return { error: "update_failed" };
  }

  const updated = await hostinger(token, zonePath, { method: "PUT", body: { overwrite: false, zone: records } });
  if (!updated.ok) {
    console.error("Hostinger DNS update failed:", updated.status);
    return { error: "update_failed" };
  }
  return { ok: true as const };
}
