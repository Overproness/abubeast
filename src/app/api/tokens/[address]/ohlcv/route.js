import { NextResponse } from "next/server";
import axios from "axios";

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

    // Get API key from environment variable
    const apiKey = process.env.MOBULA_API_KEY;

    if (!apiKey) {
      console.error("MOBULA_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "API key configuration error" },
        { status: 500 }
      );
    }

    // Use axios instead of fetch
    try {
      const response = await axios({
        method: "get",
        url: `https://production-api.mobula.io/api/1/market/candles?asset=${address}&period=${period}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        timeout: 10000,
      });

      // Format OHLCV data for the chart
      if (response.data.data && Array.isArray(response.data.data)) {
        const ohlcv = response.data.data.map((candle) => ({
          time: candle.timestamp / 1000, // Convert to seconds for lightweight-charts
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
        }));

        return NextResponse.json({
          success: true,
          ohlcv,
        });
      } else {
        return NextResponse.json(
          { error: "Invalid data format from API" },
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error("Error fetching OHLCV data:", apiError.message);

      // Return a more descriptive error for debugging
      return NextResponse.json(
        {
          error: "Failed to fetch OHLCV data",
          details: apiError.response
            ? apiError.response.data
            : apiError.message,
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
