/**
 * Token Monitoring Webhook Adapter
 * Modifies the token_monitoring.js to send data to our backend
 */

const axios = require("axios");

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

/**
 * Send new token to backend webhook
 * @param {Object} tokenData - Token data from monitoring
 */
async function sendTokenToBackend(tokenData) {
  try {
    const payload = {
      address: tokenData.token_address,
      name: tokenData.token_name,
      symbol: tokenData.token_symbol,
      price: parseFloat(tokenData.token_price) || 0,
      liquidity: parseFloat(tokenData.token_liquidity) || 0,
      marketCap: parseFloat(tokenData.token_market_cap) || 0,
      age: 0, // Calculate from timestamp if available
      lpBurn: tokenData.lpBurn || "0",
      mintAuthority: tokenData.mint_authority_status,
      freezeAuthority: tokenData.freeze_authority_status,
      dev: tokenData.dev || "",
      exchange: tokenData.token_exchange || "Unknown",
      poolAddress: "", // Add if available
      website: tokenData.website || "",
      twitter: tokenData.twitter || "",
      telegram: tokenData.telegram || "",
    };

    console.log(
      `[Webhook Adapter] Sending token ${payload.symbol} to backend...`
    );

    const response = await axios.post(
      `${BACKEND_URL}/api/trading/webhook/new-token`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": WEBHOOK_SECRET,
        },
        timeout: 10000,
      }
    );

    if (response.data.success) {
      console.log(
        `[Webhook Adapter] Token ${payload.symbol} sent successfully`
      );
      return true;
    } else {
      console.error(
        `[Webhook Adapter] Backend rejected token: ${response.data.error}`
      );
      return false;
    }
  } catch (error) {
    console.error(
      `[Webhook Adapter] Error sending token to backend:`,
      error.message
    );
    return false;
  }
}

/**
 * Send emergency event to backend webhook
 * @param {Object} eventData - Emergency event data
 */
async function sendEmergencyEvent(eventData) {
  try {
    console.log(
      `[Webhook Adapter] Sending emergency event ${eventData.eventType} for ${eventData.tokenMint}...`
    );

    const response = await axios.post(
      `${BACKEND_URL}/api/trading/webhook/emergency`,
      eventData,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": WEBHOOK_SECRET,
        },
        timeout: 10000,
      }
    );

    if (response.data.success) {
      console.log(`[Webhook Adapter] Emergency event sent successfully`);
      return true;
    } else {
      console.error(
        `[Webhook Adapter] Backend rejected emergency event: ${response.data.error}`
      );
      return false;
    }
  } catch (error) {
    console.error(
      `[Webhook Adapter] Error sending emergency event:`,
      error.message
    );
    return false;
  }
}

module.exports = {
  sendTokenToBackend,
  sendEmergencyEvent,
};
