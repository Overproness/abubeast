// LaserStream gRPC Client - JavaScript Port (OPTIONAL)
// Port of laserstream_client.rs
// This module requires @grpc/grpc-js and grpc protocol buffer definitions

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");
const path = require("path");

/**
 * LaserStream gRPC Client for real-time Solana blockchain streaming
 *
 * IMPORTANT: This is an optional advanced feature that requires:
 * 1. @grpc/grpc-js package
 * 2. @grpc/proto-loader package
 * 3. LaserStream API key and endpoint
 * 4. Protocol buffer definitions for LaserStream
 *
 * To enable this feature:
 * npm install @grpc/grpc-js @grpc/proto-loader
 *
 * Configure in .env:
 * LASERSTREAM_API_KEY=your_key_here
 * LASERSTREAM_ENDPOINT=grpc.laserstream.io:443
 */
class LaserStreamClient {
  constructor(apiKey, endpoint = "grpc.laserstream.io:443") {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.client = null;
    this.stream = null;
    this.subscriptions = new Map();
    this.running = false;

    // Check if gRPC dependencies are available
    this.isAvailable = this.checkDependencies();
  }

  checkDependencies() {
    try {
      require("@grpc/grpc-js");
      require("@grpc/proto-loader");
      return true;
    } catch (error) {
      console.warn(
        "⚠️  LaserStream dependencies not installed. Install with: npm install @grpc/grpc-js @grpc/proto-loader"
      );
      return false;
    }
  }

  async connect() {
    if (!this.isAvailable) {
      throw new Error("LaserStream dependencies not available");
    }

    console.log(`📡 Connecting to LaserStream: ${this.endpoint}`);

    try {
      // Load protocol buffer definitions
      // Note: You'll need to obtain the .proto files from LaserStream documentation
      const protoPath = path.join(__dirname, "../proto/laserstream.proto");

      if (!fs.existsSync(protoPath)) {
        throw new Error(
          `Protocol buffer definition not found at ${protoPath}. Please obtain from LaserStream documentation.`
        );
      }

      const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const laserProto =
        grpc.loadPackageDefinition(packageDefinition).laserstream;

      // Create SSL credentials
      const credentials = grpc.credentials.createSsl();

      // Create client with authentication
      const metadata = new grpc.Metadata();
      metadata.add("x-api-key", this.apiKey);

      this.client = new laserProto.LaserStream(this.endpoint, credentials);

      console.log("✅ LaserStream client connected");
      this.running = true;
    } catch (error) {
      console.error(`Failed to connect to LaserStream: ${error.message}`);
      throw error;
    }
  }

  async subscribeToAccount(accountPubkey, callback) {
    if (!this.client) {
      throw new Error("Client not connected. Call connect() first.");
    }

    console.log(
      `📬 Subscribing to account: ${accountPubkey.substring(0, 8)}...`
    );

    try {
      const metadata = new grpc.Metadata();
      metadata.add("x-api-key", this.apiKey);

      // Create subscription request
      const request = {
        accounts: [accountPubkey],
        commitment: "confirmed",
      };

      // Create stream
      const stream = this.client.subscribe(request, metadata);

      // Handle stream events
      stream.on("data", (update) => {
        try {
          callback(update);
        } catch (error) {
          console.error(`Error in stream callback: ${error.message}`);
        }
      });

      stream.on("error", (error) => {
        console.error(
          `Stream error for ${accountPubkey.substring(0, 8)}...: ${
            error.message
          }`
        );

        // Attempt to resubscribe
        if (this.running) {
          console.log("Attempting to resubscribe...");
          setTimeout(() => {
            this.subscribeToAccount(accountPubkey, callback);
          }, 5000);
        }
      });

      stream.on("end", () => {
        console.log(`Stream ended for ${accountPubkey.substring(0, 8)}...`);
        this.subscriptions.delete(accountPubkey);
      });

      // Store subscription
      this.subscriptions.set(accountPubkey, stream);

      console.log(
        `✅ Subscribed to account ${accountPubkey.substring(0, 8)}...`
      );
      return true;
    } catch (error) {
      console.error(`Failed to subscribe to account: ${error.message}`);
      throw error;
    }
  }

  async subscribeToProgram(programPubkey, callback) {
    if (!this.client) {
      throw new Error("Client not connected. Call connect() first.");
    }

    console.log(
      `📬 Subscribing to program: ${programPubkey.substring(0, 8)}...`
    );

    try {
      const metadata = new grpc.Metadata();
      metadata.add("x-api-key", this.apiKey);

      // Create subscription request
      const request = {
        programs: [programPubkey],
        commitment: "confirmed",
      };

      // Create stream
      const stream = this.client.subscribe(request, metadata);

      // Handle stream events
      stream.on("data", (update) => {
        try {
          callback(update);
        } catch (error) {
          console.error(`Error in stream callback: ${error.message}`);
        }
      });

      stream.on("error", (error) => {
        console.error(
          `Stream error for program ${programPubkey.substring(0, 8)}...: ${
            error.message
          }`
        );

        // Attempt to resubscribe
        if (this.running) {
          console.log("Attempting to resubscribe...");
          setTimeout(() => {
            this.subscribeToProgram(programPubkey, callback);
          }, 5000);
        }
      });

      stream.on("end", () => {
        console.log(
          `Stream ended for program ${programPubkey.substring(0, 8)}...`
        );
      });

      console.log(
        `✅ Subscribed to program ${programPubkey.substring(0, 8)}...`
      );
      return true;
    } catch (error) {
      console.error(`Failed to subscribe to program: ${error.message}`);
      throw error;
    }
  }

  async unsubscribe(accountPubkey) {
    const stream = this.subscriptions.get(accountPubkey);
    if (stream) {
      stream.cancel();
      this.subscriptions.delete(accountPubkey);
      console.log(`✅ Unsubscribed from ${accountPubkey.substring(0, 8)}...`);
      return true;
    }
    return false;
  }

  async disconnect() {
    console.log("🛑 Disconnecting LaserStream client...");
    this.running = false;

    // Cancel all active subscriptions
    for (const [account, stream] of this.subscriptions.entries()) {
      try {
        stream.cancel();
        console.log(`Cancelled subscription for ${account.substring(0, 8)}...`);
      } catch (error) {
        console.error(`Error cancelling subscription: ${error.message}`);
      }
    }

    this.subscriptions.clear();

    // Close client
    if (this.client) {
      try {
        this.client.close();
      } catch (error) {
        console.error(`Error closing client: ${error.message}`);
      }
      this.client = null;
    }

    console.log("✅ LaserStream client disconnected");
  }

  isConnected() {
    return this.client !== null && this.running;
  }

  getActiveSubscriptions() {
    return Array.from(this.subscriptions.keys());
  }

  getSubscriptionCount() {
    return this.subscriptions.size;
  }
}

/**
 * Factory function to create LaserStream client if dependencies are available
 * @param {string} apiKey - LaserStream API key
 * @param {string} endpoint - gRPC endpoint
 * @returns {LaserStreamClient|null} - Client instance or null if dependencies not available
 */
function createLaserStreamClient(apiKey, endpoint) {
  if (!apiKey) {
    console.warn(
      "⚠️  LASERSTREAM_API_KEY not set - LaserStream streaming disabled"
    );
    return null;
  }

  try {
    const client = new LaserStreamClient(apiKey, endpoint);
    if (client.isAvailable) {
      return client;
    } else {
      console.warn(
        "⚠️  LaserStream dependencies not available - streaming disabled"
      );
      return null;
    }
  } catch (error) {
    console.error(`Failed to create LaserStream client: ${error.message}`);
    return null;
  }
}

module.exports = {
  LaserStreamClient,
  createLaserStreamClient,
};
