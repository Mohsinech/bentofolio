import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM for provider API keys at rest. The 32-byte key lives in the
// REVENUE_ENCRYPTION_KEY server variable (base64). Generate one with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

const VERSION = "v1";

function encryptionKey(): Buffer {
  const raw = process.env.REVENUE_ENCRYPTION_KEY;
  if (!raw) throw new Error("REVENUE_ENCRYPTION_KEY is not set");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("REVENUE_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  return key;
}

export function isEncryptionConfigured(): boolean {
  try {
    encryptionKey();
    return true;
  } catch {
    return false;
  }
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), tag.toString("base64"), body.toString("base64")].join(":");
}

export function decryptSecret(stored: string): string {
  const [version, iv, tag, body] = stored.split(":");
  if (version !== VERSION || !iv || !tag || !body) throw new Error("Unreadable stored key");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(body, "base64")), decipher.final()]).toString("utf8");
}

// "rk_live_51Hx…9a2B" -> "rk_live_…9a2B"
export function keyHint(key: string): string {
  const trimmed = key.trim();
  const prefix = trimmed.match(/^(rk|sk|pk)_(live|test)_/)?.[0] ?? "";
  return `${prefix}…${trimmed.slice(-4)}`;
}
