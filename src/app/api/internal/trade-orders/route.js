import dbConnect from "@/lib/db/mongodb";
import TradeOrder from "@/models/TradeOrder";
import TradingPermission from "@/models/TradingPermission";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (
      !data.userId ||
      !data.walletAddress ||
      !data.tokenAddress ||
      !data.orderType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if trading permission exists
    const permission = await TradingPermission.findOne({
      userId: data.userId,
      walletAddress: data.walletAddress.toLowerCase(),
      active: true,
    });

    if (!permission) {
      return NextResponse.json(
        { error: "No active trading permission found" },
        { status: 404 }
      );
    }

    // Create new order
    const order = new TradeOrder({
      userId: data.userId,
      walletAddress: data.walletAddress.toLowerCase(),
      tokenAddress: data.tokenAddress,
      orderType: data.orderType, // "stop_loss" or "take_profit"
      targetPrice: data.targetPrice,
      amount: data.amount,
      triggerCondition: data.triggerCondition || "<=", // "<=" for stop-loss, ">=" for take-profit
      status: "active",
      expiresAt: data.expiresAt || null,
      chainId: data.chainId,
      createdAt: new Date(),
    });

    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error creating trade order:", error);
    return NextResponse.json(
      { error: "Failed to create trade order" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const walletAddress = searchParams.get("wallet");
    const status = searchParams.get("status") || "active";

    if (!userId && !walletAddress) {
      return NextResponse.json(
        { error: "User ID or wallet address required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Build query
    const query = { status };
    if (userId) query.userId = userId;
    if (walletAddress) query.walletAddress = walletAddress.toLowerCase();

    // Get active orders
    const orders = await TradeOrder.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching trade orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade orders" },
      { status: 500 }
    );
  }
}

// PUT endpoint to update order status
export async function PUT(request) {
  try {
    // Verify internal API key
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.orderId || !data.status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await TradeOrder.findById(data.orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update status and executed details if provided
    order.status = data.status;
    if (data.executedPrice) order.executedPrice = data.executedPrice;
    if (data.executedAt) order.executedAt = data.executedAt;
    if (data.txHash) order.txHash = data.txHash;

    await order.save();

    return NextResponse.json({
      success: true,
      order: order.toObject(),
    });
  } catch (error) {
    console.error("Error updating trade order:", error);
    return NextResponse.json(
      { error: "Failed to update trade order" },
      { status: 500 }
    );
  }
}
