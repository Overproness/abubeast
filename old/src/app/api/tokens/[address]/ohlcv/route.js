import tokenApiService from "@/lib/services/tokenApiService";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Fix: Await the params object before destructuring
    const address = await params.address;

    // Get period from URL parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "1h";

    if (!address) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    // Validate period
    const validPeriods = [
      "1min",
      "5min",
      "15min",
      "1h",
      "4h",
      "1d",
      "1w",
      "1M",
    ];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        {
          error:
            "Invalid period. Valid periods are: " + validPeriods.join(", "),
        },
        { status: 400 }
      );
    }

    // Use unified API service to get OHLCV data
    try {
      const result = await tokenApiService.getOHLCVData(address, period);

      return NextResponse.json({
        success: true,
        ohlcv: result.ohlcv,
        provider: result.provider,
      });
    } catch (apiError) {
      console.error("Error fetching OHLCV data:", apiError.message);

      return NextResponse.json(
        {
          error: "Failed to fetch OHLCV data",
          details: apiError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process OHLCV request" },
      { status: 500 }
    );
  }
}
