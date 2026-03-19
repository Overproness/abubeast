/**
 * Session Key Testing Utilities
 * Use these functions to test the session key system
 */

import { Connection } from "@solana/web3.js";

/**
 * Test session key generation (frontend)
 */
export async function testGenerateSessionKey(walletAddress) {
  console.log("🧪 Testing session key generation...");

  try {
    const response = await fetch("/api/session-keys/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        walletAddress,
        expirationHours: 1, // Short expiration for testing
        name: "Test Session",
        description: "Testing session key system",
        permissions: {
          canTrade: true,
          canSwap: true,
          canStake: false,
          canTransfer: false,
          maxTransactionAmount: 10, // Low limit for testing
          dailySpendingLimit: 50,
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Session key generated successfully");
      console.log("Public Key:", data.sessionKey.publicKey);
      console.log("Expires:", data.sessionKey.expiresAt);
      return { success: true, data };
    } else {
      console.error("❌ Failed to generate session key:", data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Test session key listing
 */
export async function testListSessionKeys(walletAddress = null) {
  console.log("🧪 Testing session key listing...");

  try {
    const params = walletAddress ? `?walletAddress=${walletAddress}` : "";
    const response = await fetch(`/api/session-keys/list${params}`, {
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Retrieved session keys");
      console.log(`Found ${data.sessionKeys.length} session keys`);
      data.sessionKeys.forEach((key, index) => {
        console.log(`\n[${index + 1}] ${key.name}`);
        console.log(`  - Public Key: ${key.publicKey}`);
        console.log(`  - Active: ${key.active}`);
        console.log(`  - Expires: ${new Date(key.expiresAt).toLocaleString()}`);
        console.log(
          `  - Permissions: ${Object.entries(key.permissions)
            .filter(([k, v]) => typeof v === "boolean" && v)
            .map(([k]) => k)
            .join(", ")}`
        );
      });
      return { success: true, data: data.sessionKeys };
    } else {
      console.error("❌ Failed to list session keys:", data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Test session key revocation
 */
export async function testRevokeSessionKey(sessionKeyId) {
  console.log("🧪 Testing session key revocation...");

  try {
    const response = await fetch("/api/session-keys/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ sessionKeyId }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Session key revoked successfully");
      return { success: true, data };
    } else {
      console.error("❌ Failed to revoke session key:", data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Test trading status check
 */
export async function testTradingStatus(walletAddress) {
  console.log("🧪 Testing trading status check...");

  try {
    const response = await fetch(
      `/api/trading/execute?walletAddress=${walletAddress}`,
      {
        credentials: "include",
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Trading status retrieved");
      console.log("Can Trade:", data.canTrade);
      if (data.sessionKey) {
        console.log("Session Key Status:", {
          isValid: data.sessionKey.isValid,
          expiresAt: data.sessionKey.expiresAt,
          remainingDailyLimit: data.sessionKey.remainingDailyLimit,
          permissions: data.sessionKey.permissions,
        });
      }
      return { success: true, data };
    } else {
      console.error("❌ Failed to get trading status:", data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify Solana connection
 */
export async function testSolanaConnection() {
  console.log("🧪 Testing Solana connection...");

  try {
    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    const version = await connection.getVersion();
    const slot = await connection.getSlot();

    console.log("✅ Solana connection successful");
    console.log("RPC URL:", rpcUrl);
    console.log("Version:", version);
    console.log("Current Slot:", slot);

    return { success: true, data: { version, slot } };
  } catch (error) {
    console.error("❌ Solana connection failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Run all tests
 */
export async function runAllTests(walletAddress) {
  console.log("🚀 Running all session key tests...\n");

  const results = {
    solanaConnection: await testSolanaConnection(),
    tradingStatus: await testTradingStatus(walletAddress),
    listKeys: await testListSessionKeys(walletAddress),
  };

  console.log("\n📊 Test Results Summary:");
  console.log("========================");
  console.log(
    "Solana Connection:",
    results.solanaConnection.success ? "✅" : "❌"
  );
  console.log("Trading Status:", results.tradingStatus.success ? "✅" : "❌");
  console.log("List Session Keys:", results.listKeys.success ? "✅" : "❌");

  const allPassed = Object.values(results).every((r) => r.success);
  console.log(
    "\nOverall:",
    allPassed ? "✅ All tests passed!" : "❌ Some tests failed"
  );

  return results;
}

/**
 * Browser console helper
 * Usage in browser console:
 *
 * // Import the test utilities
 * const tests = await import('/path/to/this/file');
 *
 * // Run all tests
 * await tests.runAllTests('YOUR_WALLET_ADDRESS');
 *
 * // Or run individual tests
 * await tests.testGenerateSessionKey('YOUR_WALLET_ADDRESS');
 * await tests.testListSessionKeys();
 */

// Export for use in browser console
if (typeof window !== "undefined") {
  window.sessionKeyTests = {
    testGenerateSessionKey,
    testListSessionKeys,
    testRevokeSessionKey,
    testTradingStatus,
    testSolanaConnection,
    runAllTests,
  };
  console.log("✅ Session key test utilities loaded!");
  console.log("Use: sessionKeyTests.runAllTests('YOUR_WALLET_ADDRESS')");
}
