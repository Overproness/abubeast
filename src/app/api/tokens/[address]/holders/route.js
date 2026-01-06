import tokenApiService from "@/lib/services/tokenApiService";
import { NextResponse } from "next/server";

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

    // Use unified API service to get holders data
    try {
      const result = await tokenApiService.getTokenHolders(
        address,
        limit,
        offset
      );

      return NextResponse.json({
        success: true,
        holders: result.holders,
        total_count: result.total_count,
        provider: result.provider,
      });
    } catch (apiError) {
      console.error("Error fetching holders data:", apiError.message);
      return NextResponse.json(
        {
          error: "Failed to fetch holders data",
          details: apiError.message,
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
