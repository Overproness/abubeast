import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import { calculateAndUpdateTradingStats } from '@/lib/services/tradingStatsService';

export async function POST(request) {
    try {
        const { email, otp } = await request.json();

        // Validate input
        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        // Connect to database
        await dbConnect();

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if OTP exists
        if (!user.current_otp || !user.otp_created_at) {
            return NextResponse.json(
                { error: 'No OTP found for this user. Please request a new one.' },
                { status: 400 }
            );
        }

        // Check if OTP has expired (5 minutes)
        const otpAge = Date.now() - new Date(user.otp_created_at).getTime();
        const fiveMinutes = 5 * 60 * 1000;

        if (otpAge > fiveMinutes) {
            // Remove expired OTP
            await User.findByIdAndUpdate(user._id, {
                current_otp: null,
                otp_created_at: null
            });

            return NextResponse.json(
                { error: 'OTP has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Verify OTP
        if (user.current_otp !== otp) {
            return NextResponse.json(
                { error: 'Invalid OTP. Please try again.' },
                { status: 400 }
            );
        }

        // OTP is valid - remove it from user (one-time use)
        await User.findByIdAndUpdate(user._id, {
            current_otp: null,
            otp_created_at: null
        });

        // Generate JWT token for authentication
        const jwt = await import("jsonwebtoken");
        const token = jwt.default.sign(
            {
                userId: user._id,
                email: user.email,
                name: user.name,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Calculate and update trading statistics after successful login
        try {
            await calculateAndUpdateTradingStats(user._id);
            console.log(`[Auth] Trading stats updated for user: ${user.email}`);
        } catch (error) {
            console.error(`[Auth] Failed to update trading stats for user ${user.email}:`, error);
            // Don't fail the login if stats update fails
        }

        // Create response
        const response = NextResponse.json(
            {
                message: 'OTP verified successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                }
            },
            { status: 200 }
        );

        // Set HTTP-only cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;

    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json(
            { error: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}
