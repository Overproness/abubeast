import dbConnect from "@/lib/db/mongodb";
import Token from "@/models/Token";
import axios from "axios";
import { NextResponse } from "next/server";

// Fetch token data from Mobula API
async function fetchTokenData(address) {
  try {
    const apiKey = process.env.MOBULA_API_KEY || "";

    console.log(`[Enrichment] Fetching data for token ${address}`);

    const response = await axios({
      method: "get",
      url: `https://production-api.mobula.io/api/1/market/data?asset=${address}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      timeout: 10000,
    });

    // Log the structure of the response to help debug
    if (response.data && response.data.data) {
      console.log(
        `[Enrichment] Successfully fetched data for ${address}. Has price: ${!!response
          .data.data.price}, Has market cap: ${!!response.data.data.market_cap}`
      );
    } else {
      console.log(
        `[Enrichment] Data received for ${address} but missing expected fields:`,
        JSON.stringify(response.data).substring(0, 200) + "..."
      );
    }

    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error(
        `Failed to fetch data for ${address}: ${error.response.status}`
      );
      if (error.response.data) {
        console.error(`Error details:`, error.response.data);
      }
    } else if (error.request) {
      console.error(`No response received for ${address}`);
    } else {
      console.error(`Error fetching data for ${address}:`, error.message);
    }
    return null;
  }
}

// Fetch multiple tokens data from Mobula API
async function fetchMultiTokenData(addresses) {
  if (addresses.length === 0) return {};

  try {
    const apiKey = process.env.MOBULA_API_KEY || "";
    const assetsParam = addresses.join(",");

    const response = await axios({
      method: "get",
      url: `https://production-api.mobula.io/api/1/market/multi-data?assets=${assetsParam}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      timeout: 15000, // Longer timeout for batch requests
    });

    return response.data.data || {};
  } catch (error) {
    if (error.response) {
      console.warn(`Failed to fetch batch data: ${error.response.status}`);
      if (error.response.data) {
        console.warn(`Error details:`, error.response.data);
      }
    } else if (error.request) {
      console.warn(`No response received for batch request`);
    } else {
      console.error("Error fetching batch data:", error.message);
    }
    return {};
  }
}

// POST endpoint to manually trigger data enrichment
export async function POST() {
  try {
    await dbConnect();

    // Find tokens that haven't been processed yet
    const unprocessedTokens = await Token.find({ processed: false }).lean();

    if (unprocessedTokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new tokens to process",
        processedCount: 0,
      });
    }

    console.log(`Processing ${unprocessedTokens.length} new tokens`);

    // Get addresses for batch processing (only for unprocessed tokens)
    const addresses = unprocessedTokens.map((token) => token.mint_address);

    // Fetch data in batch if possible for the unprocessed tokens
    const tokenDataMap = await fetchMultiTokenData(addresses);

    // Update tokens with fetched data
    let processedCount = 0;

    for (const token of unprocessedTokens) {
      // Process token if we got data for it
      if (tokenDataMap[token.mint_address]) {
        // Check if we have the essential price data
        const tokenData = tokenDataMap[token.mint_address];
        if (!tokenData.price) {
          console.log(
            `[Enrichment] Warning: Token ${token.mint_address} is missing price data`
          );
        }
        if (!tokenData.market_cap) {
          console.log(
            `[Enrichment] Warning: Token ${token.mint_address} is missing market cap data`
          );
        }

        await Token.findOneAndUpdate(
          { mint_address: token.mint_address },
          {
            marketData: tokenData,
            processed: true,
            last_updated: new Date().toISOString(),
            processingNotes:
              tokenData.price && tokenData.market_cap
                ? "Fully processed"
                : `Partially processed: Has price=${!!tokenData.price}, Has marketCap=${!!tokenData.market_cap}`,
          }
        );
        processedCount++;
      }
    }

    // Handle any tokens that weren't processed in batch
    const stillUnprocessedTokens = await Token.find({
      processed: false,
    }).lean();

    if (stillUnprocessedTokens.length > 0) {
      console.log(
        `Batch processing missed ${stillUnprocessedTokens.length} tokens, trying individual requests`
      );

      for (const token of stillUnprocessedTokens) {
        // Try to fetch individually
        const tokenData = await fetchTokenData(token.mint_address);
        if (tokenData) {
          // Check if we have the essential price data
          if (!tokenData.price) {
            console.log(
              `[Enrichment] Warning: Token ${token.mint_address} is missing price data`
            );
          }
          if (!tokenData.market_cap) {
            console.log(
              `[Enrichment] Warning: Token ${token.mint_address} is missing market cap data`
            );
          }

          await Token.findOneAndUpdate(
            { mint_address: token.mint_address },
            {
              marketData: tokenData,
              processed: true,
              last_updated: new Date().toISOString(),
              processingNotes:
                tokenData.price && tokenData.market_cap
                  ? "Fully processed"
                  : `Partially processed: Has price=${!!tokenData.price}, Has marketCap=${!!tokenData.market_cap}`,
            }
          );
          processedCount++;
        } else {
          // Mark as processed but add a note about the missing data
          await Token.findOneAndUpdate(
            { mint_address: token.mint_address },
            {
              processed: true,
              last_updated: new Date().toISOString(),
              processingNotes:
                "Marked as processed but no data was retrieved from API",
            }
          );
          console.log(
            `[Enrichment] Could not enrich token ${token.mint_address}, marked as processed with note`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} new tokens`,
      processedCount,
    });
  } catch (error) {
    console.error("Error processing token enrichment:", error);
    return NextResponse.json(
      { error: "Failed to process token enrichment" },
      { status: 500 }
    );
  }
}

// GET endpoint to verify the processed tokens have price data
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const showProblematic = searchParams.get("problematic") === "true";

    let query = {};
    if (showProblematic) {
      // Find tokens that are processed but have no price or market cap
      query = {
        processed: true,
        $or: [
          { "marketData.price": { $exists: false } },
          { "marketData.market_cap": { $exists: false } },
        ],
      };
    } else {
      // Get all tokens
      query = {};
    }

    const tokens = await Token.find(query).sort({ added_at: -1 }).lean();

    // Count tokens with missing data
    const missingPriceCount = tokens.filter(
      (t) => t.processed && (!t.marketData || !t.marketData.price)
    ).length;

    const missingMarketCapCount = tokens.filter(
      (t) => t.processed && (!t.marketData || !t.marketData.market_cap)
    ).length;

    return NextResponse.json({
      success: true,
      tokens,
      stats: {
        total: tokens.length,
        processed: tokens.filter((t) => t.processed).length,
        unprocessed: tokens.filter((t) => !t.processed).length,
        missingPrice: missingPriceCount,
        missingMarketCap: missingMarketCapCount,
      },
    });
  } catch (error) {
    console.error("Error fetching token data:", error);
    return NextResponse.json(
      { error: "Failed to fetch token data" },
      { status: 500 }
    );
  }
}
