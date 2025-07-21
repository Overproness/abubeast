import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const updateData = await request.json();

        await dbConnect();

        // Find and update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    bio: updateData.bio || "",
                    location: updateData.location || "",
                    website: updateData.website || "",
                    twitter: updateData.twitter || "",
                    telegram: updateData.telegram || "",
                    notifications: updateData.notifications || {
                        email: true,
                        trades: true,
                        security: true,
                        newsletter: false,
                    },
                },
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: updatedUser.bio,
                location: updatedUser.location,
                website: updatedUser.website,
                twitter: updatedUser.twitter,
                telegram: updatedUser.telegram,
                notifications: updatedUser.notifications,
            },
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
