import { NextRequest, NextResponse } from "next/server";

import { getRpcEndpoints } from "@/lib/solana-rpc";

const RPC_ENDPOINTS = getRpcEndpoints();

async function getBalanceFromRpc(
  endpoint: string,
  address: string,
): Promise<number> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [address, { commitment: "confirmed" }],
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  if (json.error) throw new Error(JSON.stringify(json.error));

  return json.result.value / 1_000_000_000; // lamports → SOL
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  let lastError: unknown;
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const balance = await getBalanceFromRpc(endpoint, address);
      return NextResponse.json({ balance });
    } catch (err) {
      lastError = err;
    }
  }

  console.error("All RPC endpoints failed:", lastError);
  return NextResponse.json(
    { error: "Unable to fetch balance" },
    { status: 502 },
  );
}
