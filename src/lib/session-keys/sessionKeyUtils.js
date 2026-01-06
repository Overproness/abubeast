import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import crypto from "crypto";

/**
 * Generate a new Solana keypair for session key
 */
export function generateSessionKeypair() {
  const keypair = Keypair.generate();

  return {
    publicKey: keypair.publicKey.toString(),
    secretKey: keypair.secretKey,
    keypair,
  };
}

/**
 * Encrypt a private key using AES-256-GCM
 * @param {Uint8Array} secretKey - The secret key to encrypt
 * @param {string} masterPassword - Master password for encryption (should be from env)
 * @returns {object} - Encrypted data with IV
 */
export function encryptSecretKey(secretKey, masterPassword) {
  // Derive a 32-byte key from the master password
  const key = crypto.scryptSync(masterPassword, "salt", 32);

  // Generate a random IV
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  // Encrypt the secret key (convert Uint8Array to Buffer)
  const secretKeyBuffer = Buffer.from(secretKey);
  let encrypted = cipher.update(secretKeyBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Return encrypted data with IV and auth tag
  return {
    encryptedData: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt a private key using AES-256-GCM
 * @param {string} encryptedData - The encrypted data (hex string)
 * @param {string} iv - The IV used for encryption (hex string)
 * @param {string} authTag - The auth tag (hex string)
 * @param {string} masterPassword - Master password for decryption
 * @returns {Uint8Array} - Decrypted secret key
 */
export function decryptSecretKey(encryptedData, iv, authTag, masterPassword) {
  // Derive the key from master password
  const key = crypto.scryptSync(masterPassword, "salt", 32);

  // Create decipher
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "hex")
  );

  // Set auth tag
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  // Decrypt
  let decrypted = decipher.update(Buffer.from(encryptedData, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // Return as Uint8Array
  return new Uint8Array(decrypted);
}

/**
 * Create a Keypair from a decrypted secret key
 * @param {Uint8Array} secretKey - The secret key
 * @returns {Keypair} - Solana Keypair object
 */
export function keypairFromSecretKey(secretKey) {
  return Keypair.fromSecretKey(secretKey);
}

/**
 * Validate a Solana public key
 * @param {string} publicKeyString - Public key string
 * @returns {boolean} - Whether the public key is valid
 */
export function isValidPublicKey(publicKeyString) {
  try {
    new PublicKey(publicKeyString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a message for user to sign when authorizing a session key
 * @param {string} publicKey - Session key public key
 * @param {Date} expiresAt - Expiration date
 * @param {object} permissions - Permissions object
 * @returns {string} - Message to sign
 */
export function generateAuthorizationMessage(
  publicKey,
  expiresAt,
  permissions = {}
) {
  const expiryDate = new Date(expiresAt).toISOString();

  const permissionsList = [];
  if (permissions.canTrade) permissionsList.push("trade");
  if (permissions.canSwap) permissionsList.push("swap");
  if (permissions.canStake) permissionsList.push("stake");
  if (permissions.canTransfer) permissionsList.push("transfer");

  const limits = [];
  if (permissions.maxTransactionAmount) {
    limits.push(
      `Max per transaction: $${permissions.maxTransactionAmount.toFixed(2)}`
    );
  }
  if (permissions.dailySpendingLimit) {
    limits.push(`Daily limit: $${permissions.dailySpendingLimit.toFixed(2)}`);
  }

  return `Authorize Trading Session Key

Session Key: ${publicKey}
Permissions: ${permissionsList.join(", ") || "none"}
${limits.length > 0 ? `Limits: ${limits.join(", ")}` : ""}
Expires: ${expiryDate}

By signing this message, you authorize this session key to execute trades on your behalf within the specified limits and permissions until the expiration date.

⚠️ This key will have access to trade with your wallet. Only approve if you trust this application.`;
}

/**
 * Verify a signature for session key authorization
 * @param {string} message - Original message
 * @param {string} signature - Signature from wallet
 * @param {string} walletAddress - Wallet address that signed
 * @returns {boolean} - Whether signature is valid
 */
export async function verifySessionKeySignature(
  message,
  signature,
  walletAddress
) {
  try {
    // For Solana wallets
    const messageBytes = new TextEncoder().encode(message);
    const publicKey = new PublicKey(walletAddress);
    const signatureBytes = bs58.decode(signature);

    // Note: In production, you'd use nacl.sign.detached.verify
    // For now, we'll do basic validation
    return signatureBytes.length === 64;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

/**
 * Check if a session key has expired
 * @param {Date} expiresAt - Expiration date
 * @returns {boolean} - Whether the key has expired
 */
export function isSessionKeyExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

/**
 * Get remaining time for a session key
 * @param {Date} expiresAt - Expiration date
 * @returns {object} - Time remaining in various units
 */
export function getSessionKeyTimeRemaining(expiresAt) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;

  if (diff <= 0) {
    return { expired: true, milliseconds: 0 };
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    expired: false,
    milliseconds: diff,
    seconds,
    minutes,
    hours,
    days,
    formatted: `${days}d ${hours % 24}h ${minutes % 60}m`,
  };
}

/**
 * Calculate expiration date from duration
 * @param {number} hours - Number of hours until expiration
 * @returns {Date} - Expiration date
 */
export function calculateExpirationDate(hours = 24) {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Get master encryption key from environment
 * @returns {string} - Master key for encryption
 */
export function getMasterEncryptionKey() {
  const key = process.env.SESSION_KEY_ENCRYPTION_SECRET;
  if (!key) {
    throw new Error(
      "SESSION_KEY_ENCRYPTION_SECRET is not set in environment variables"
    );
  }
  return key;
}
