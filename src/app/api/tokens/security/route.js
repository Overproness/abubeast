import dbConnect from "@/lib/db/mongodb";
import goPlusSecurityService from "@/lib/services/goPlusSecurityService";
import Token from "@/models/Token";
import { NextResponse } from "next/server";

// POST endpoint to run security analysis on specific tokens
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { addresses, forceRefresh = false } = body;
    
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: "Please provide an array of token addresses" },
        { status: 400 }
      );
    }
    
    console.log(`[Security] Running security analysis for ${addresses.length} tokens`);
    
    const results = [];
    let updatedCount = 0;
    
    for (const address of addresses) {
      try {
        // Check if token exists in database
        const existingToken = await Token.findOne({ mint_address: address });
        
        if (!existingToken) {
          console.warn(`[Security] Token ${address} not found in database`);
          results.push({
            address,
            success: false,
            error: "Token not found in database"
          });
          continue;
        }
        
        // Check if we should skip analysis (already has recent security data)
        const hasRecentSecurity = existingToken.securityData?.last_security_check && 
          !forceRefresh &&
          (new Date() - new Date(existingToken.securityData.last_security_check)) < 24 * 60 * 60 * 1000; // 24 hours
        
        if (hasRecentSecurity) {
          console.log(`[Security] Skipping ${address} - has recent security data`);
          results.push({
            address,
            success: true,
            skipped: true,
            reason: "Recent security data exists"
          });
          continue;
        }
        
        // Run security analysis
        const securityAnalysis = await goPlusSecurityService.analyzeTokenSecurity(address);
        
        if (securityAnalysis) {
          // Update token with security data
          await Token.findOneAndUpdate(
            { mint_address: address },
            {
              securityData: securityAnalysis,
              last_updated: new Date().toISOString()
            }
          );
          
          updatedCount++;
          
          results.push({
            address,
            success: true,
            riskLevel: securityAnalysis.overall_risk_level,
            riskScore: securityAnalysis.overall_risk_score,
            isTradeable: securityAnalysis.is_tradeable,
            redFlags: securityAnalysis.red_flags?.length || 0
          });
          
          console.log(`[Security] Updated ${address}: Risk=${securityAnalysis.overall_risk_level}`);
        } else {
          results.push({
            address,
            success: false,
            error: "Security analysis failed"
          });
        }
        
      } catch (error) {
        console.error(`[Security] Error analyzing ${address}:`, error.message);
        results.push({
          address,
          success: false,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Security analysis completed. Updated ${updatedCount} tokens.`,
      updatedCount,
      totalRequested: addresses.length,
      results
    });
    
  } catch (error) {
    console.error("Error in security analysis:", error);
    return NextResponse.json(
      { error: "Failed to run security analysis" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve security information for tokens
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const riskLevel = searchParams.get("riskLevel");
    const showUntradeable = searchParams.get("untradeable") === "true";
    const showHighRisk = searchParams.get("highRisk") === "true";
    
    let query = {};
    
    // Filter by specific address
    if (address) {
      query.mint_address = address;
    }
    
    // Filter by risk level
    if (riskLevel) {
      query["securityData.overall_risk_level"] = riskLevel;
    }
    
    // Show only untradeable tokens
    if (showUntradeable) {
      query["securityData.is_tradeable"] = false;
    }
    
    // Show only high risk tokens
    if (showHighRisk) {
      query["securityData.overall_risk_level"] = "high";
    }
    
    const tokens = await Token.find(query)
      .select('mint_address name symbol securityData marketData processed')
      .sort({ 'securityData.overall_risk_score': -1 })
      .lean();
    
    // Calculate security statistics
    const totalTokens = await Token.countDocuments();
    const tokensWithSecurity = await Token.countDocuments({
      "securityData.has_security_data": true
    });
    
    const riskLevelCounts = await Token.aggregate([
      { $match: { "securityData.overall_risk_level": { $exists: true } } },
      { $group: { _id: "$securityData.overall_risk_level", count: { $sum: 1 } } }
    ]);
    
    const untradeableCount = await Token.countDocuments({
      "securityData.is_tradeable": false
    });
    
    return NextResponse.json({
      success: true,
      tokens,
      security_stats: {
        total_tokens: totalTokens,
        tokens_with_security: tokensWithSecurity,
        security_coverage: `${((tokensWithSecurity / Math.max(totalTokens, 1)) * 100).toFixed(1)}%`,
        risk_levels: riskLevelCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        untradeable_tokens: untradeableCount
      }
    });
    
  } catch (error) {
    console.error("Error fetching security data:", error);
    return NextResponse.json(
      { error: "Failed to fetch security data" },
      { status: 500 }
    );
  }
}

// PUT endpoint to refresh security data for all tokens or specific ones
export async function PUT(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { refreshAll = false, olderThanDays = 7 } = body;
    
    let query = {};
    
    if (refreshAll) {
      // Refresh all tokens
      query = { processed: true };
    } else {
      // Refresh tokens with old or missing security data
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      query = {
        processed: true,
        $or: [
          { "securityData.last_security_check": { $exists: false } },
          { "securityData.last_security_check": { $lt: cutoffDate } },
          { "securityData.has_security_data": false }
        ]
      };
    }
    
    const tokensToUpdate = await Token.find(query).select('mint_address').lean();
    
    if (tokensToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No tokens need security refresh",
        updatedCount: 0
      });
    }
    
    console.log(`[Security] Refreshing security data for ${tokensToUpdate.length} tokens`);
    
    let updatedCount = 0;
    const addresses = tokensToUpdate.map(t => t.mint_address);
    
    // Process in batches of 10 to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      
      for (const address of batch) {
        try {
          const securityAnalysis = await goPlusSecurityService.analyzeTokenSecurity(address);
          
          if (securityAnalysis) {
            await Token.findOneAndUpdate(
              { mint_address: address },
              {
                securityData: securityAnalysis,
                last_updated: new Date().toISOString()
              }
            );
            updatedCount++;
          }
          
          // Small delay between requests to be respectful to the API
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`[Security] Failed to refresh ${address}:`, error.message);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Security refresh completed. Updated ${updatedCount} of ${tokensToUpdate.length} tokens.`,
      updatedCount,
      totalRequested: tokensToUpdate.length
    });
    
  } catch (error) {
    console.error("Error refreshing security data:", error);
    return NextResponse.json(
      { error: "Failed to refresh security data" },
      { status: 500 }
    );
  }
}
