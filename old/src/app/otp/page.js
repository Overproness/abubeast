"use client";

import { Button } from "@/components/ui/button";
import { GlassCard, GradientOrb, GradientText } from "@/components/ui/glass";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  RefreshCw,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function OTPPageContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [emailLoaded, setEmailLoaded] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP, isAuthenticated, resendOTP } = useAuth();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      setEmail(decodedEmail);
      setEmailLoaded(true);
    } else {
      setTimeout(() => router.push("/auth/login"), 100);
    }
  }, [searchParams, router]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
      setOtp(newOtp);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await verifyOTP(email, otpString);
      if (!result.success) {
        throw new Error(result.error || "OTP verification failed");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError("");

    try {
      if (resendOTP) {
        await resendOTP(email);
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!emailLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <GradientOrb
          color="blue"
          className="w-[400px] h-[400px] top-0 right-0 opacity-20"
        />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <GradientOrb
        color="blue"
        className="w-[400px] h-[400px] top-0 right-0 opacity-20"
      />
      <GradientOrb
        color="violet"
        className="w-[300px] h-[300px] bottom-0 left-0 opacity-20"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              <GradientText>Verify Your Email</GradientText>
            </h1>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to
            </p>
            <p className="font-medium text-primary mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl glass-input bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-error text-sm justify-center">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <Check className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-2"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : resendSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Code sent!
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend code
                </>
              )}
            </button>
          </div>
        </GlassCard>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            This code will expire in 10 minutes for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OTPPageContent />
    </Suspense>
  );
}
