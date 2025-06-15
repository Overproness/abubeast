export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const routeRequest = await request.json();

    // Use LiFi API directly instead of SDK
    const lifiResponse = await fetch("https://li.quest/v1/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fromChain: routeRequest.fromChainId,
        toChain: routeRequest.toChainId,
        fromToken: routeRequest.fromTokenAddress,
        toToken: routeRequest.toTokenAddress,
        fromAddress: routeRequest.fromAddress,
        fromAmount: routeRequest.fromAmount,
        slippage: routeRequest.slippage || 0.5,
        integrator: "AbuBeast",
      }),
    });

    if (!lifiResponse.ok) {
      throw new Error(`LiFi API error: ${lifiResponse.status}`);
    }

    const lifiData = await lifiResponse.json();

    return NextResponse.json({
      routes: lifiData.routes || [],
      estimate: lifiData.estimate,
    });
  } catch (error) {
    console.error("Error getting route:", error);
    return NextResponse.json(
      { error: "Failed to get route" },
      { status: 500 }
    );
  }
}
