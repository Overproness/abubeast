import tokenApiService from "@/lib/services/tokenApiService";
import { NextResponse } from "next/server";

/**
 * API Key Management and Testing Endpoint
 * GET /api/admin/api-keys - Get API key metrics and health status
 * POST /api/admin/api-keys - Test API functionality and force key switches
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "health":
        return NextResponse.json({
          success: true,
          health: tokenApiService.getProviderHealth(),
          timestamp: new Date().toISOString(),
        });

      case "metrics":
        return NextResponse.json({
          success: true,
          metrics: tokenApiService.getMetrics(),
          timestamp: new Date().toISOString(),
        });

      case "test":
        // Test with a known token (USDC on Ethereum)
        const testAddress = "0xA0b86a33E6417C7C5a77f1b7Fe1e2B2e33C6D1D4";
        const testResult = await tokenApiService.getTokenData(testAddress);

        return NextResponse.json({
          success: true,
          test: {
            address: testAddress,
            provider: testResult.provider,
            hasData: !!testResult.data,
            price: testResult.data?.price || 0,
          },
          healthAfterTest: tokenApiService.getProviderHealth(),
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          health: tokenApiService.getProviderHealth(),
          metrics: tokenApiService.getMetrics(),
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("API Keys endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, provider, testTokens } = body;

    const results = {};

    switch (action) {
      case "reset":
        tokenApiService.resetMetrics();
        results.message = "API metrics reset successfully";
        break;

      case "switch":
        if (!provider) {
          throw new Error("Provider required for switch action");
        }
        tokenApiService.forceKeySwitch(provider);
        results.message = `Forced key switch for ${provider}`;
        break;

      case "batch-test":
        if (!testTokens || !Array.isArray(testTokens)) {
          throw new Error("testTokens array required for batch-test");
        }

        const batchResults = [];
        for (const token of testTokens.slice(0, 5)) {
          // Limit to 5 for testing
          try {
            const result = await tokenApiService.getTokenData(token);
            batchResults.push({
              address: token,
              success: true,
              provider: result.provider,
              hasPrice: !!result.data?.price,
              price: result.data?.price || 0,
            });
          } catch (error) {
            batchResults.push({
              address: token,
              success: false,
              error: error.message,
            });
          }
        }

        results.batchResults = batchResults;
        break;

      case "trending-test":
        try {
          const trending = await tokenApiService.getTrendingTokens(10);
          results.trending = trending;
        } catch (error) {
          results.trendingError = error.message;
        }
        break;

      default:
        throw new Error("Invalid action specified");
    }

    return NextResponse.json({
      success: true,
      action,
      results,
      healthAfter: tokenApiService.getProviderHealth(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Keys POST endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
