import { Connection } from "@solana/web3.js";

/**
 * Ordered RPC endpoints: Shyft (primary) → public fallbacks.
 * Override with SOLANA_RPC_URL env var to prepend a custom endpoint.
 * Shyft URL is loaded from SHYFT_RPC_URL env var.
 */
const SHYFT_RPC_URL = process.env.SHYFT_RPC_URL || "";

/** Per-request timeout for RPC calls (ms). */
const RPC_REQUEST_TIMEOUT_MS = 15_000;

export function getRpcEndpoints(): string[] {
  const endpoints = [
    process.env.SOLANA_RPC_URL,
    SHYFT_RPC_URL,
    "https://solana.publicnode.com",
    "https://api.mainnet-beta.solana.com",
  ].filter(Boolean) as string[];

  // Deduplicate while preserving order
  return [...new Set(endpoints)];
}

/**
 * Detect RPC / network timeout errors (504, ETIMEDOUT, abort, etc.)
 */
export function isRpcTimeoutError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /504|Gateway.?time.?out|ETIMEDOUT|ECONNREFUSED|ECONNRESET|fetch failed|abort/i.test(msg);
}

/** Wrap the global fetch with an AbortSignal timeout so no single RPC call hangs indefinitely. */
function fetchWithTimeout(timeoutMs: number): typeof globalThis.fetch {
  return (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const signal = init?.signal
      ? // If the caller already provided a signal, race both
        AbortSignal.any([init.signal, controller.signal])
      : controller.signal;
    return globalThis
      .fetch(input, { ...init, signal })
      .finally(() => clearTimeout(timer));
  };
}

/**
 * Returns a Connection to the first RPC endpoint that responds successfully.
 * Performs a lightweight `getSlot` call to verify each endpoint before returning.
 * Pass `skipUrls` to exclude endpoints that recently failed.
 */
export async function getConnection(
  commitment: "confirmed" | "finalized" = "confirmed",
  skipUrls: Set<string> = new Set()
): Promise<Connection> {
  const endpoints = getRpcEndpoints().filter((u) => !skipUrls.has(u));
  if (endpoints.length === 0) {
    const all = getRpcEndpoints();
    console.error("All RPC endpoints were skipped, using first endpoint");
    return new Connection(all[0], {
      commitment,
      fetch: fetchWithTimeout(RPC_REQUEST_TIMEOUT_MS),
    });
  }

  for (const url of endpoints) {
    try {
      const conn = new Connection(url, {
        commitment,
        fetch: fetchWithTimeout(RPC_REQUEST_TIMEOUT_MS),
      });
      await conn.getSlot({ commitment });
      return conn;
    } catch {
      console.warn(`RPC endpoint unreachable, trying next: ${url}`);
    }
  }

  console.error("All RPC endpoints failed health check, using first endpoint");
  return new Connection(endpoints[0], {
    commitment,
    fetch: fetchWithTimeout(RPC_REQUEST_TIMEOUT_MS),
  });
}

/**
 * Client-side RPC endpoint (safe for browser).
 * Uses NEXT_PUBLIC_SOLANA_RPC_URL if set, otherwise Shyft → public fallbacks.
 */
export function getClientRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    process.env.NEXT_PUBLIC_SHYFT_RPC_URL ??
    "https://solana.publicnode.com"
  );
}

export function getClientRpcFallbackUrl(): string {
  return "https://solana.publicnode.com";
}
