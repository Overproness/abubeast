import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import SessionKey from "@/models/session-key";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const sessionKeys = await SessionKey.find({ userId: authUser.userId })
      .sort({ createdAt: -1 })
      .select("-encryptedData -iv -authTag -signature")
      .lean();

    return NextResponse.json({ sessionKeys });
  } catch (error) {
    console.error("Session keys fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
