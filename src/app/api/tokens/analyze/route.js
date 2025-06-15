export const runtime = "nodejs"; // 'edge' is the default
import { verifyToken } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongodb";
import { analyzeAndTradeNewTokens } from "@/lib/services/tokenAnalyzerService";
import Token from "@/models/Token";
import { NextResponse } from "next/server";

// POST endpoint to trigger token analysis and trading
export async function POST(request) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData || !tokenData.userId || !tokenData.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get tokens that haven't been analyzed yet
    const unanalyzedTokens = await Token.find({ analyzed: { $ne: true } })
      .sort({ added_at: -1 })
      .limit(50)
      .lean();

    if (unanalyzedTokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new tokens to analyze",
        processedCount: 0,
      });
    }

    console.log(`Analyzing ${unanalyzedTokens.length} new tokens`);

    // Analyze tokens and execute trades
    await analyzeAndTradeNewTokens(unanalyzedTokens);

    // Mark tokens as analyzed
    await Promise.all(
      unanalyzedTokens.map(async (token) => {
        await Token.findOneAndUpdate(
          { _id: token._id },
          { analyzed: true, analyzed_at: new Date() }
        );
      })
    );

    return NextResponse.json({
      success: true,
      message: `Analyzed ${unanalyzedTokens.length} tokens`,
      processedCount: unanalyzedTokens.length,
    });
  } catch (error) {
    console.error("Error analyzing tokens:", error);
    return NextResponse.json(
      { error: "Failed to analyze tokens" },
      { status: 500 }
    );
  }
}

// GET endpoint to get analysis statistics
export async function GET() {
  try {
    await dbConnect();

    const totalTokens = await Token.countDocuments({});
    const analyzedTokens = await Token.countDocuments({ analyzed: true });

    // Get tokens with their analysis status
    const recentTokens = await Token.find({})
      .sort({ added_at: -1 })
      .limit(100)
      .select("mint_address name symbol analyzed analyzed_at added_at")
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        total: totalTokens,
        analyzed: analyzedTokens,
        pending: totalTokens - analyzedTokens,
        recentTokens,
      },
    });
  } catch (error) {
    console.error("Error fetching analysis stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis statistics" },
      { status: 500 }
    );
  }
}
