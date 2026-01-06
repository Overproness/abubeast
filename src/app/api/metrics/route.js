import tokenApiService from "@/lib/services/tokenApiService";
import { NextResponse } from "next/server";

/**
 * API Metrics Monitoring Endpoint
 * Provides information about API key usage and health
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "reset":
        tokenApiService.resetMetrics();
        return NextResponse.json({
          success: true,
          message: "API metrics reset successfully",
        });

      case "status":
      default:
        const metrics = tokenApiService.getMetrics();

        // Calculate summary statistics
        const summary = {
          mobula: {
            totalRequests: metrics.mobula.keys.reduce(
              (sum, key) => sum + key.requests,
              0
            ),
            totalErrors: metrics.mobula.keys.reduce(
              (sum, key) => sum + key.errors,
              0
            ),
            availableKeys: metrics.mobula.keys.filter((key) => !key.rateLimited)
              .length,
            rateLimitedKeys: metrics.mobula.keys.filter(
              (key) => key.rateLimited
            ).length,
          },
          moralis: {
            totalRequests: metrics.moralis.keys.reduce(
              (sum, key) => sum + key.requests,
              0
            ),
            totalErrors: metrics.moralis.keys.reduce(
              (sum, key) => sum + key.errors,
              0
            ),
            availableKeys: metrics.moralis.keys.filter(
              (key) => !key.rateLimited
            ).length,
            rateLimitedKeys: metrics.moralis.keys.filter(
              (key) => key.rateLimited
            ).length,
          },
        };

        // Health status
        const healthStatus = {
          mobula: summary.mobula.availableKeys > 0 ? "healthy" : "degraded",
          moralis: summary.moralis.availableKeys > 0 ? "healthy" : "degraded",
          overall:
            summary.mobula.availableKeys > 0 ||
            summary.moralis.availableKeys > 0
              ? "operational"
              : "down",
        };

        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          health: healthStatus,
          summary,
          detailed: metrics,
        });
    }
  } catch (error) {
    console.error("Error in API metrics endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve API metrics",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "test_mobula":
        try {
          await tokenApiService.makeMobulaRequest("/market/data", {
            asset: "0xa0b86a33e6776c2e1f682b38c8c4fb5af0de5e1a", // Sample ETH token
          });
          return NextResponse.json({
            success: true,
            message: "Mobula API test successful",
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: "Mobula API test failed",
            error: error.message,
          });
        }

      case "test_moralis":
        try {
          await tokenApiService.makeMoralisRequest("/erc20/metadata", {
            addresses: ["0xa0b86a33e6776c2e1f682b38c8c4fb5af0de5e1a"], // Sample ETH token
          });
          return NextResponse.json({
            success: true,
            message: "Moralis API test successful",
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: "Moralis API test failed",
            error: error.message,
          });
        }

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Supported actions: test_mobula, test_moralis",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in API metrics POST endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process API test request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
