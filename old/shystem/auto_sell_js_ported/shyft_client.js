// Shyft Client - JavaScript Port
// Port of shyft_client.rs

const axios = require("axios");

class ShyftClient {
  constructor(apiKey, baseUrl = "https://api.shyft.to") {
    this.client = axios.create({
      timeout: 15000, // 15 second timeout
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createCallback(address, callbackUrl) {
    const url = `${this.baseUrl}/callback/create`;

    // Extract base callback URL (remove paths)
    let baseCallbackUrl = callbackUrl;
    const slashCount = (callbackUrl.match(/\//g) || []).length;
    if (slashCount > 2) {
      const parts = callbackUrl.split("/");
      baseCallbackUrl = `${parts[0]}//${parts[2]}`;
    }

    const payload = {
      network: "mainnet-beta",
      addresses: [address],
      callback_url: baseCallbackUrl,
      enable_raw: true,
      enable_events: false,
    };

    console.log(`Creating Shyft callback for address ${address}`);
    console.log(`Using base callback URL: ${baseCallbackUrl}`);
    console.log(`Payload: ${JSON.stringify(payload)}`);

    try {
      const response = await this.client.post(url, payload);
      const data = response.data;

      console.log(
        `Shyft callback created successfully: ${JSON.stringify(data)}`
      );

      return {
        success: true,
        callbackId: data.result?.id || null,
        responseData: data,
        errorMessage: null,
      };
    } catch (error) {
      const status = error.response?.status || "unknown";
      const responseText = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;

      console.error(
        `Failed to create Shyft callback: ${status} - ${responseText}`
      );

      return {
        success: false,
        callbackId: null,
        responseData: null,
        errorMessage: `API error: ${status} - ${responseText}`,
      };
    }
  }

  async deleteCallback(callbackId) {
    const url = `${this.baseUrl}/callback/remove`;

    const payload = {
      id: callbackId,
    };

    console.log(`Deleting Shyft callback: ${callbackId}`);

    try {
      const response = await this.client.delete(url, { data: payload });
      const data = response.data;

      console.log(`Shyft delete callback response: ${JSON.stringify(data)}`);

      return {
        success: true,
        callbackId,
        responseData: data,
        errorMessage: null,
      };
    } catch (error) {
      const status = error.response?.status || "unknown";
      const responseText = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;

      console.error(
        `Failed to delete Shyft callback: ${status} - ${responseText}`
      );

      return {
        success: false,
        callbackId,
        responseData: null,
        errorMessage: `API error: ${status} - ${responseText}`,
      };
    }
  }

  async listCallbacks() {
    const url = `${this.baseUrl}/callback/list`;

    console.log("Listing Shyft callbacks");

    try {
      const response = await this.client.get(url);
      const data = response.data;

      console.log("Shyft list callbacks response status: success");
      console.debug(`Shyft list callbacks response: ${JSON.stringify(data)}`);

      return {
        success: true,
        callbackId: null,
        responseData: data,
        errorMessage: null,
      };
    } catch (error) {
      const status = error.response?.status || "unknown";
      const responseText = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;

      console.error(
        `Failed to list Shyft callbacks: ${status} - ${responseText}`
      );

      return {
        success: false,
        callbackId: null,
        responseData: null,
        errorMessage: `API error: ${status} - ${responseText}`,
      };
    }
  }
}

module.exports = { ShyftClient };
