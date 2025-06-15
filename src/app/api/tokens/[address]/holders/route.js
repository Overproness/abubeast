import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request, { params }) {
  try {
    // Fix: Await the params object before destructuring
    const address = await params.address;

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!address) {
      return NextResponse.json(
        { error: "Token address is required" },
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

    // Calculate the blockchain parameter (default to Ethereum)
    // This should be extracted from token data if available
    const blockchain = "ethereum";

    try {
      // Make request to Mobula API for token holders using axios
      const response = await axios({
        method: "get",
        url: `https://production-api.mobula.io/api/1/market/token/holders?asset=${address}&blockchain=${blockchain}&limit=${limit}&offset=${offset}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        timeout: 10000,
      });

      return NextResponse.json({
        success: true,
        holders: response.data.data || [],
        total_count: response.data.total_count || 0,
      });
    } catch (apiError) {
      console.error("Error fetching holders data:", apiError.message);
      return NextResponse.json(
        {
          error: "Failed to fetch holders data",
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
      { error: "Failed to process holders request" },
      { status: 500 }
    );
  }
}
