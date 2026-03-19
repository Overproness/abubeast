/**
 * API Key Manager for rotating between Mobula and Moralis APIs
 * Handles rate limiting and fallback mechanisms
 */

class ApiKeyManager {
  constructor() {
    // Mobula API Keys (rotate to avoid rate limits even though they claim no limits)
    this.mobulaKeys = [
      "05af5fe9-c6a2-4677-8491-fa1bea364fc1", // current one
      "2db058e9-dc03-4368-bc09-cf0c2adbcaa1",
      "50a7c029-1dcd-4713-9ee3-d74aaca5988e",
    ];

    // Moralis API Keys
    this.moralisKeys = [
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjBhOGYyNjUwLWEzODYtNGQzNC05MDIyLTJjOGQ3N2ZkODg0YSIsIm9yZ0lkIjoiNDU1OTY4IiwidXNlcklkIjoiNDY5MTMyIiwidHlwZUlkIjoiN2FmNmY3MTItMmJkNi00YTUxLThkNzctMjA2ZDk0ZTU5ZDdmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTA5NjY1ODcsImV4cCI6NDkwNjcyNjU4N30.razmcbOMMFJ87I-QipQuc-cMGP76D4ZcwqB-aZplYuY",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImRhZWQ2OWY3LTQ4YjEtNGI0NC04NGY3LTVhMzIyNjAwYWJmZiIsIm9yZ0lkIjoiNDMyOTY2IiwidXNlcklkIjoiNDQ1Mzc5IiwidHlwZUlkIjoiOTgzYWE1OTYtYmE4Ny00NDMwLTgwZDgtNDU3MWU5ODkzOTA0IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDAyMzMzNjQsImV4cCI6NDg5NTk5MzM2NH0.adR5b9jUVAeVhWO893TlbdUbpJBelA2AU-TxLBRcxnw",
    ];

    // Track current key indices
    this.currentMobulaIndex = 0;
    this.currentMoralisIndex = 0;

    // Track rate limiting and errors
    this.keyMetrics = {
      mobula: this.mobulaKeys.map(() => ({
        requests: 0,
        errors: 0,
        lastError: null,
        rateLimited: false,
        rateLimitReset: null,
      })),
      moralis: this.moralisKeys.map(() => ({
        requests: 0,
        errors: 0,
        lastError: null,
        rateLimited: false,
        rateLimitReset: null,
      })),
    };

    // Rate limiting thresholds
    this.MOBULA_REQUEST_LIMIT = 50; // requests per key before rotation (Mobula claims no limits but does apply them)
    this.MORALIS_REQUEST_LIMIT = 100; // requests per key before rotation
    this.RATE_LIMIT_RESET_TIME = 60 * 1000; // 1 minute
    this.API_TIMEOUT = 15000; // 15 seconds (increased for better reliability)
    this.FAST_ROTATION_THRESHOLD = 10; // Switch keys after this many requests for more aggressive rotation
  }

  /**
   * Get next available Mobula API key
   */
  getNextMobulaKey() {
    const startIndex = this.currentMobulaIndex;

    do {
      const keyMetric = this.keyMetrics.mobula[this.currentMobulaIndex];

      // Check if key is rate limited and if reset time has passed
      if (
        keyMetric.rateLimited &&
        keyMetric.rateLimitReset &&
        Date.now() > keyMetric.rateLimitReset
      ) {
        keyMetric.rateLimited = false;
        keyMetric.requests = 0;
        keyMetric.errors = 0;
      }

      // Check if key is available (use fast rotation for better distribution)
      if (
        !keyMetric.rateLimited &&
        keyMetric.requests < this.FAST_ROTATION_THRESHOLD
      ) {
        const key = this.mobulaKeys[this.currentMobulaIndex];
        keyMetric.requests++;
        return { key, index: this.currentMobulaIndex };
      }

      // Move to next key
      this.currentMobulaIndex =
        (this.currentMobulaIndex + 1) % this.mobulaKeys.length;
    } while (this.currentMobulaIndex !== startIndex);

    // If all keys are rate limited, return the first one and mark it for reset
    const firstKeyMetric = this.keyMetrics.mobula[0];
    firstKeyMetric.rateLimited = false;
    firstKeyMetric.requests = 1;
    this.currentMobulaIndex = 0;

    return { key: this.mobulaKeys[0], index: 0 };
  }

  /**
   * Get next available Moralis API key
   */
  getNextMoralisKey() {
    const startIndex = this.currentMoralisIndex;

    do {
      const keyMetric = this.keyMetrics.moralis[this.currentMoralisIndex];

      // Check if key is rate limited and if reset time has passed
      if (
        keyMetric.rateLimited &&
        keyMetric.rateLimitReset &&
        Date.now() > keyMetric.rateLimitReset
      ) {
        keyMetric.rateLimited = false;
        keyMetric.requests = 0;
        keyMetric.errors = 0;
      }

      // Check if key is available
      if (
        !keyMetric.rateLimited &&
        keyMetric.requests < this.MORALIS_REQUEST_LIMIT
      ) {
        const key = this.moralisKeys[this.currentMoralisIndex];
        keyMetric.requests++;
        return { key, index: this.currentMoralisIndex };
      }

      // Move to next key
      this.currentMoralisIndex =
        (this.currentMoralisIndex + 1) % this.moralisKeys.length;
    } while (this.currentMoralisIndex !== startIndex);

    // If all keys are rate limited, return the first one and mark it for reset
    const firstKeyMetric = this.keyMetrics.moralis[0];
    firstKeyMetric.rateLimited = false;
    firstKeyMetric.requests = 1;
    this.currentMoralisIndex = 0;

    return { key: this.moralisKeys[0], index: 0 };
  }

  /**
   * Mark a key as rate limited or errored
   */
  markKeyError(provider, keyIndex, error) {
    const keyMetric = this.keyMetrics[provider][keyIndex];
    keyMetric.errors++;
    keyMetric.lastError = error;

    // Check if it's a rate limit error
    if (
      error.response?.status === 429 ||
      error.message.includes("rate limit")
    ) {
      keyMetric.rateLimited = true;
      keyMetric.rateLimitReset = Date.now() + this.RATE_LIMIT_RESET_TIME;
      console.warn(
        `${provider} key ${keyIndex} rate limited. Reset at:`,
        new Date(keyMetric.rateLimitReset)
      );
    }

    // If too many errors, temporarily disable the key
    if (keyMetric.errors >= 5) {
      keyMetric.rateLimited = true;
      keyMetric.rateLimitReset = Date.now() + this.RATE_LIMIT_RESET_TIME;
      console.warn(
        `${provider} key ${keyIndex} disabled due to errors. Reset at:`,
        new Date(keyMetric.rateLimitReset)
      );
    }
  }

  /**
   * Get metrics for monitoring
   */
  getMetrics() {
    return {
      mobula: {
        currentIndex: this.currentMobulaIndex,
        keys: this.keyMetrics.mobula.map((metric, index) => ({
          index,
          ...metric,
        })),
      },
      moralis: {
        currentIndex: this.currentMoralisIndex,
        keys: this.keyMetrics.moralis.map((metric, index) => ({
          index,
          ...metric,
        })),
      },
    };
  }

  /**
   * Reset all metrics (useful for debugging)
   */
  resetMetrics() {
    this.keyMetrics.mobula.forEach((metric) => {
      metric.requests = 0;
      metric.errors = 0;
      metric.lastError = null;
      metric.rateLimited = false;
      metric.rateLimitReset = null;
    });

    this.keyMetrics.moralis.forEach((metric) => {
      metric.requests = 0;
      metric.errors = 0;
      metric.lastError = null;
      metric.rateLimited = false;
      metric.rateLimitReset = null;
    });

    this.currentMobulaIndex = 0;
    this.currentMoralisIndex = 0;
  }

  /**
   * Force switch to next available key for a provider
   */
  forceKeySwitch(provider) {
    if (provider === "mobula") {
      this.currentMobulaIndex =
        (this.currentMobulaIndex + 1) % this.mobulaKeys.length;
    } else if (provider === "moralis") {
      this.currentMoralisIndex =
        (this.currentMoralisIndex + 1) % this.moralisKeys.length;
    }
  }

  /**
   * Check if Mobula is currently experiencing issues (many keys rate limited/errored)
   */
  isMobulaHealthy() {
    const totalKeys = this.mobulaKeys.length;
    const problematicKeys = this.keyMetrics.mobula.filter(
      (metric) => metric.rateLimited || metric.errors >= 3
    ).length;

    // If more than half the keys are problematic, consider Mobula unhealthy
    return problematicKeys < totalKeys / 2;
  }

  /**
   * Get the best available provider based on current status
   */
  getBestProvider() {
    if (this.isMobulaHealthy()) {
      return "mobula";
    }
    return "moralis";
  }

  /**
   * Mark successful request for monitoring
   */
  markSuccess(provider, keyIndex) {
    const keyMetric = this.keyMetrics[provider][keyIndex];
    // Reset error count on successful request
    if (keyMetric.errors > 0) {
      keyMetric.errors = Math.max(0, keyMetric.errors - 1);
    }
  }
}

// Create singleton instance
const apiKeyManager = new ApiKeyManager();

export default apiKeyManager;
