import dbConnect from "@/lib/db/mongodb";
import Token from "@/models/Token";
import axios from "axios";
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
        const apiKey = process.env.MOBULA_API_KEY || "";

        const response = await axios({
          method: "get",
          url: `https://production-api.mobula.io/api/1/market/data?asset=${address}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
          timeout: 10000,
        });

        if (response.data && response.data.data) {
          // Update the token with the latest data
          await Token.findOneAndUpdate(
            { mint_address: address },
            {
              marketData: response.data.data,
              last_updated: new Date().toISOString(),
              processingNotes: `Refreshed during token page view because data was missing. Has price=${!!response
                .data.data.price}, Has marketCap=${!!response.data.data
                .market_cap}`,
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
            });
          }
        }
      } catch (refreshError) {
        console.error(
          `Error refreshing token data for ${address}:`,
          refreshError
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
