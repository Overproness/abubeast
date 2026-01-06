"use client";

import { useState } from "react";

export default function AuthDebugPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      setResult({
        status: response.status,
        ok: response.ok,
        data,
      });
    } catch (error) {
      setResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testOTP = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setResult({
        status: response.status,
        ok: response.ok,
        data,
      });
    } catch (error) {
      setResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testDB = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-db");
      const data = await response.json();

      setResult({
        status: response.status,
        ok: response.ok,
        data,
      });
    } catch (error) {
      setResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Authentication Debug Panel
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Credentials
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="test@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="password123"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Endpoints
          </h2>

          <div className="space-y-3">
            <button
              onClick={testDB}
              disabled={loading}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition"
            >
              Test Database Connection
            </button>

            <button
              onClick={testLogin}
              disabled={loading || !email || !password}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition"
            >
              Test Login API
            </button>

            <button
              onClick={testOTP}
              disabled={loading || !email}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition"
            >
              Test Send OTP API
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Result
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
            Common Issues & Solutions
          </h3>
          <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
            <li>
              <strong>401 Unauthorized:</strong> User doesn't exist or password
              is wrong. Make sure you've signed up first.
            </li>
            <li>
              <strong>404 Not Found:</strong> Check if the API route exists and
              the server is running.
            </li>
            <li>
              <strong>500 Internal Server Error:</strong> Check database
              connection or environment variables.
            </li>
            <li>
              <strong>OTP fails to send:</strong> Verify EMAIL_USER and
              EMAIL_PASS are set in .env.local
            </li>
          </ul>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
            Quick Setup Checklist
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>
              Create <code>.env.local</code> file in project root (copy from
              .env.example)
            </li>
            <li>Set MONGODB_URI to your MongoDB connection string</li>
            <li>Set JWT_SECRET (run: openssl rand -base64 32)</li>
            <li>
              Set EMAIL_USER and EMAIL_PASS for OTP (use Gmail App Password)
            </li>
            <li>Sign up for an account first at /auth/signup</li>
            <li>Then try logging in with those credentials</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
