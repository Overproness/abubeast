#!/usr/bin/env node

/**
 * Database Inspection Script for AbuBeast
 *
 * This script connects to your MongoDB database and provides a comprehensive
 * overview of all collections, their document counts, and sample data.
 *
 * Usage: npm run db:inspect
 */

const { readFileSync } = require("fs");
const { join } = require("path");

// Load environment variables from .env.local
const envPath = join(__dirname, "..", ".env.local");

try {
  const envFile = readFileSync(envPath, "utf8");
  const envVars = envFile.split("\n");

  envVars.forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  console.warn("Could not load .env.local file:", error.message);
}

const mongoose = require("mongoose");
const dbConnect = require("./db-connect-wrapper.js");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) =>
    console.log(
      `\n${colors.bright}${colors.cyan}=== ${msg} ===${colors.reset}`
    ),
  subheader: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`),
};

async function inspectDatabase() {
  try {
    log.header("AbuBeast Database Inspector");
    log.info("Connecting to MongoDB...");

    // Connect to database
    await dbConnect();
    log.success("Connected to MongoDB successfully");

    const db = mongoose.connection.db;

    // Get database stats
    const dbStats = await db.stats();
    log.subheader("Database Overview");
    log.data(`Database Name: ${db.databaseName}`);
    log.data(
      `Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`
    );
    log.data(`Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    log.data(`Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    log.data(`Collections: ${dbStats.collections}`);

    // Get all collections
    const collections = await db.listCollections().toArray();
    log.subheader("Collections Analysis");

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);

      try {
        // Get collection stats - use correct MongoDB method
        const stats = await db.command({ collStats: collectionName });
        const count = await collection.countDocuments();

        log.info(`Collection: ${collectionName}`);
        log.data(`  Documents: ${count.toLocaleString()}`);
        log.data(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
        log.data(
          `  Average Document Size: ${
            stats.avgObjSize ? stats.avgObjSize.toFixed(2) + " bytes" : "N/A"
          }`
        );

        // Show indexes
        const indexes = await collection.indexes();
        if (indexes.length > 1) {
          // More than just the default _id index
          log.data(`  Indexes: ${indexes.map((idx) => idx.name).join(", ")}`);
        }

        // Show sample documents (first 3)
        if (count > 0) {
          const samples = await collection.find({}).limit(3).toArray();
          log.data(`  Sample Documents:`);

          samples.forEach((doc, index) => {
            const docCopy = { ...doc };
            // Hide sensitive fields
            if (docCopy.password) docCopy.password = "[HIDDEN]";
            if (docCopy.hashedPassword) docCopy.hashedPassword = "[HIDDEN]";

            log.data(
              `    ${index + 1}. ${JSON.stringify(docCopy, null, 2)
                .split("\n")
                .map((line) => "       " + line)
                .join("\n")
                .trim()}`
            );
          });
        }

        console.log(""); // Add spacing between collections
      } catch (error) {
        log.warning(
          `Could not get stats for collection ${collectionName}: ${error.message}`
        );
      }
    }

    // Model-specific analysis
    log.subheader("Model-Specific Analysis");

    // Users analysis
    try {
      const User = mongoose.model("User");
      const totalUsers = await User.countDocuments();
      const usersWithWallets = await User.countDocuments({
        "wallets.0": { $exists: true },
      });
      const recentUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });

      log.info("Users:");
      log.data(`  Total: ${totalUsers}`);
      log.data(`  With Wallets: ${usersWithWallets}`);
      log.data(`  Recent (7 days): ${recentUsers}`);
    } catch (error) {
      log.warning(`Could not analyze Users: ${error.message}`);
    }

    // Tokens analysis
    try {
      const Token = mongoose.model("Token");
      const totalTokens = await Token.countDocuments();
      const analyzedTokens = await Token.countDocuments({ analyzed: true });
      const processedTokens = await Token.countDocuments({ processed: true });

      log.info("Tokens:");
      log.data(`  Total: ${totalTokens}`);
      log.data(`  Analyzed: ${analyzedTokens}`);
      log.data(`  Processed: ${processedTokens}`);
    } catch (error) {
      log.warning(`Could not analyze Tokens: ${error.message}`);
    }

    // Trade Orders analysis
    try {
      const TradeOrder = mongoose.model("TradeOrder");
      const totalOrders = await TradeOrder.countDocuments();
      const activeOrders = await TradeOrder.countDocuments({
        status: "active",
      });
      const executedOrders = await TradeOrder.countDocuments({
        status: "executed",
      });

      log.info("Trade Orders:");
      log.data(`  Total: ${totalOrders}`);
      log.data(`  Active: ${activeOrders}`);
      log.data(`  Executed: ${executedOrders}`);
    } catch (error) {
      log.warning(`Could not analyze Trade Orders: ${error.message}`);
    }

    // Connection health check
    log.subheader("Connection Health");
    const connectionState = mongoose.connection.readyState;
    const stateNames = [
      "disconnected",
      "connected",
      "connecting",
      "disconnecting",
    ];
    log.data(`Connection State: ${stateNames[connectionState] || "unknown"}`);
    log.data(`Host: ${mongoose.connection.host}`);
    log.data(`Port: ${mongoose.connection.port}`);
    log.data(`Database: ${mongoose.connection.name}`);

    log.success("Database inspection completed successfully");
  } catch (error) {
    log.error(`Database inspection failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    log.info("Database connection closed");
    process.exit(0);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  log.error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});

// Run the inspection
inspectDatabase();
