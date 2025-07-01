#!/usr/bin/env node

/**
 * Quick Database Status Script for AbuBeast
 *
 * This script provides a quick overview of your database status
 * without detailed document samples.
 *
 * Usage: npm run db:status
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

async function quickStatus() {
  try {
    console.log("🔍 Checking database status...\n");

    // Connect to database
    await dbConnect();
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Get basic stats
    const collections = await db.listCollections().toArray();
    console.log(`📊 Database: ${db.databaseName}`);
    console.log(`📁 Collections: ${collections.length}`);

    // Quick collection counts
    console.log("\n📈 Document Counts:");
    for (const collectionInfo of collections) {
      const collection = db.collection(collectionInfo.name);
      const count = await collection.countDocuments();
      console.log(`  ${collectionInfo.name}: ${count.toLocaleString()}`);
    }

    // Connection info
    console.log(
      `\n🔗 Connected to: ${mongoose.connection.host}:${mongoose.connection.port}`
    );
    console.log("✅ Database is healthy");
  } catch (error) {
    console.error("❌ Database check failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔚 Connection closed");
    process.exit(0);
  }
}

quickStatus();
