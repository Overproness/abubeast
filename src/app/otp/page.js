"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function OTPPageContent() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailLoaded, setEmailLoaded] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP, isAuthenticated } = useAuth();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    console.log("Email param from URL:", emailParam);

    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      console.log("Decoded email:", decodedEmail);
      setEmail(decodedEmail);
      setEmailLoaded(true);
    } else {
      console.log("No email parameter found, redirecting to login");
      setTimeout(() => {
        router.push("/auth/login");
      }, 100);
    }
  }, [searchParams, router]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Don't render the form until we've loaded the email
  if (!emailLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await verifyOTP(email, otp);

      if (!result.success) {
        throw new Error(result.error || "OTP verification failed");
      }

      console.log("OTP verified successfully, redirecting to dashboard");
      // Redirect to dashboard after successful verification
      router.push("/dashboard");
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setError("");
      alert("OTP sent successfully!");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification code to
          </p>
          <p className="text-center text-sm font-medium text-blue-600 dark:text-blue-400 break-all">
            {email}
          </p>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit code below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-lg font-mono tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setOtp(value);
              }}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading || otp.length !== 6
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-blue-500 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : null}
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{" "}
              <button
                type="button"
                disabled={resendLoading}
                onClick={handleResendOTP}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend"}
              </button>
            </p>
            <p className="mt-2 text-sm">
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Back to login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OTPPageContent />
    </Suspense>
  );
}
