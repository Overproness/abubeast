import dbConnect from "@/lib/db/mongodb";
import tokenApiService from "@/lib/services/tokenApiService";
import Token from "@/models/Token";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Get the address parameter
    const address = params.address;

    if (!address) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the token by mint_address
    const token = await Token.findOne({ mint_address: address }).lean();

    if (!token) {
      console.log(`Token not found for address: ${address}`);
      return NextResponse.json(
        {
          error: "Token not found",
          address: address,
        },
        { status: 404 }
      );
    }

    // Check if the token needs a refresh
    let needsRefresh = false;
    if (
      token.processed &&
      (!token.marketData ||
        !token.marketData.price ||
        !token.marketData.market_cap)
    ) {
      needsRefresh = true;
      console.log(
        `Token ${address} is marked as processed but missing price or market cap data. Will attempt refresh.`
      );
    }

    // If the token needs a refresh, attempt to fetch the latest data
    if (needsRefresh) {
      try {
        console.log(
          `Token ${address} is marked as processed but missing price or market cap data. Will attempt refresh using unified API service.`
        );

        const apiResult = await tokenApiService.getTokenData(address);

        if (apiResult?.data) {
          // Update the token with the latest data
          await Token.findOneAndUpdate(
            { mint_address: address },
            {
              marketData: apiResult.data,
              last_updated: new Date().toISOString(),
              processingNotes: `Refreshed during token page view using ${
                apiResult.provider
              } API. Has price=${!!apiResult.data
                .price}, Has marketCap=${!!apiResult.data.market_cap}`,
            }
          );

          // Get the updated token
          const updatedToken = await Token.findOne({
            mint_address: address,
          }).lean();
          if (updatedToken) {
            return NextResponse.json({
              success: true,
              token: updatedToken,
              refreshed: true,
              provider: apiResult.provider,
            });
          }
        }
      } catch (refreshError) {
        console.error(
          `Error refreshing token data for ${address}:`,
          refreshError.message
        );
        // Continue with the original token data even if refresh failed
      }
    }

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Error fetching token data:", error);
    return NextResponse.json(
      { error: "Failed to fetch token data", details: error.message },
      { status: 500 }
    );
  }
}

// Explicitly define the static parameters to avoid webpack issues
export function generateStaticParams() {
  return [];
}
