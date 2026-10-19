import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

// AES-256-GCM for the tokens members connect (GitHub, Supabase, Hostinger):
// a leaked database dump alone doesn't hand out access to their accounts.
// The key is CONNECTIONS_ENCRYPTION_KEY (32 bytes, base64) when set,
// otherwise derived from the service-role key so there's nothing extra to
// configure. Rotating whichever one is used means members reconnect.

const VERSION = "v1";

function encryptionKey(): Buffer | null {
  const explicit = process.env.CONNECTIONS_ENCRYPTION_KEY?.trim();
  if (explicit) {
    const key = Buffer.from(explicit, "base64");
    if (key.length === 32) return key;
    console.error("CONNECTIONS_ENCRYPTION_KEY must be 32 bytes in base64; falling back to the derived key");
  }
  const seed = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!seed) return null;
  return Buffer.from(hkdfSync("sha256", seed, "saasfounder", "user-connections-v1", 32));
}

export function canEncrypt() {
  return encryptionKey() !== null;
}

export function encrypt(plain: string) {
  const key = encryptionKey();
  if (!key) throw new Error("No encryption key configured");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `${VERSION}:${Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64")}`;
}

/** The plain text, or null if it can't be decrypted (wrong key, tampered, other format). */
export function decrypt(payload: string | null | undefined) {
  const key = encryptionKey();
  if (!key || !payload?.startsWith(`${VERSION}:`)) return null;
  try {
    const raw = Buffer.from(payload.slice(VERSION.length + 1), "base64");
    const decipher = createDecipheriv("aes-256-gcm", key, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
