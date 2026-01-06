import dbConnect from "@/lib/db/mongodb";
import tokenApiService from "@/lib/services/tokenApiService";
import Token from "@/models/Token";
import { NextResponse } from "next/server";

// GET handler to retrieve tokens
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since"); // Get timestamp parameter
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    await dbConnect();

    // Build query based on parameters
    let query = {};
    if (since) {
      query.added_at = { $gt: new Date(parseInt(since)) };
    }

    // Get tokens from MongoDB with query filter
    const tokens = await Token.find(query)
      .sort({ added_at: -1 })
      .limit(limit)
      .lean();

    console.log(`[API] Found ${tokens.length} tokens in database`);

    // Return just the tokens array for backward compatibility
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}

// Fetch token data using unified API service
async function fetchTokenData(address) {
  try {
    console.log(`Fetching data for token ${address} using unified API service`);

    const apiResult = await tokenApiService.getTokenData(address);

    if (apiResult?.data) {
      // Check if price and market cap exist (even if they are 0)
      const hasPrice =
        apiResult.data.price !== undefined && apiResult.data.price !== null;
      const hasMarketCap =
        apiResult.data.market_cap !== undefined &&
        apiResult.data.market_cap !== null;

      console.log(
        `Successfully fetched data for ${address} from ${apiResult.provider}. Has price: ${hasPrice} (${apiResult.data.price}), Has market cap: ${hasMarketCap} (${apiResult.data.market_cap})`
      );

      return apiResult.data;
    }

    console.log(
      `Data received for ${address} but missing expected fields:`,
      JSON.stringify(apiResult).substring(0, 200) + "..."
    );

    return null;
  } catch (error) {
    console.error(`Error fetching data for ${address}:`, error.message);
    return null;
  }
}

// POST handler to receive new tokens
export async function POST(request) {
  try {
    // console.log("🚀 ~ POST ~ request:", request);
    const newTokens = await request.json();

    // Validate input
    if (!Array.isArray(newTokens)) {
      return NextResponse.json(
        { error: "Invalid input: Expected an array of tokens" },
        { status: 400 }
      );
    }

    // Validate each token object - only require mint_address now
    for (const token of newTokens) {
      if (!token.mint_address) {
        return NextResponse.json(
          {
            error: "Invalid token data: Each token must have mint_address",
          },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    // Add timestamp to new tokens
    const timestampedTokens = newTokens.map((token) => ({
      ...token,
      added_at: new Date(),
      processed: false,
    }));

    // Add new tokens (avoiding duplicates by mint_address using upsert)
    const results = await Promise.all(
      timestampedTokens.map(async (token) => {
        return Token.findOneAndUpdate(
          { mint_address: token.mint_address },
          { $setOnInsert: token },
          { upsert: true, new: true }
        );
      })
    );

    // Count how many were actually inserted (new tokens)
    const newlyAddedCount = results.filter((result) => result.__v === 0).length;

    // Only enrich newly added tokens
    const newTokenIds = results
      .filter((result) => result.__v === 0)
      .map((token) => token._id);

    let enrichedCount = 0;

    // If we have new tokens, enrich them with market data
    if (newTokenIds.length > 0) {
      console.log(
        `Enriching ${newTokenIds.length} new tokens with market data`
      );

      // Process each token one by one to not overload the API
      const newTokensData = results.filter((result) => result.__v === 0);

      for (const token of newTokensData) {
        try {
          console.log(`Processing token ${token.mint_address} for enrichment`);
          const tokenData = await fetchTokenData(token.mint_address);

          if (tokenData) {
            // Check if we have the essential price data
            // We now check for null/undefined instead of truthy values
            const hasPrice =
              tokenData.price !== undefined && tokenData.price !== null;
            const hasMarketCap =
              tokenData.market_cap !== undefined &&
              tokenData.market_cap !== null;

            if (!hasPrice) {
              console.log(
                `Warning: Token ${token.mint_address} is missing price data`
              );
            }
            if (!hasMarketCap) {
              console.log(
                `Warning: Token ${token.mint_address} is missing market cap data`
              );
            }

            // Update the token with the new data including logo if available
            await Token.findOneAndUpdate(
              { _id: token._id },
              {
                marketData: {
                  ...tokenData,
                  // Make sure to include the logo if it exists
                  logo:
                    tokenData.logo ||
                    (tokenData.native && tokenData.native.logo) ||
                    "",
                },
                processed: true,
                last_updated: new Date().toISOString(),
                processingNotes:
                  hasPrice && hasMarketCap
                    ? `Fully processed: Price=${tokenData.price}, MarketCap=${
                        tokenData.market_cap
                      }, Logo=${
                        tokenData.logo ||
                        (tokenData.native && tokenData.native.logo) ||
                        "N/A"
                      }`
                    : `Partially processed: Has price=${hasPrice} (${
                        tokenData.price
                      }), Has marketCap=${hasMarketCap} (${
                        tokenData.market_cap
                      }), Has logo=${!!(
                        tokenData.logo ||
                        (tokenData.native && tokenData.native.logo)
                      )}`,
              }
            );
            enrichedCount++;
            console.log(`Successfully enriched token ${token.mint_address}`);
          } else {
            // Mark as processed but add a note about the missing data
            await Token.findOneAndUpdate(
              { _id: token._id },
              {
                processed: true,
                last_updated: new Date().toISOString(),
                processingNotes:
                  "Marked as processed but no data was retrieved from API",
              }
            );
            console.log(
              `Could not enrich token ${token.mint_address}, marked as processed with note`
            );
          }
        } catch (enrichError) {
          console.error(
            `Error enriching token ${token.mint_address}:`,
            enrichError
          );
          // Continue with the next token
        }
      }
    }

    return NextResponse.json({
      success: true,
      tokensAdded: newlyAddedCount,
      tokensEnriched: enrichedCount,
    });
  } catch (error) {
    console.error("Error processing tokens:", error);
    return NextResponse.json(
      { error: "Failed to process tokens" },
      { status: 500 }
    );
  }
}
