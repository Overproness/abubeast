import dbConnect from "@/lib/db/mongodb";
import tokenApiService from "@/lib/services/tokenApiService";
import goPlusSecurityService from "@/lib/services/goPlusSecurityService";
import Token from "@/models/Token";
import { NextResponse } from "next/server";

// Fetch token data and security analysis using unified services
async function fetchTokenData(address) {
  try {
    console.log(
      `[Enrichment] Fetching data for token ${address} using unified API service`
    );

    const apiResult = await tokenApiService.getTokenData(address);

    if (apiResult?.data) {
      console.log(
        `[Enrichment] Successfully fetched data for ${address} from ${
          apiResult.provider
        }. Has price: ${!!apiResult.data.price}, Has market cap: ${!!apiResult
          .data.market_cap}`
      );
      return apiResult.data;
    } else {
      console.log(
        `[Enrichment] Data received for ${address} but missing expected fields:`,
        JSON.stringify(apiResult).substring(0, 200) + "..."
      );
      return null;
    }
  } catch (error) {
    console.error(
      `[Enrichment] Error fetching data for ${address}:`,
      error.message
    );
    return null;
  }
}

// Fetch security analysis for a token
async function fetchTokenSecurity(address) {
  try {
    console.log(`[Enrichment] Fetching security analysis for token ${address}`);
    
    const securityAnalysis = await goPlusSecurityService.analyzeTokenSecurity(address);
    
    if (securityAnalysis) {
      console.log(
        `[Enrichment] Security analysis complete for ${address}: Risk Level = ${securityAnalysis.overall_risk_level}, Tradeable = ${securityAnalysis.is_tradeable}`
      );
      return securityAnalysis;
    } else {
      console.log(`[Enrichment] No security data available for ${address}`);
      return null;
    }
  } catch (error) {
    console.error(
      `[Enrichment] Error fetching security analysis for ${address}:`,
      error.message
    );
    return null;
  }
}

// Fetch multiple tokens data with security analysis
async function fetchMultiTokenData(addresses) {
  if (addresses.length === 0) return {};

  try {
    console.log(
      `[Enrichment] Fetching batch data for ${addresses.length} tokens using unified API service`
    );

    const results = {};

    for (const address of addresses) {
      try {
        // Fetch market data
        const marketData = await fetchTokenData(address);
        
        // Fetch security analysis
        const securityData = await fetchTokenSecurity(address);
        
        if (marketData || securityData) {
          results[address] = {
            marketData,
            securityData
          };
        }
      } catch (error) {
        console.warn(
          `[Enrichment] Failed to fetch data for ${address}:`,
          error.message
        );
      }
    }

    return results;
  } catch (error) {
    console.warn(`[Enrichment] Failed to fetch batch data:`, error.message);
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
        const { marketData: tokenData, securityData } = tokenDataMap[token.mint_address];
        
        // Prepare update object
        const updateData = {
          processed: true,
          last_updated: new Date().toISOString(),
        };
        
        // Add market data if available
        if (tokenData) {
          updateData.marketData = tokenData;
          
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
        }
        
        // Add security data if available
        if (securityData) {
          updateData.securityData = securityData;
          console.log(
            `[Enrichment] Security data added for ${token.mint_address}: Risk=${securityData.overall_risk_level}, Red Flags=${securityData.red_flags?.length || 0}`
          );
        }
        
        // Set processing notes
        const hasPrice = tokenData?.price;
        const hasMarketCap = tokenData?.market_cap;
        const hasSecurity = !!securityData;
        
        if (hasPrice && hasMarketCap && hasSecurity) {
          updateData.processingNotes = "Fully processed with security analysis";
        } else if (hasPrice && hasMarketCap) {
          updateData.processingNotes = "Market data processed, security analysis pending";
        } else if (hasSecurity) {
          updateData.processingNotes = "Security analysis completed, market data partial/missing";
        } else {
          updateData.processingNotes = `Partially processed: Has price=${!!hasPrice}, Has marketCap=${!!hasMarketCap}, Has security=${hasSecurity}`;
        }

        await Token.findOneAndUpdate(
          { mint_address: token.mint_address },
          updateData
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
        // Try to fetch market data and security analysis individually
        const tokenData = await fetchTokenData(token.mint_address);
        const securityData = await fetchTokenSecurity(token.mint_address);
        
        if (tokenData || securityData) {
          // Prepare update object
          const updateData = {
            processed: true,
            last_updated: new Date().toISOString(),
          };
          
          // Add market data if available
          if (tokenData) {
            updateData.marketData = tokenData;
            
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
          }
          
          // Add security data if available
          if (securityData) {
            updateData.securityData = securityData;
            console.log(
              `[Enrichment] Security data added for ${token.mint_address}: Risk=${securityData.overall_risk_level}`
            );
          }
          
          // Set processing notes
          const hasPrice = tokenData?.price;
          const hasMarketCap = tokenData?.market_cap;
          const hasSecurity = !!securityData;
          
          if (hasPrice && hasMarketCap && hasSecurity) {
            updateData.processingNotes = "Fully processed with security analysis";
          } else if (hasPrice && hasMarketCap) {
            updateData.processingNotes = "Market data processed, security analysis failed";
          } else if (hasSecurity) {
            updateData.processingNotes = "Security analysis completed, market data missing";
          } else {
            updateData.processingNotes = `Partially processed: Has price=${!!hasPrice}, Has marketCap=${!!hasMarketCap}, Has security=${hasSecurity}`;
          }

          await Token.findOneAndUpdate(
            { mint_address: token.mint_address },
            updateData
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
                "Marked as processed but no data was retrieved from APIs",
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

    const missingSecurityCount = tokens.filter(
      (t) => t.processed && (!t.securityData || !t.securityData.has_security_data)
    ).length;

    const highRiskTokens = tokens.filter(
      (t) => t.securityData && t.securityData.overall_risk_level === 'high'
    ).length;

    const untradeableTokens = tokens.filter(
      (t) => t.securityData && t.securityData.is_tradeable === false
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
        missingSecurity: missingSecurityCount,
        highRiskTokens,
        untradeableTokens,
        securityCoverage: `${((tokens.length - missingSecurityCount) / Math.max(tokens.length, 1) * 100).toFixed(1)}%`
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
