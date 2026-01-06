import tokenApiService from "@/lib/services/tokenApiService";
import { NextResponse } from "next/server";

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

    // Use unified API service to get transactions data
    try {
      const result = await tokenApiService.getTokenTransactions(address, 50);

      return NextResponse.json({
        success: true,
        transactions: result.transactions,
        provider: result.provider,
      });
    } catch (apiError) {
      console.error("Error fetching transactions data:", apiError.message);
      return NextResponse.json(
        {
          error: "Failed to fetch transactions data",
          details: apiError.message,
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
