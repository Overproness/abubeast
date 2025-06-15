import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request, { params }) {
  try {
    // Fix: Await the params object before destructuring
    const address = await params.address;

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

    try {
      // Make request to Mobula API for recent transactions
      const response = await axios({
        method: "get",
        url: `https://production-api.mobula.io/api/1/market/trades?asset=${address}&limit=50`,
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        timeout: 10000,
      });

      // Format transactions data
      if (response.data.data && Array.isArray(response.data.data)) {
        const transactions = response.data.data.map((tx) => ({
          hash: tx.hash,
          timestamp: tx.date,
          type: tx.type, // "buy" or "sell"
          amount: tx.token_amount,
          amountUsd: tx.token_amount_usd,
          price: tx.token_price,
          sender: tx.sender,
        }));

        return NextResponse.json({
          success: true,
          transactions,
        });
      } else {
        return NextResponse.json(
          { error: "Invalid data format from API" },
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error("Error fetching transactions data:", apiError.message);
      return NextResponse.json(
        {
          error: "Failed to fetch transactions data",
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
      { error: "Failed to process transactions request" },
      { status: 500 }
    );
  }
}
