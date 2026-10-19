// Netlify gives every site an address like mon-saas.netlify.app: the
// launch steps accept it pasted in any shape (with or without https://, a
// path, capitals) and keep only that host.
const NETLIFY_HOST = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.netlify\.app$/;

export function netlifyHost(input: string) {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  try {
    const host = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname;
    return NETLIFY_HOST.test(host) ? host : null;
  } catch {
    return null;
  }
}

/** Where a member imports their GitHub repository into Netlify. */
export const NETLIFY_IMPORT_URL = "https://app.netlify.com/start";
