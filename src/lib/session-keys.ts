import crypto from "crypto";

const MASTER_PASSWORD = process.env.SESSION_KEY_MASTER_PASSWORD || "default-master-password-change-in-production";

export interface EncryptedKey {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export function encryptSecretKey(secretKey: Uint8Array): EncryptedKey {
  const key = crypto.scryptSync(MASTER_PASSWORD, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(secretKey)),
    cipher.final(),
  ]);

  return {
    encryptedData: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
  };
}

export function decryptSecretKey(encrypted: EncryptedKey): Uint8Array {
  const key = crypto.scryptSync(MASTER_PASSWORD, "salt", 32);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(encrypted.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.encryptedData, "hex")),
    decipher.final(),
  ]);

  return new Uint8Array(decrypted);
}

export function generateAuthorizationMessage(
  publicKey: string,
  expiresAt: Date,
  permissions: Record<string, boolean>
): string {
  const permList = Object.entries(permissions)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ");

  return [
    "AbuBeast Trading Bot Authorization",
    "",
    `Session Key: ${publicKey}`,
    `Expires: ${expiresAt.toISOString()}`,
    `Permissions: ${permList}`,
    "",
    "By signing this message, you authorize the above session key to execute trades on your behalf within the specified limits.",
    "",
    `Nonce: ${crypto.randomBytes(16).toString("hex")}`,
  ].join("\n");
}
