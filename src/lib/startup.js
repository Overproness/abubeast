/**
 * Application Startup Script
 * Initializes all services when the backend starts
 */

import {
  initializeServices,
  shutdownServices,
} from "./services/serviceManager";

let initialized = false;

/**
 * Initialize application on startup
 */
export async function initializeApp() {
  if (initialized) {
    console.log("[Startup] Application already initialized");
    return;
  }

  console.log("\n" + "=".repeat(60));
  console.log("🚀 Starting AbuBeast Trading Platform");
  console.log("=".repeat(60) + "\n");

  try {
    // Initialize all background services
    console.log("[Startup] Initializing background services...");
    await initializeServices();

    initialized = true;

    console.log("\n" + "=".repeat(60));
    console.log("✅ AbuBeast Trading Platform is ready!");
    console.log("=".repeat(60));
    console.log("\n📊 Services running:");
    console.log("  - Backend API");
    console.log("  - Trading Bot Engine");
    console.log("  - Token Monitoring");
    console.log("  - Position Monitoring");
    console.log("  - Auto-Sell Engine");
    console.log("\n🌐 Access at: http://localhost:3000");
    console.log("📚 Documentation: Check INTEGRATION_COMPLETE.md");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ Failed to initialize application");
    console.error("=".repeat(60));
    console.error("\nError:", error.message);
    console.error("\nStack:", error.stack);
    console.error("\n" + "=".repeat(60) + "\n");

    // Don't throw - allow app to start even if services fail
    // Services can be manually restarted via API
    console.warn("⚠️  Application started with service errors");
    console.warn("⚠️  Some features may not work until services are running");
    console.warn("⚠️  Check logs and use /api/services/restart to recover\n");
  }
}

/**
 * Cleanup on application shutdown
 */
export async function cleanupApp() {
  if (!initialized) {
    return;
  }

  console.log("\n" + "=".repeat(60));
  console.log("🛑 Shutting down AbuBeast Trading Platform");
  console.log("=".repeat(60) + "\n");

  try {
    await shutdownServices();
    initialized = false;

    console.log("\n" + "=".repeat(60));
    console.log("✅ Shutdown complete");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("[Cleanup] Error during shutdown:", error);
  }
}

// Handle process termination signals
if (typeof process !== "undefined") {
  process.on("SIGINT", async () => {
    console.log("\n\nReceived SIGINT (Ctrl+C)");
    await cleanupApp();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\n\nReceived SIGTERM");
    await cleanupApp();
    process.exit(0);
  });

  process.on("uncaughtException", (error) => {
    console.error("[Fatal] Uncaught Exception:", error);
    cleanupApp().then(() => process.exit(1));
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error(
      "[Fatal] Unhandled Rejection at:",
      promise,
      "reason:",
      reason
    );
  });
}
