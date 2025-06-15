import { ethers } from "ethers";

export function createProvider(ethereum) {
  try {
    // Try ethers v6 API first
    if (typeof ethers.BrowserProvider === "function") {
      return new ethers.BrowserProvider(ethereum);
    }
    // Fallback to ethers v5 API
    else if (typeof ethers.providers?.Web3Provider === "function") {
      return new ethers.providers.Web3Provider(ethereum);
    }
    // Last resort, throw an informative error
    else {
      throw new Error(
        "Incompatible ethers.js version. Please install ethers v6."
      );
    }
  } catch (error) {
    console.error("Error creating provider:", error);
    throw error;
  }
}

export async function getSignerFromProvider(provider) {
  // Check if it's a v6 provider (getSigner returns a Promise)
  if (provider.getSigner && typeof provider.getSigner().then === "function") {
    return await provider.getSigner();
  }
  // It's a v5 provider (getSigner returns the signer directly)
  else if (provider.getSigner) {
    return provider.getSigner();
  } else {
    throw new Error("Incompatible provider object");
  }
}
